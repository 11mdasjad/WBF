import test, { beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFile, readdir, mkdir } from "node:fs/promises";
import { build } from "esbuild";
import { createHmac } from "node:crypto";
import bcrypt from "bcryptjs";
await mkdir("outputs", { recursive: true });
await build({
  entryPoints: ["lib/server/api.ts"],
  outfile: "outputs/test-api.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  plugins: [
    {
      name: "test-worker-environment",
      setup(b) {
        b.onResolve({ filter: /^cloudflare:workers$/ }, () => ({
          path: "env",
          namespace: "test",
        }));
        b.onLoad({ filter: /.*/, namespace: "test" }, () => ({
          contents: "export const env=globalThis.__WBF_TEST_ENV;",
          loader: "js",
        }));
      },
    },
  ],
});
const config = {
  SETUP_TOKEN: "test-only-bootstrap-token-at-least-32-characters",
};
globalThis.__WBF_TEST_ENV = config;
const { handle } = await import("../outputs/test-api.mjs");
const migrations = (await readdir("drizzle"))
  .filter((x) => x.endsWith(".sql"))
  .sort();
const sql = (
  await Promise.all(migrations.map((x) => readFile("drizzle/" + x, "utf8")))
).join("\n");
let sqlite, objects;
class Statement {
  constructor(sql, args = []) {
    this.sql = sql;
    this.args = args;
  }
  bind(...args) {
    return new Statement(this.sql, args);
  }
  async first() {
    return sqlite.prepare(this.sql).get(...this.args) ?? null;
  }
  async all() {
    return { results: sqlite.prepare(this.sql).all(...this.args) };
  }
  async run() {
    const meta = sqlite.prepare(this.sql).run(...this.args);
    return { success: true, meta: { changes: Number(meta.changes) } };
  }
}
const db = {
  prepare(sql) {
    return new Statement(sql);
  },
  async batch(items) {
    sqlite.exec("BEGIN");
    try {
      const out = [];
      for (const s of items) out.push(await s.run());
      sqlite.exec("COMMIT");
      return out;
    } catch (e) {
      sqlite.exec("ROLLBACK");
      throw e;
    }
  },
};
beforeEach(() => {
  sqlite?.close();
  sqlite = new DatabaseSync(":memory:");
  sqlite.exec(sql);
  config.DB = db;
  config.RAZORPAY_TEST_ENABLED = "false";
  delete config.RESEND_API_KEY;
  objects = new Map();
  config.BUCKET = {
    put: async (k, b) => objects.set(k, b),
    get: async (k) => (objects.has(k) ? { body: objects.get(k) } : null),
    delete: async (k) => objects.delete(k),
  };
});
after(() => sqlite?.close());
const origin = "https://wbf.test";
async function request(
  path,
  { method = "GET", data, cookie, originValue = origin, headers = {} } = {},
) {
  const h = { origin: originValue, ...headers };
  if (cookie) h.cookie = cookie;
  if (data && !(data instanceof FormData))
    h["content-type"] = "application/json";
  const res = await handle(
    new Request(origin + "/api/" + path, {
      method,
      headers: h,
      ...(data
        ? { body: data instanceof FormData ? data : JSON.stringify(data) }
        : {}),
    }),
  );
  const type = res.headers.get("content-type") || "";
  return {
    status: res.status,
    data: type.includes("json") ? await res.json() : await res.text(),
    cookie: res.headers.get("set-cookie")?.split(";")[0],
    headers: res.headers,
  };
}
const pass = "A test password that is long!";
async function admin() {
  let r = await request("setup", {
    method: "POST",
    headers: { "x-setup-token": config.SETUP_TOKEN },
    data: { name: "Test Admin", email: "admin@example.test", password: pass },
  });
  assert.equal(r.status, 201);
  r = await request("auth/login", {
    method: "POST",
    data: { email: "admin@example.test", password: pass },
  });
  assert.equal(r.status, 200);
  return r.cookie;
}
async function member(email = "member@example.test", verified = true) {
  const r = await request("auth/register", {
    method: "POST",
    data: {
      name: "Test Member",
      email,
      password: pass,
      consent: true,
      role: "admin",
    },
  });
  assert.equal(r.status, 201);
  if (verified)
    sqlite.prepare("UPDATE users SET verified=1 WHERE email=?").run(email);
  return r.cookie;
}
const application = {
  kind: "volunteer",
  name: "Test Applicant",
  email: "member@example.test",
  phone: "+91 9000000000",
  consent: true,
  data: {
    city: "Delhi",
    interests: ["Education & skills"],
    availability: "Weekends",
    skills: "Teaching",
  },
};

test("public seed persists eight correct focus areas, no invented impact metrics", async () => {
  const r = await request("public");
  assert.equal(r.status, 200);
  assert.equal(r.data.content.filter((x) => x.kind === "program").length, 8);
  assert.equal(r.data.content.filter((x) => x.kind === "metric").length, 0);
  assert.equal(r.data.paymentsEnabled, false);
  assert.ok(r.data.content.some((x) => x.slug === "legal-aid-human-rights"));
  await request("public");
  assert.equal(
    sqlite.prepare("SELECT count(*) n FROM content WHERE kind='program'").get()
      .n,
    8,
  );
});
test("bootstrap requires secret and is permanently single use", async () => {
  assert.equal(
    (await request("setup", { method: "POST", data: {} })).status,
    403,
  );
  await admin();
  assert.equal(
    (
      await request("setup", {
        method: "POST",
        headers: { "x-setup-token": config.SETUP_TOKEN },
        data: {},
      })
    ).status,
    409,
  );
});
test("registration hashes passwords and never accepts requested admin role", async () => {
  const cookie = await member();
  const row = sqlite
    .prepare("SELECT * FROM users WHERE email='member@example.test'")
    .get();
  assert.notEqual(row.password, pass);
  assert.equal(await bcrypt.compare(pass, row.password), true);
  const r = await request("auth/me", { cookie });
  assert.deepEqual(r.data.user.roles, ["member"]);
  assert.equal((await request("admin/users", { cookie })).status, 403);
  assert.equal(r.data.user.password, undefined);
});
test("rejects weak passwords, invalid emails, missing consent and duplicate accounts", async () => {
  for (const data of [
    { name: "A", email: "bad", password: pass, consent: true },
    { name: "A", email: "a@b.test", password: "short", consent: true },
    { name: "A", email: "a@b.test", password: pass, consent: false },
  ])
    assert.equal(
      (await request("auth/register", { method: "POST", data })).status,
      400,
    );
  await member();
  assert.equal(
    (
      await request("auth/register", {
        method: "POST",
        data: {
          name: "A",
          email: "member@example.test",
          password: pass,
          consent: true,
        },
      })
    ).status,
    409,
  );
});
test("sessions are HttpOnly, expire, and logout revokes access", async () => {
  const cookie = await member();
  const login = await request("auth/login", {
    method: "POST",
    data: { email: "member@example.test", password: pass },
  });
  assert.match(login.headers.get("set-cookie"), /HttpOnly/);
  assert.match(login.headers.get("set-cookie"), /Secure/);
  assert.equal((await request("profile", { cookie })).status, 200);
  await request("auth/logout", { method: "POST", data: {}, cookie });
  assert.equal((await request("profile", { cookie })).status, 401);
  sqlite.prepare("UPDATE sessions SET expires_at='2000-01-01'").run();
  assert.equal(
    (await request("profile", { cookie: login.cookie })).status,
    401,
  );
});
test("CSRF origin and unauthenticated admin protections apply", async () => {
  assert.equal(
    (
      await request("contact", {
        method: "POST",
        originValue: "https://evil.test",
        data: {
          name: "A",
          email: "a@b.test",
          subject: "Test",
          message: "Test",
        },
      })
    ).status,
    403,
  );
  for (const path of [
    "admin/users",
    "admin/donations",
    "admin/applications",
    "admin/inbox",
    "admin/settings",
    "admin/media",
    "admin/audit",
  ])
    assert.equal((await request(path)).status, 401);
});
test("verification token is single use and missing delivery is queued, never falsely sent", async () => {
  const cookie = await member("member@example.test", false);
  assert.equal(
    (
      await request("applications", {
        method: "POST",
        cookie,
        data: application,
      })
    ).status,
    403,
  );
  const mail = sqlite
    .prepare(
      "SELECT * FROM notifications WHERE subject='Verify your WBF account'",
    )
    .get();
  assert.equal(mail.status, "queued");
  const token = mail.body.match(/token=([a-f0-9]+)/)[1];
  assert.equal(
    (await request("auth/verify", { method: "POST", data: { token } })).status,
    200,
  );
  assert.equal(
    (await request("auth/verify", { method: "POST", data: { token } })).status,
    400,
  );
  assert.equal((await request("auth/me", { cookie })).data.user.verified, 1);
});
test("password reset revokes all sessions and rejects reuse", async () => {
  const cookie = await member();
  await request("auth/forgot", {
    method: "POST",
    data: { email: "member@example.test" },
  });
  const mail = sqlite
    .prepare(
      "SELECT body FROM notifications WHERE subject='Reset your WBF password'",
    )
    .get();
  const token = mail.body.match(/token=([a-f0-9]+)/)[1];
  assert.equal(
    (
      await request("auth/reset", {
        method: "POST",
        data: { token, password: pass + "new" },
      })
    ).status,
    200,
  );
  assert.equal((await request("profile", { cookie })).status, 401);
  assert.equal(
    (
      await request("auth/reset", {
        method: "POST",
        data: { token, password: pass },
      })
    ).status,
    400,
  );
});
test("application validation, persistence, deduplication, review and history", async () => {
  const staff = await admin(),
    cookie = await member();
  assert.equal(
    (
      await request("applications", {
        method: "POST",
        cookie,
        data: { ...application, data: {} },
      })
    ).status,
    400,
  );
  const r = await request("applications", {
    method: "POST",
    cookie,
    data: application,
  });
  assert.equal(r.status, 201);
  const duplicate = await request("applications", {
    method: "POST",
    cookie,
    data: application,
  });
  assert.equal(duplicate.data.reference, r.data.reference);
  assert.equal(duplicate.data.duplicate, true);
  const a = (await request("admin/applications", { cookie: staff })).data
    .items[0];
  assert.equal(
    (
      await request("admin/applications/" + a.id, {
        method: "PATCH",
        cookie: staff,
        data: {
          status: "approved",
          notes: "Internal private note",
          message: "Welcome to the team",
        },
      })
    ).status,
    200,
  );
  const profile = (await request("profile", { cookie })).data;
  assert.equal(profile.applications[0].status, "approved");
  assert.equal(profile.applications[0].notes, undefined);
  assert.equal(profile.history.length, 2);
  assert.equal(profile.history[0].message, "Welcome to the team");
});
test("members cannot access or withdraw another member’s application", async () => {
  const a = await member("one@example.test"),
    b = await member("two@example.test");
  await request("applications", {
    method: "POST",
    cookie: a,
    data: { ...application, email: "one@example.test" },
  });
  const row = sqlite.prepare("SELECT id FROM applications").get();
  assert.equal(
    (
      await request("applications/" + row.id, {
        method: "PATCH",
        cookie: b,
        data: {},
      })
    ).status,
    404,
  );
  assert.equal(
    (await request("profile", { cookie: b })).data.applications.length,
    0,
  );
});
test("admin permissions restrict content editors and deactivation revokes access", async () => {
  const staff = await admin(),
    cookie = await member();
  const user = sqlite
    .prepare("SELECT id FROM users WHERE email='member@example.test'")
    .get();
  assert.equal(
    (
      await request("admin/users/" + user.id, {
        method: "PATCH",
        cookie: staff,
        data: { role: "editor", active: true, verified: true },
      })
    ).status,
    200,
  );
  assert.equal((await request("profile", { cookie })).status, 401);
  const editor = (
    await request("auth/login", {
      method: "POST",
      data: { email: "member@example.test", password: pass },
    })
  ).cookie;
  assert.equal(
    (await request("admin/content", { cookie: editor })).status,
    200,
  );
  assert.equal(
    (await request("admin/donations", { cookie: editor })).status,
    403,
  );
  assert.equal((await request("admin/users", { cookie: editor })).status, 403);
});
test("CMS drafts stay private, publishing appears publicly, revisions are retained", async () => {
  const cookie = await admin();
  const draft = {
    kind: "post",
    slug: "test-story",
    title: "A test story",
    summary: "Summary",
    body: "Safe text <script>not HTML</script>",
    status: "draft",
    data: {},
  };
  const c = await request("admin/content", {
    method: "POST",
    cookie,
    data: draft,
  });
  assert.equal(c.status, 201);
  assert.equal(
    (await request("public")).data.content.some((x) => x.slug === "test-story"),
    false,
  );
  await request("admin/content/" + c.data.id, {
    method: "PATCH",
    cookie,
    data: { ...draft, status: "published" },
  });
  assert.equal(
    (await request("public")).data.content.some((x) => x.slug === "test-story"),
    true,
  );
  assert.equal(
    sqlite.prepare("SELECT count(*) n FROM content_revisions").get().n,
    1,
  );
  await request("admin/content/" + c.data.id, {
    method: "DELETE",
    cookie,
    data: {},
  });
  assert.equal(
    (await request("public")).data.content.some((x) => x.slug === "test-story"),
    false,
  );
});
test("published impact metrics require source and reporting period; unsafe URLs rejected", async () => {
  const cookie = await admin();
  const metric = {
    kind: "metric",
    slug: "test-metric",
    title: "Test",
    status: "published",
    data: { value: "500" },
  };
  assert.equal(
    (await request("admin/content", { method: "POST", cookie, data: metric }))
      .status,
    400,
  );
  assert.equal(
    (
      await request("admin/content", {
        method: "POST",
        cookie,
        data: {
          ...metric,
          source: "javascript:alert(1)",
          data: { value: "500", period: "2026" },
        },
      })
    ).status,
    400,
  );
});
test("contact messages persist, validate, reject bots and remain staff-only", async () => {
  const payload = {
    name: "Test Contact",
    email: "contact@example.test",
    subject: "Hello",
    message: "Please contact me.",
  };
  assert.equal(
    (
      await request("contact", {
        method: "POST",
        data: { ...payload, website: "spam" },
      })
    ).status,
    400,
  );
  assert.equal(
    (await request("contact", { method: "POST", data: payload })).status,
    201,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM contacts").get().n, 1);
  const cookie = await member();
  assert.equal((await request("admin/inbox", { cookie })).status, 403);
});
test("SQL injection cannot bypass authentication and searches are parameterized", async () => {
  await member();
  assert.equal(
    (
      await request("auth/login", {
        method: "POST",
        data: { email: "x' OR 1=1--@x.test", password: pass },
      })
    ).status,
    400,
  );
  const cookie = await admin();
  const r = await request(
    "admin/users?q=" + encodeURIComponent("' OR 1=1 --"),
    { cookie },
  );
  assert.equal(r.status, 200);
  assert.equal(r.data.items.length, 0);
});
test("media enforces format signatures, size and private access", async () => {
  const cookie = await admin();
  const bad = new FormData();
  bad.append(
    "file",
    new File(["<script>bad</script>"], "bad.jpg", { type: "image/jpeg" }),
  );
  bad.append("alt", "Test");
  assert.equal(
    (await request("media", { method: "POST", cookie, data: bad })).status,
    400,
  );
  const good = new FormData();
  good.append(
    "file",
    new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "test.png", {
      type: "image/png",
    }),
  );
  good.append("alt", "A test image");
  good.append("visibility", "private");
  const r = await request("media", { method: "POST", cookie, data: good });
  assert.equal(r.status, 201);
  assert.equal((await request("media/" + r.data.id)).status, 401);
  assert.equal((await request("media/" + r.data.id, { cookie })).status, 200);
});
test("store totals come from server prices and quantities are bounded", async () => {
  const cookie = await member();
  const p = (await request("public")).data.content.find(
    (x) => x.kind === "product",
  );
  const r = await request("store/orders", {
    method: "POST",
    cookie,
    data: {
      address: "Test address, Delhi",
      amount: 1,
      items: [{ id: p.id, quantity: 2, price: 1 }],
    },
  });
  assert.equal(r.status, 201);
  const order = sqlite.prepare("SELECT * FROM store_orders").get();
  assert.equal(order.status, "inquiry");
  assert.ok(order.amount > 1);
  assert.equal(
    (
      await request("store/orders", {
        method: "POST",
        cookie,
        data: { address: "Test", items: [{ id: p.id, quantity: -1 }] },
      })
    ).status,
    400,
  );
});
test("payments fail closed without credentials; pending records have no receipt", async () => {
  const cookie = await member();
  assert.equal(
    (
      await request("donations/order", {
        method: "POST",
        cookie,
        data: { amount: 50000 },
      })
    ).status,
    503,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM receipts").get().n, 0);
  assert.equal(
    (await request("payments/webhook", { method: "POST", data: {} })).status,
    503,
  );
});
async function paymentFixture() {
  await request("public");
  const id = "payment-user";
  sqlite
    .prepare(
      "INSERT INTO users(id,name,email,password,created_at) VALUES(?,?,?,?,?)",
    )
    .run(
      id,
      "Test Donor",
      "donor@example.test",
      "unused",
      new Date().toISOString(),
    );
  sqlite
    .prepare(
      "INSERT INTO donations(id,user_id,name,email,amount,purpose,dedupe,created_at) VALUES('donation-test',?,'Donor','donor@example.test',50000,'Education','dedupe',?)",
    )
    .run(id, new Date().toISOString());
  sqlite
    .prepare(
      "INSERT INTO payment_orders(id,donation_id,provider_id,amount,currency,created_at) VALUES('order-local','donation-test','order_test',50000,'INR',?)",
    )
    .run(new Date().toISOString());
  config.RAZORPAY_TEST_ENABLED = "true";
  config.RAZORPAY_KEY_ID = "rzp_test_FAKE";
  config.RAZORPAY_KEY_SECRET = "fake-test-secret";
  config.RAZORPAY_WEBHOOK_SECRET = "fake-webhook-secret";
}
async function webhook(event, id = "event-test", signature) {
  const raw = JSON.stringify(event),
    sig =
      signature ??
      createHmac("sha256", config.RAZORPAY_WEBHOOK_SECRET)
        .update(raw)
        .digest("hex");
  return request("payments/webhook", {
    method: "POST",
    originValue: "https://api.razorpay.com",
    headers: { "x-razorpay-event-id": id, "x-razorpay-signature": sig },
    data: event,
  });
}
const captured = {
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test",
        order_id: "order_test",
        amount: 50000,
        currency: "INR",
        status: "captured",
      },
    },
  },
};
test("signed captured webhook is idempotent and produces one receipt/transaction", async () => {
  await paymentFixture();
  assert.equal((await webhook(captured)).status, 200);
  assert.equal((await webhook(captured)).data.duplicate, true);
  assert.equal((await webhook(captured, "event-second-id")).status, 200);
  assert.equal(
    sqlite.prepare("SELECT count(*) n FROM payment_transactions").get().n,
    1,
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM receipts").get().n, 1);
  assert.equal(
    sqlite.prepare("SELECT status FROM donations").get().status,
    "paid",
  );
});
test("invalid webhook signatures and amount mismatches cannot mark donations paid", async () => {
  await paymentFixture();
  assert.equal((await webhook(captured, "bad-signature", "bad")).status, 401);
  const mismatch = structuredClone(captured);
  mismatch.payload.payment.entity.amount = 1;
  assert.equal((await webhook(mismatch, "wrong-amount")).status, 400);
  assert.equal(
    sqlite.prepare("SELECT status FROM donations").get().status,
    "pending",
  );
  assert.equal(sqlite.prepare("SELECT count(*) n FROM receipts").get().n, 0);
});
test("payment failure after a captured payment cannot downgrade paid status", async () => {
  await paymentFixture();
  await webhook(captured);
  await webhook(
    { event: "payment.failed", payload: captured.payload },
    "late-failure",
  );
  assert.equal(
    sqlite.prepare("SELECT status FROM donations").get().status,
    "paid",
  );
});
test("receipts require owner or finance permission and actual paid state", async () => {
  const cookie = await member();
  await paymentFixture();
  await webhook(captured);
  const receipt = sqlite.prepare("SELECT id FROM receipts").get();
  assert.equal(
    (await request("receipts/" + receipt.id, { cookie })).status,
    404,
  );
  const staff = await admin();
  assert.equal(
    (await request("receipts/" + receipt.id, { cookie: staff })).status,
    200,
  );
  sqlite.prepare("UPDATE donations SET status='refunded'").run();
  assert.equal(
    (await request("receipts/" + receipt.id, { cookie: staff })).status,
    409,
  );
});
test("CSV exports neutralize spreadsheet formulas", async () => {
  const cookie = await admin();
  await request("contact", {
    method: "POST",
    data: {
      name: '=HYPERLINK("evil")',
      email: "test@example.test",
      subject: "Test",
      message: "Test",
    },
  });
  const r = await request("admin/inbox?export=csv", { cookie });
  assert.equal(r.status, 200);
  assert.match(r.data, /"'=HYPERLINK/);
});
test("login rate limiting is enforced after repeated failures", async () => {
  await member();
  let r;
  for (let i = 0; i < 9; i++)
    r = await request("auth/login", {
      method: "POST",
      data: { email: "member@example.test", password: "wrong" },
    });
  assert.equal(r.status, 429);
});

test("structured page sections preserve order and hidden text is excluded from public responses", async () => {
  const cookie = await admin();
  const draft = {
    kind: "page",
    slug: "test-page",
    title: "Test page",
    status: "published",
    data: {
      sections: [
        {
          id: "first",
          type: "text",
          title: "Visible first",
          body: "Public text",
          visible: true,
        },
        {
          id: "secret",
          type: "text",
          title: "Internal draft",
          body: "Not ready to publish",
          visible: false,
        },
        {
          id: "last",
          type: "text",
          title: "Visible last",
          body: "Public last",
          visible: true,
        },
      ],
    },
  };
  const r = await request("admin/content", {
    method: "POST",
    cookie,
    data: draft,
  });
  assert.equal(r.status, 201);
  const page = (await request("public")).data.content.find(
    (x) => x.slug === "test-page",
  );
  assert.deepEqual(
    page.data.sections.map((x) => x.id),
    ["first", "last"],
  );
  assert.equal(
    (await request("admin/content/" + r.data.id, { cookie })).data.item.data
      .sections.length,
    3,
  );
  const bad = {
    ...draft,
    slug: "unsafe-section",
    data: {
      sections: [
        {
          id: "bad",
          type: "callout",
          title: "Unsafe",
          body: "Example",
          visible: true,
          link: "javascript:alert(1)",
        },
      ],
    },
  };
  assert.equal(
    (await request("admin/content", { method: "POST", cookie, data: bad }))
      .status,
    400,
  );
});
test("applications must use their verified account email and correct opportunity type", async () => {
  const cookie = await member();
  assert.equal(
    (
      await request("applications", {
        method: "POST",
        cookie,
        data: { ...application, email: "someone-else@example.test" },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("applications", {
        method: "POST",
        cookie,
        data: {
          ...application,
          kind: "job",
          contentId: "program-education-skill",
        },
      })
    ).status,
    400,
  );
});

test("navigation edits are permission checked and reject unsafe destinations", async () => {
  const staff = await admin(),
    cookie = await member();
  assert.equal(
    (
      await request("admin/settings", {
        method: "PATCH",
        cookie,
        data: { navigation: [] },
      })
    ).status,
    403,
  );
  const navigation = [
    { label: "Home", href: "/", visible: true },
    { label: "Our work", href: "/our-work/", visible: true },
  ];
  assert.equal(
    (
      await request("admin/settings", {
        method: "PATCH",
        cookie: staff,
        data: { navigation, footerText: "Approved footer copy" },
      })
    ).status,
    200,
  );
  const settings = (await request("public")).data.organization;
  assert.equal(settings.navigation.length, 2);
  assert.equal(settings.footerText, "Approved footer copy");
  assert.equal(
    (
      await request("admin/settings", {
        method: "PATCH",
        cookie: staff,
        data: {
          navigation: [
            { label: "Bad", href: "javascript:alert(1)", visible: true },
          ],
        },
      })
    ).status,
    400,
  );
});

test("server orders and checkout verification use provider capture state, not browser success", async () => {
  const cookie = await member();
  config.RAZORPAY_TEST_ENABLED = "true";
  config.RAZORPAY_KEY_ID = "rzp_test_FAKE";
  config.RAZORPAY_KEY_SECRET = "fake-test-secret";
  config.RAZORPAY_WEBHOOK_SECRET = "fake-webhook-secret";
  const original = globalThis.fetch;
  let captured = false,
    orders = 0;
  globalThis.fetch = async (url, options) => {
    assert.ok(String(url).startsWith("https://api.razorpay.com/v1/"));
    if (String(url).endsWith("/orders")) {
      orders++;
      const sent = JSON.parse(options.body);
      assert.equal(sent.amount, 50000);
      assert.equal(sent.currency, "INR");
      return Response.json({
        id: "order_mock",
        amount: 50000,
        currency: "INR",
      });
    }
    return Response.json({
      id: "pay_mock",
      order_id: "order_mock",
      amount: 50000,
      currency: "INR",
      status: captured ? "captured" : "authorized",
    });
  };
  try {
    const payload = {
      amount: 50000,
      name: "Test Donor",
      email: "member@example.test",
      purpose: "Education",
      idempotencyKey: "stable-test-key",
    };
    const r = await request("donations/order", {
      method: "POST",
      cookie,
      data: payload,
    });
    assert.equal(r.status, 200);
    assert.equal(r.data.order.provider_id, "order_mock");
    await request("donations/order", { method: "POST", cookie, data: payload });
    assert.equal(orders, 1);
    const verify = {
      razorpay_order_id: "order_mock",
      razorpay_payment_id: "pay_mock",
      razorpay_signature: createHmac("sha256", config.RAZORPAY_KEY_SECRET)
        .update("order_mock|pay_mock")
        .digest("hex"),
    };
    assert.equal(
      (
        await request("donations/verify", {
          method: "POST",
          cookie,
          data: verify,
        })
      ).status,
      400,
    );
    assert.equal(
      sqlite.prepare("SELECT status FROM donations").get().status,
      "pending",
    );
    captured = true;
    assert.equal(
      (
        await request("donations/verify", {
          method: "POST",
          cookie,
          data: verify,
        })
      ).status,
      200,
    );
    assert.equal(sqlite.prepare("SELECT count(*) n FROM receipts").get().n, 1);
  } finally {
    globalThis.fetch = original;
  }
});

test("store employees manage only products; admins create and revoke their accounts", async () => {
  const adminCookie = await admin();
  let r = await request("admin/users", {
    method: "POST",
    cookie: adminCookie,
    data: {
      name: "Store Employee",
      email: "store@example.test",
      password: pass,
      role: "store_employee",
    },
  });
  assert.equal(r.status, 201);
  const employeeId = r.data.id;
  r = await request("auth/login", {
    method: "POST",
    data: { email: "store@example.test", password: pass },
  });
  assert.equal(r.status, 200);
  const employeeCookie = r.cookie;
  r = await request("auth/me", { cookie: employeeCookie });
  assert.deepEqual(r.data.user.permissions, ["products"]);
  for (const section of [
    "content",
    "users",
    "donations",
    "store",
    "settings",
    "media",
    "applications",
    "audit",
  ]) {
    assert.equal(
      (await request("admin/" + section, { cookie: employeeCookie })).status,
      403,
      section,
    );
  }
  const product = {
    kind: "product",
    slug: "test-handcrafted-bag",
    title: "Handcrafted bag",
    summary: "Handmade cotton bag",
    body: "Details",
    image: "/images/education.jpg",
    category: "Bags",
    status: "published",
    data: { price: 12500, stock: 3 },
  };
  r = await request("admin/products", {
    method: "POST",
    cookie: employeeCookie,
    data: product,
  });
  assert.equal(r.status, 201);
  const id = r.data.id;
  assert.ok((await request("public")).data.content.some((p) => p.id === id));
  assert.ok(
    (
      await request("admin/products", { cookie: employeeCookie })
    ).data.items.every((p) => p.kind === "product"),
  );
  r = await request("admin/products/" + id, {
    method: "PATCH",
    cookie: employeeCookie,
    data: { ...product, title: "Updated bag" },
  });
  assert.equal(r.status, 200);
  assert.equal(
    (
      await request("admin/products", {
        method: "POST",
        cookie: employeeCookie,
        data: { ...product, kind: "page", slug: "bad-page" },
      })
    ).status,
    403,
  );
  const program = (await request("public")).data.content.find(
    (p) => p.kind === "program",
  );
  for (const method of ["GET", "PATCH", "DELETE"])
    assert.equal(
      (
        await request("admin/products/" + program.id, {
          method,
          cookie: employeeCookie,
          data: method === "PATCH" ? product : undefined,
        })
      ).status,
      404,
    );
  assert.equal(
    (
      await request("admin/users", {
        method: "POST",
        cookie: employeeCookie,
        data: {
          name: "Escalation",
          email: "bad@example.test",
          password: pass,
          role: "admin",
        },
      })
    ).status,
    403,
  );
  assert.equal(
    (
      await request("admin/settings", {
        method: "PATCH",
        cookie: adminCookie,
        data: { role: "store_employee", permissions: ["products", "users"] },
      })
    ).status,
    400,
  );
  r = await request("admin/products/" + id, {
    method: "DELETE",
    cookie: employeeCookie,
  });
  assert.equal(r.status, 200);
  assert.ok(!(await request("public")).data.content.some((p) => p.id === id));
  r = await request("admin/users/" + employeeId, {
    method: "PATCH",
    cookie: adminCookie,
    data: { role: "store_employee", active: false, verified: true },
  });
  assert.equal(r.status, 200);
  assert.equal(
    (await request("admin/products", { cookie: employeeCookie })).status,
    401,
  );
});

test("product validation, public stock limits and employee upload restrictions", async () => {
  const adminCookie = await admin();
  await request("admin/users", {
    method: "POST",
    cookie: adminCookie,
    data: {
      name: "Store",
      email: "store@example.test",
      password: pass,
      role: "store_employee",
    },
  });
  const employeeCookie = (
    await request("auth/login", {
      method: "POST",
      data: { email: "store@example.test", password: pass },
    })
  ).cookie;
  const product = {
    kind: "product",
    slug: "stock-test",
    title: "Stock test",
    summary: "A real product",
    image: "/images/education.jpg",
    status: "published",
    data: { price: 10000, stock: 2 },
  };
  for (const data of [
    { ...product.data, price: -10 },
    { ...product.data, salePrice: 20000 },
    { ...product.data, stock: -1 },
  ])
    assert.equal(
      (
        await request("admin/products", {
          method: "POST",
          cookie: employeeCookie,
          data: { ...product, data },
        })
      ).status,
      400,
    );
  assert.equal(
    (
      await request("admin/products", {
        method: "POST",
        cookie: employeeCookie,
        data: { ...product, image: "" },
      })
    ).status,
    400,
  );
  const id = (
    await request("admin/products", {
      method: "POST",
      cookie: employeeCookie,
      data: product,
    })
  ).data.id;
  assert.equal(
    (
      await request("store/orders", {
        method: "POST",
        cookie: employeeCookie,
        data: { items: [{ id, quantity: 3 }] },
      })
    ).status,
    400,
  );
  const image = new FormData();
  image.set(
    "file",
    new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])], "photo.png", {
      type: "image/png",
    }),
  );
  image.set("alt", "Product image");
  assert.equal(
    (
      await request("media", {
        method: "POST",
        cookie: employeeCookie,
        data: image,
      })
    ).status,
    201,
  );
  image.set("visibility", "private");
  assert.equal(
    (
      await request("media", {
        method: "POST",
        cookie: employeeCookie,
        data: image,
      })
    ).status,
    403,
  );
  const pdf = new FormData();
  pdf.set(
    "file",
    new File(["%PDF-test"], "file.pdf", { type: "application/pdf" }),
  );
  pdf.set("alt", "File");
  assert.equal(
    (
      await request("media", {
        method: "POST",
        cookie: employeeCookie,
        data: pdf,
      })
    ).status,
    403,
  );
});
