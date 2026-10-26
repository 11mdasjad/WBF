import type { Database } from "./database";
import {
  database,
  all,
  first,
  run,
  audit,
  rate,
  currentUser,
  requireUser,
  session,
  notify,
  tokenEmail,
  sendNotification,
  decode,
  publicEntry,
  organizationSettings,
  bucket,
  json,
  errorResponse,
  config,
} from "./core";
import {
  assert,
  body,
  clean,
  email,
  password,
  safeUrl,
  hashPassword,
  checkPassword,
  digest,
  uid,
  now,
  originCheck,
  equal,
  hmac,
  escapeHtml,
  csv,
  HttpError,
} from "./security";
import { paymentReady, razor, settle, webhook } from "./payments";
import { contentKinds, roleNames } from "../content";
const statuses = [
  "pending",
  "approved",
  "rejected",
  "more_information",
  "interview",
  "withdrawn",
];
const editableFields = [
  "title",
  "summary",
  "body",
  "image",
  "category",
  "status",
  "sort",
  "data",
  "source",
  "published_at",
];
export async function handle(req: Request) {
  try {
    const url = new URL(req.url),
      path = url.pathname.replace(/^\/api\//, "").replace(/\/$/, ""),
      method = req.method;
    const db = await database();
    if (path === "payments/webhook" && method === "POST")
      return json(await webhook(db, req));
    if (method !== "GET" && path !== "setup") originCheck(req);
    if (path === "public" && method === "GET") {
      const organization = await organizationSettings(db);
      const rows = await all(
        db,
        "SELECT * FROM content WHERE status='published' AND (published_at IS NULL OR published_at<=?) ORDER BY sort ASC,created_at DESC",
        now(),
      );
      return json({
        organization,
        content: rows.map(publicEntry),
        paymentsEnabled: !!paymentReady(),
        emailEnabled: !!(config.RESEND_API_KEY && config.EMAIL_FROM),
      });
    }
    if (path === "auth/me" && method === "GET")
      return json({ user: await currentUser(db, req) });
    if (path === "setup" && method === "POST") {
      const setupToken = config.SETUP_TOKEN;
      assert(
        setupToken && setupToken.length >= 32 &&
          equal(req.headers.get("x-setup-token") || "", setupToken),
        "Setup is not authorized.",
        403,
      );
      assert(
        !(await first(db, "SELECT id FROM user_roles WHERE role_id='admin'")),
        "An administrator already exists.",
        409,
      );
      const b = await body(req),
        id = uid(),
        em = email(b.email),
        name = clean(b.name, 100),
        pw = await hashPassword(password(b.password));
      await db.batch([
        db
          .prepare(
            "INSERT INTO users(id,name,email,password,verified,created_at) VALUES(?,?,?,?,1,?)",
          )
          .bind(id, name, em, pw, now()),
        db
          .prepare("INSERT INTO user_roles(id,user_id,role_id) VALUES(?,?,?)")
          .bind(uid(), id, "admin"),
      ]);
      await audit(db, id, "admin.bootstrap", id);
      return json({ ok: true }, 201);
    }
    if (path === "auth/register" && method === "POST") {
      await rate(db, req, "register", 6);
      const b = await body(req);
      const em = email(b.email),
        name = clean(b.name, 100),
        pw = password(b.password);
      assert(
        b.consent === true,
        "Please accept the account terms and privacy notice.",
      );
      assert(
        !(await first(db, "SELECT id FROM users WHERE email=?", em)),
        "An account already uses that email. Please sign in or reset your password.",
        409,
      );
      const id = uid();
      await db.batch([
        db
          .prepare(
            "INSERT INTO users(id,name,email,password,phone,created_at) VALUES(?,?,?,?,?,?)",
          )
          .bind(
            id,
            name,
            em,
            await hashPassword(pw),
            String(b.phone || "").slice(0, 30),
            now(),
          ),
        db
          .prepare("INSERT INTO user_roles(id,user_id,role_id) VALUES(?,?,?)")
          .bind(uid(), id, "member"),
      ]);
      await tokenEmail(db, req, { id, email: em }, "verify");
      await audit(db, id, "auth.register", id);
      return json(
        {
          ok: true,
          message: config.RESEND_API_KEY
            ? "Check your inbox to verify your email."
            : "Account created. Email delivery is awaiting configuration; an administrator can verify your account.",
        },
        201,
        { "Set-Cookie": await session(db, req, id) },
      );
    }
    if (path === "auth/login" && method === "POST") {
      const b = await body(req),
        em = email(b.email);
      await rate(db, req, "login", 30);
      await rate(db, req, "login:" + em, 8);
      const u = await first(db, "SELECT * FROM users WHERE email=?", em);
      const valid = u
        ? await checkPassword(String(b.password || ""), u.password)
        : await checkPassword(
            "invalid",
            "$2b$12$VX6nVuJFKTFPoWG9n.v93e08PdxnqbfcMqr7iOs1YPvAMmDkenFSa",
          );
      assert(valid && u?.active, "Email or password is incorrect.", 401);
      await audit(db, u.id, "auth.login", u.id);
      return json({ ok: true }, 200, {
        "Set-Cookie": await session(db, req, u.id),
      });
    }
    if (path === "auth/logout" && method === "POST") {
      const u = await currentUser(db, req);
      const token = req.headers
        .get("cookie")
        ?.match(/(?:^|;\s*)wbf_session=([^;]+)/)?.[1];
      if (token)
        await run(db, "DELETE FROM sessions WHERE id=?", await digest(token));
      if (u) await audit(db, u.id, "auth.logout", u.id);
      return json({ ok: true }, 200, {
        "Set-Cookie": "wbf_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
      });
    }
    if (path === "auth/forgot" && method === "POST") {
      await rate(db, req, "forgot", 5);
      const b = await body(req),
        u = await first(
          db,
          "SELECT id,email FROM users WHERE email=? AND active=1",
          email(b.email),
        );
      if (u) await tokenEmail(db, req, u, "reset");
      return json({
        message:
          "If an account matches, a reset email will be queued. Delivery depends on the configured email provider.",
      });
    }
    if (path === "auth/resend" && method === "POST") {
      const u = await requireUser(db, req);
      await rate(db, req, "verify-resend", 4);
      if (!u.verified) await tokenEmail(db, req, u, "verify");
      return json({ message: "Verification email queued." });
    }
    if (
      (path === "auth/verify" || path === "auth/reset") &&
      method === "POST"
    ) {
      await rate(db, req, "token", 12);
      const b = await body(req),
        kind = path.endsWith("verify") ? "verify" : "reset",
        token = await first(
          db,
          "SELECT * FROM tokens WHERE id=? AND kind=? AND expires_at>?",
          await digest(clean(b.token, 100)),
          kind,
          now(),
        );
      assert(token, "This link has expired or has already been used.", 400);
      const updates = [
        db
          .prepare("DELETE FROM tokens WHERE user_id=? AND kind=?")
          .bind(token.user_id, kind),
      ];
      if (kind === "verify")
        updates.push(
          db
            .prepare("UPDATE users SET verified=1 WHERE id=?")
            .bind(token.user_id),
        );
      else {
        updates.push(
          db
            .prepare("UPDATE users SET password=? WHERE id=?")
            .bind(await hashPassword(password(b.password)), token.user_id),
          db
            .prepare("DELETE FROM sessions WHERE user_id=?")
            .bind(token.user_id),
        );
      }
      await db.batch(updates);
      await audit(db, token.user_id, "auth." + kind, token.user_id);
      return json({ ok: true });
    }
    if (path === "profile" && method === "GET") {
      const u = await requireUser(db, req);
      return json({
        user: u,
        applications: await all(
          db,
          "SELECT id,reference,kind,status,data,created_at,updated_at FROM applications WHERE user_id=? ORDER BY created_at DESC",
          u.id,
        ),
        history: await all(
          db,
          "SELECT h.* FROM application_history h JOIN applications a ON a.id=h.application_id WHERE a.user_id=? ORDER BY h.created_at DESC",
          u.id,
        ),
        donations: await all(
          db,
          "SELECT d.*,r.id AS receipt_id FROM donations d LEFT JOIN receipts r ON r.donation_id=d.id WHERE d.user_id=? ORDER BY d.created_at DESC",
          u.id,
        ),
        orders: await all(
          db,
          "SELECT id,reference,amount,status,created_at FROM store_orders WHERE user_id=? ORDER BY created_at DESC",
          u.id,
        ),
        notifications: await all(
          db,
          "SELECT id,subject,status,created_at FROM notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 20",
          u.id,
        ),
      });
    }
    if (path === "profile" && method === "PATCH") {
      const u = await requireUser(db, req),
        b = await body(req);
      await run(
        db,
        "UPDATE users SET name=?,phone=? WHERE id=?",
        clean(b.name, 100),
        String(b.phone || "").slice(0, 30),
        u.id,
      );
      return json({ ok: true });
    }
    if (path === "profile/password" && method === "POST") {
      const u = await requireUser(db, req),
        b = await body(req),
        row = await first(db, "SELECT password FROM users WHERE id=?", u.id);
      assert(
        await checkPassword(String(b.currentPassword || ""), row.password),
        "Current password is incorrect.",
      );
      await db.batch([
        db
          .prepare("UPDATE users SET password=? WHERE id=?")
          .bind(await hashPassword(password(b.password)), u.id),
        db.prepare("DELETE FROM sessions WHERE user_id=?").bind(u.id),
      ]);
      await audit(db, u.id, "auth.password-change", u.id);
      return json({ ok: true }, 200, {
        "Set-Cookie": await session(db, req, u.id),
      });
    }
    if (path === "contact" && method === "POST") {
      await rate(db, req, "contact", 5);
      const b = await body(req);
      assert(!b.website, "Please leave the spam protection field empty.");
      const id = uid();
      const message =
        clean(b.message, 5000) +
        (b.type === "partnership"
          ? "\n\nOrganization: " +
            clean(b.organization, 200) +
            "\nPhone: " +
            String(b.phone || "").slice(0, 30) +
            "\nBudget: " +
            String(b.budget || "").slice(0, 100) +
            "\nFocus: " +
            String(b.focus || "").slice(0, 100)
          : "");
      await run(
        db,
        "INSERT INTO contacts(id,name,email,subject,message,created_at) VALUES(?,?,?,?,?,?)",
        id,
        clean(b.name, 100),
        email(b.email),
        clean(b.subject, 150),
        message,
        now(),
      );
      if (config.CONTACT_NOTIFICATION_EMAIL)
        await notify(
          db,
          null,
          config.CONTACT_NOTIFICATION_EMAIL,
          "New WBF contact message",
          "A new message is available in the admin inbox. Reference: " + id,
        );
      return json({ ok: true, reference: id.slice(0, 8).toUpperCase() }, 201);
    }
    if (path === "applications" && method === "POST") {
      const u = await requireUser(db, req);
      assert(
        u.verified,
        "Please verify your email before submitting an application.",
        403,
      );
      await rate(db, req, "applications", 8);
      const b = await body(req);
      assert(
        ["volunteer", "internship", "job", "event", "partnership"].includes(
          b.kind,
        ),
        "Choose a valid application type.",
      );
      assert(
        b.consent === true,
        "Please consent to processing this application.",
      );
      const name = clean(b.name, 100),
        em = email(b.email),
        phone = clean(b.phone, 30);
      assert(em === u.email, "Use the verified email address on your account.");
      assert(/^[+\d()\s-]{7,30}$/.test(phone), "Enter a valid phone number.");
      const data = b.data || {};
      assert(JSON.stringify(data).length < 18000, "Application is too long.");
      if (b.kind !== "event") {
        assert(
          Array.isArray(data.interests) && data.interests.length > 0,
          "Select at least one interest.",
        );
        clean(data.availability, 100);
        clean(data.city, 100);
      }
      let contentId = b.contentId || null;
      if (["event", "job"].includes(b.kind))
        assert(contentId, "Choose a published opportunity before applying.");
      if (contentId) {
        const target = await first(
          db,
          "SELECT id,kind,data FROM content WHERE id=? AND status='published'",
          contentId,
        );
        assert(target, "This opportunity is no longer available.");
        if (["event", "job"].includes(b.kind))
          assert(
            target.kind === b.kind,
            "This opportunity does not match the application type.",
          );
        const opportunity = JSON.parse(target.data);
        if (target.kind === "job" && opportunity.deadline)
          assert(
            new Date(opportunity.deadline + "T23:59:59+05:30").getTime() >
              Date.now(),
            "The application deadline has passed.",
          );
        if (target.kind === "event")
          assert(
            new Date(JSON.parse(target.data).end).getTime() > Date.now(),
            "Registration for this event has closed.",
          );
      }
      const dedupe = u.id + ":" + b.kind + ":" + (contentId || "general"),
        old = await first(
          db,
          "SELECT reference FROM applications WHERE dedupe=?",
          dedupe,
        );
      if (old)
        return json({ ok: true, reference: old.reference, duplicate: true });
      const id = uid(),
        ref =
          "WBF-" +
          b.kind.slice(0, 3).toUpperCase() +
          "-" +
          id.slice(0, 8).toUpperCase(),
        date = now();
      const saved = await db.batch([
        db
          .prepare(
            "INSERT OR IGNORE INTO applications(id,user_id,kind,content_id,reference,dedupe,name,email,phone,data,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",
          )
          .bind(
            id,
            u.id,
            b.kind,
            contentId,
            ref,
            dedupe,
            name,
            em,
            phone,
            JSON.stringify(data),
            date,
            date,
          ),
        db
          .prepare(
            "INSERT INTO application_history(id,application_id,status,message,actor_id,created_at) SELECT ?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM applications WHERE id=?)",
          )
          .bind(uid(), id, "pending", "Application received", u.id, date, id),
      ]);
      if (!saved[0].meta.changes) {
        const existing = await first(
          db,
          "SELECT reference FROM applications WHERE dedupe=?",
          dedupe,
        );
        return json({
          ok: true,
          reference: existing.reference,
          duplicate: true,
        });
      }
      await notify(
        db,
        u.id,
        u.email,
        "Application received: " + ref,
        "Your application has been received. Track its status in your WBF account.",
      );
      await audit(db, u.id, "application.submit", id, b.kind);
      return json({ ok: true, reference: ref }, 201);
    }
    if (path.startsWith("applications/") && method === "PATCH") {
      const u = await requireUser(db, req),
        id = path.split("/")[1];
      const item = await first(
        db,
        "SELECT * FROM applications WHERE id=? AND user_id=?",
        id,
        u.id,
      );
      assert(item, "Application not found.", 404);
      assert(
        item.status === "pending" || item.status === "more_information",
        "This application cannot be withdrawn.",
      );
      await db.batch([
        db
          .prepare(
            "UPDATE applications SET status='withdrawn',updated_at=? WHERE id=?",
          )
          .bind(now(), id),
        db
          .prepare(
            "INSERT INTO application_history(id,application_id,status,message,actor_id,created_at) VALUES(?,?,?,?,?,?)",
          )
          .bind(uid(), id, "withdrawn", "Withdrawn by applicant", u.id, now()),
      ]);
      return json({ ok: true });
    }
    if (path === "donations/order" && method === "POST") {
      const u = await requireUser(db, req);
      assert(
        paymentReady(),
        "Test checkout is awaiting merchant configuration. No payment has been taken.",
        503,
      );
      await rate(db, req, "donation", 10);
      const b = await body(req),
        amount = Number(b.amount);
      assert(
        Number.isSafeInteger(amount) && amount >= 10000 && amount <= 100000000,
        "Choose an amount from ₹100 to ₹10,00,000.",
      );
      const dedupe = u.id + ":" + clean(b.idempotencyKey, 100),
        old = await first(
          db,
          "SELECT o.provider_id,o.amount,o.currency FROM donations d JOIN payment_orders o ON o.donation_id=d.id WHERE d.dedupe=?",
          dedupe,
        );
      if (old) return json({ order: old, key: config.RAZORPAY_KEY_ID });
      const id = uid();
      await run(
        db,
        "INSERT INTO donations(id,user_id,name,email,amount,purpose,anonymous,dedupe,created_at) VALUES(?,?,?,?,?,?,?,?,?)",
        id,
        u.id,
        clean(b.name, 100),
        email(b.email),
        amount,
        clean(b.purpose, 100),
        b.anonymous ? 1 : 0,
        dedupe,
        now(),
      );
      try {
        const order = await razor("orders", "POST", {
          amount,
          currency: "INR",
          receipt: id,
          notes: { donation_id: id },
        });
        await run(
          db,
          "INSERT INTO payment_orders(id,donation_id,provider_id,amount,currency,created_at) VALUES(?,?,?,?,?,?)",
          uid(),
          id,
          order.id,
          amount,
          "INR",
          now(),
        );
        await audit(db, u.id, "donation.order", id);
        return json({
          order: { provider_id: order.id, amount, currency: "INR" },
          key: config.RAZORPAY_KEY_ID,
        });
      } catch (e) {
        await run(db, "UPDATE donations SET status='failed' WHERE id=?", id);
        throw e;
      }
    }
    if (path === "donations/verify" && method === "POST") {
      const u = await requireUser(db, req),
        b = await body(req);
      assert(paymentReady(), "Payments are disabled.", 503);
      const order = await first(
        db,
        "SELECT o.* FROM payment_orders o JOIN donations d ON d.id=o.donation_id WHERE o.provider_id=? AND d.user_id=?",
        clean(b.razorpay_order_id, 100),
        u.id,
      );
      assert(order, "Order not found.", 404);
      const pid = clean(b.razorpay_payment_id, 100);
      assert(config.RAZORPAY_KEY_SECRET, "Payments are disabled.", 503);
      assert(
        equal(
          await hmac(config.RAZORPAY_KEY_SECRET, order.provider_id + "|" + pid),
          String(b.razorpay_signature || ""),
        ),
        "Payment signature is invalid.",
        400,
      );
      const p = await razor("payments/" + encodeURIComponent(pid));
      const id = await settle(db, p);
      await audit(db, u.id, "donation.verified", id);
      return json({ ok: true, donationId: id });
    }
    if (path.startsWith("receipts/") && method === "GET") {
      const u = await requireUser(db, req);
      const r = await first(
        db,
        "SELECT r.*,d.user_id,d.name,d.amount,d.status FROM receipts r JOIN donations d ON d.id=r.donation_id WHERE r.id=?",
        path.split("/")[1],
      );
      assert(
        r && (r.user_id === u.id || u.permissions.includes("donations")),
        "Receipt not found.",
        404,
      );
      assert(
        r.status === "paid",
        "A paid receipt is unavailable for this transaction.",
        409,
      );
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(r.number)}</title><style>body{font:16px Georgia;max-width:680px;margin:80px auto;line-height:1.8}h1{color:#173c2c}small{color:#666}</style></head><body><h1>Well Being Foundation</h1><h2>Test payment acknowledgement</h2><p>Receipt ${escapeHtml(r.number)}</p><p>Donor: ${escapeHtml(r.name)}<br>Amount: INR ${(r.amount / 100).toFixed(2)}<br>Date: ${escapeHtml(r.created_at)}</p><p>Verified Razorpay test payment. No real funds were collected.</p><small>This acknowledgement is not a tax exemption certificate.</small></body></html>`;
      return new Response(html, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="${r.number}.html"`,
          "Cache-Control": "private, no-store",
          "Content-Security-Policy":
            "default-src 'none'; style-src 'unsafe-inline'; sandbox",
        },
      });
    }
    if (path === "store/orders" && method === "POST") {
      const u = await requireUser(db, req);
      await rate(db, req, "store-order", 5);
      const b = await body(req);
      assert(
        Array.isArray(b.items) && b.items.length > 0 && b.items.length <= 30,
        "Your cart is empty or too large.",
      );
      const id = uid(),
        ref = "WBF-SHOP-" + id.slice(0, 8).toUpperCase();
      let amount = 0;
      const items = [];
      for (const item of b.items) {
        assert(
          Number.isInteger(item.quantity) &&
            item.quantity >= 1 &&
            item.quantity <= 20,
          "Choose a quantity from 1 to 20.",
        );
        const p = await first(
          db,
          "SELECT * FROM content WHERE id=? AND kind='product' AND status='published'",
          item.id,
        );
        assert(p, "A product is no longer available.");
        const d = JSON.parse(p.data);
        assert(
          d.stock === undefined || item.quantity <= d.stock,
          "Requested quantity exceeds available stock.",
        );
        const price =
          d.salePrice && new Date(d.saleUntil).getTime() > Date.now()
            ? d.salePrice
            : d.price;
        assert(
          Number.isSafeInteger(price) && price > 0,
          "Product price is not configured.",
        );
        amount += price * item.quantity;
        items.push(
          db
            .prepare(
              "INSERT INTO store_items(id,order_id,product_id,quantity,unit_amount) VALUES(?,?,?,?,?)",
            )
            .bind(uid(), id, p.id, item.quantity, price),
        );
      }
      await db.batch([
        db
          .prepare(
            "INSERT INTO store_orders(id,user_id,reference,amount,address,created_at) VALUES(?,?,?,?,?,?)",
          )
          .bind(id, u.id, ref, amount, clean(b.address, 1000), now()),
        ...items,
      ]);
      await notify(
        db,
        u.id,
        u.email,
        "Store inquiry " + ref,
        "Your product inquiry is saved. Availability, shipping and payment must be confirmed by the team. No payment has been taken.",
      );
      return json({ ok: true, reference: ref }, 201);
    }
    if (path === "media" && method === "POST") {
      const u = await requireUser(db, req);
      assert(
        u.permissions.includes("media") || u.permissions.includes("products"),
        "Image upload access is required.",
        403,
      );
      assert(
        Number(req.headers.get("content-length") || 0) <= 4400000,
        "Files must be smaller than 4 MB.",
        413,
      );
      const form = await req.formData(),
        file = form.get("file");
      assert(
        file instanceof File && file.size > 0 && file.size <= 4000000,
        "Choose a file smaller than 4 MB.",
      );
      const allowed = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
      ];
      assert(allowed.includes(file.type), "Use a JPEG, PNG, WebP or PDF.");
      if (!u.permissions.includes("media")) {
        assert(
          file.type.startsWith("image/") &&
            form.get("visibility") !== "private",
          "Store employees can upload public product images only.",
          403,
        );
      }
      const bytes = new Uint8Array(await file.arrayBuffer());
      const valid =
        file.type === "image/jpeg"
          ? bytes[0] === 255 && bytes[1] === 216
          : file.type === "image/png"
            ? bytes[0] === 137 &&
              bytes[1] === 80 &&
              bytes[2] === 78 &&
              bytes[3] === 71
            : file.type === "image/webp"
              ? new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
                new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP"
              : new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-";
      assert(valid, "File content does not match its format.");
      const id = uid(),
        key =
          id +
          "." +
          {
            "image/jpeg": "jpg",
            "image/png": "png",
            "image/webp": "webp",
            "application/pdf": "pdf",
          }[file.type];
      const alt = clean(form.get("alt"), 300);
      await bucket().put(key, bytes, {
        httpMetadata: { contentType: file.type },
      });
      await run(
        db,
        "INSERT INTO media(id,user_id,name,mime,size,key,alt,caption,visibility,created_at) VALUES(?,?,?,?,?,?,?,?,?,?)",
        id,
        u.id,
        file.name.slice(0, 150),
        file.type,
        file.size,
        key,
        alt,
        String(form.get("caption") || "").slice(0, 500),
        form.get("visibility") === "private" ? "private" : "public",
        now(),
      );
      await audit(db, u.id, "media.upload", id);
      return json({ ok: true, url: "/api/media/" + id, id }, 201);
    }
    if (path.startsWith("media/") && method === "GET") {
      const m = await first(
        db,
        "SELECT * FROM media WHERE id=?",
        path.split("/")[1],
      );
      assert(m, "File not found.", 404);
      if (m.visibility === "private") await requireUser(db, req, "media");
      const object = await bucket().get(m.key);
      assert(object, "File not found.", 404);
      return new Response(object!.body, {
        headers: {
          "Content-Type": m.mime,
          "X-Content-Type-Options": "nosniff",
          "Content-Security-Policy": "default-src 'none'; sandbox",
          "Content-Disposition": `${m.mime === "application/pdf" ? "attachment" : "inline"}; filename="${m.id}.${m.mime.split("/")[1]}"`,
          "Cache-Control":
            m.visibility === "public"
              ? "public, max-age=3600"
              : "private, no-store",
        },
      });
    }
    if (path.startsWith("admin")) return await admin(db, req, path, url);
    throw new HttpError(404, "This endpoint was not found.");
  } catch (e) {
    return errorResponse(e);
  }
}

async function admin(db: Database, req: Request, path: string, url: URL) {
  const section = path.split("/")[1] || "overview",
    id = path.split("/")[2];
  const method = req.method;
  if (section === "overview") {
    const u = await requireUser(db, req);
    assert(u.permissions.length, "Admin access is required.", 403);
    const date = url.searchParams.get("from") || "1970-01-01";
    const result: any = { permissions: u.permissions };
    if (u.permissions.includes("donations")) {
      result.donations = await first(
        db,
        "SELECT COUNT(*) AS total,COALESCE(SUM(CASE WHEN status='paid' THEN amount ELSE 0 END),0) AS amount,SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending FROM donations WHERE created_at>=?",
        date,
      );
      result.chart = await all(
        db,
        "SELECT substr(created_at,1,7) AS month,SUM(amount) AS amount FROM donations WHERE status='paid' AND created_at>=? GROUP BY month ORDER BY month",
        date,
      );
    }
    if (u.permissions.includes("applications"))
      result.applications = await first(
        db,
        "SELECT COUNT(*) AS total,SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending FROM applications WHERE created_at>=?",
        date,
      );
    if (u.permissions.includes("users"))
      result.users = await first(
        db,
        "SELECT COUNT(*) AS total FROM users WHERE created_at>=?",
        date,
      );
    if (u.permissions.includes("content"))
      result.content = await first(
        db,
        "SELECT COUNT(*) AS total FROM content WHERE status='published'",
      );
    if (u.permissions.includes("audit"))
      result.activity = await all(
        db,
        "SELECT a.*,u.name FROM audit_logs a LEFT JOIN users u ON u.id=a.user_id ORDER BY a.created_at DESC LIMIT 8",
      );
    return json(result);
  }
  const permission = section === "store" ? "donations" : section;
  const u = await requireUser(db, req, permission);
  if (section === "settings") {
    if (method === "GET")
      return json({
        organization: await organizationSettings(db),
        roles: await all(db, "SELECT * FROM roles"),
        permissions: await all(db, "SELECT * FROM role_permissions"),
        configuration: {
          payments: !!paymentReady(),
          email: !!config.RESEND_API_KEY,
          storage: true,
        },
      });
    if (method === "PATCH") {
      const b = await body(req);
      if (b.role) {
        assert(
          b.role !== "store_employee" ||
            (Array.isArray(b.permissions) &&
              b.permissions.length === 1 &&
              b.permissions[0] === "products"),
          "Store employee access is fixed to product listings.",
        );
        assert(
          roleNames.includes(b.role) && b.role !== "admin",
          "The administrator role cannot be changed.",
        );
        assert(
          Array.isArray(b.permissions) &&
            b.permissions.every((p: string) =>
              [
                "content",
                "products",
                "media",
                "applications",
                "donations",
                "inbox",
                "users",
                "settings",
                "audit",
                "notifications",
              ].includes(p),
            ),
          "Invalid permissions.",
        );
        await db.batch([
          db
            .prepare("DELETE FROM role_permissions WHERE role_id=?")
            .bind(b.role),
          ...b.permissions.map((p: string) =>
            db
              .prepare(
                "INSERT INTO role_permissions(id,role_id,permission_id) VALUES(?,?,?)",
              )
              .bind(uid(), b.role, p),
          ),
        ]);
        await audit(db, u.id, "settings.permissions", b.role);
        return json({ ok: true });
      }
      const old: Record<string, any> = await organizationSettings(db);
      for (const [key, val] of Object.entries(b)) {
        assert(key in old, "Unknown setting.");
        if (key === "navigation") {
          assert(
            Array.isArray(val) && val.length <= 8,
            "Use at most eight main navigation links.",
          );
          for (const item of val) {
            clean(item.label, 25);
            safeUrl(item.href, false);
            assert(typeof item.visible === "boolean", "Set link visibility.");
          }
          old[key] = val;
          continue;
        }
        assert(
          typeof val === "string" || typeof val === "boolean",
          "Invalid setting value.",
        );
        if (typeof val === "string")
          assert(val.length < 6000, "Setting value is too long.");
        if (key.startsWith("social") || key === "heroImage") safeUrl(val);
        old[key] = val;
      }
      await run(
        db,
        "UPDATE settings SET value=?,updated_at=? WHERE id='organization'",
        JSON.stringify(old),
        now(),
      );
      await audit(db, u.id, "settings.update", "organization");
      return json({ ok: true });
    }
  }
  if (section === "users" && method === "POST") {
    assert(
      u.roles.includes("admin"),
      "Only an administrator can create staff accounts.",
      403,
    );
    const b = await body(req);
    assert(b.role === "store_employee", "Choose the store employee role.");
    const em = email(b.email),
      name = clean(b.name, 100),
      pw = password(b.password);
    assert(
      !(await first(db, "SELECT id FROM users WHERE email=?", em)),
      "An account already uses that email.",
      409,
    );
    const newId = uid();
    await db.batch([
      db
        .prepare(
          "INSERT INTO users(id,name,email,password,phone,verified,active,created_at) VALUES(?,?,?,?,?,1,1,?)",
        )
        .bind(newId, name, em, await hashPassword(pw), "", now()),
      db
        .prepare("INSERT INTO user_roles(id,user_id,role_id) VALUES(?,?,?)")
        .bind(uid(), newId, "store_employee"),
    ]);
    await audit(db, u.id, "staff.create", newId, "store_employee");
    return json({ id: newId }, 201);
  }
  if (section === "content" || section === "products") {
    const productsOnly = section === "products";
    if (productsOnly && id) {
      const target = await first(db, "SELECT kind FROM content WHERE id=?", id);
      assert(target?.kind === "product", "Product not found.", 404);
    }
    if (method === "GET") {
      if (id === "revisions")
        return json({
          items: await all(
            db,
            "SELECT * FROM content_revisions WHERE content_id=? ORDER BY created_at DESC",
            url.searchParams.get("contentId"),
          ),
        });
      if (id) {
        const item = await first(db, "SELECT * FROM content WHERE id=?", id);
        assert(item, "Content not found.", 404);
        return json({ item: decode(item) });
      }
      return json({
        items: (
          await all(
            db,
            productsOnly
              ? "SELECT * FROM content WHERE kind='product' ORDER BY updated_at DESC"
              : "SELECT * FROM content ORDER BY updated_at DESC",
          )
        ).map(decode),
      });
    }
    if (method === "POST" || method === "PATCH") {
      const b = await body(req),
        kind = clean(b.kind, 30);
      assert(
        !productsOnly || kind === "product",
        "Only product listings can be managed here.",
        403,
      );
      assert(
        (contentKinds as readonly string[]).includes(kind),
        "Invalid content type.",
      );
      assert(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(b.slug),
        "Use lowercase words separated by hyphens for the slug.",
      );
      assert(
        ["draft", "published", "archived"].includes(b.status),
        "Choose draft, published or archived.",
      );
      const data = b.data || {};
      assert(JSON.stringify(data).length < 20000, "Content details too long.");
      if (kind === "metric" && b.status === "published")
        assert(
          b.source && data.period,
          "A published metric requires its source and reporting period.",
        );
      if (kind === "event" && b.status === "published")
        assert(
          data.start && data.end && new Date(data.end) >= new Date(data.start),
          "Set valid event dates.",
        );
      if (data.sections) {
        assert(
          Array.isArray(data.sections) && data.sections.length <= 20,
          "Use at most 20 page sections.",
        );
        for (const section of data.sections) {
          assert(
            ["text", "image", "callout"].includes(section.type) &&
              typeof section.body === "string" &&
              typeof section.title === "string",
            "Invalid page section.",
          );
          safeUrl(section.image);
          safeUrl(section.link);
        }
      }
      if (data.url) safeUrl(data.url);
      if (data.registrationUrl) safeUrl(data.registrationUrl);
      if (b.published_at)
        assert(
          Number.isFinite(Date.parse(b.published_at)),
          "Enter a valid publication date.",
        );
      if (kind === "product")
        assert(
          Number.isSafeInteger(data.price) &&
            data.price > 0 &&
            data.price <= 100000000,
          "Enter a valid product price in paise.",
        );
      if (kind === "product") {
        assert(
          data.salePrice === undefined ||
            data.salePrice === null ||
            data.salePrice === 0 ||
            (Number.isSafeInteger(data.salePrice) &&
              data.salePrice > 0 &&
              data.salePrice <= data.price),
          "Sale price must be positive and no higher than the regular price.",
        );
        assert(
          data.stock === undefined ||
            (Number.isSafeInteger(data.stock) &&
              data.stock >= 0 &&
              data.stock <= 1000000),
          "Stock must be a whole number from 0 to 1,000,000.",
        );
        if (data.saleUntil)
          assert(
            Number.isFinite(Date.parse(data.saleUntil)),
            "Enter a valid sale end date.",
          );
        if (b.status === "published")
          assert(
            b.image && b.summary,
            "Add a product image and short description before publishing.",
          );
      }
      const values = [
        clean(b.title, 200),
        String(b.summary || "").slice(0, 1200),
        String(b.body || "").slice(0, 40000),
        safeUrl(b.image),
        String(b.category || "").slice(0, 100),
        b.status,
        Number(b.sort) || 0,
        JSON.stringify(data),
        safeUrl(b.source),
        b.published_at ? new Date(b.published_at).toISOString() : now(),
      ];
      if (method === "POST") {
        const newId = uid();
        await run(
          db,
          "INSERT INTO content(id,kind,slug,title,summary,body,image,category,status,sort,data,source,published_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
          newId,
          kind,
          b.slug,
          ...values,
          now(),
          now(),
        );
        await audit(db, u.id, "content.create", newId, b.status);
        return json({ id: newId }, 201);
      }
      const old = await first(db, "SELECT * FROM content WHERE id=?", id);
      assert(old, "Content not found.", 404);
      if (b.updated_at)
        assert(
          b.updated_at === old.updated_at,
          "Another editor changed this record. Reload before saving.",
          409,
        );
      await db.batch([
        db
          .prepare(
            "INSERT INTO content_revisions(id,content_id,snapshot,user_id,created_at) VALUES(?,?,?,?,?)",
          )
          .bind(uid(), id, JSON.stringify(old), u.id, now()),
        db
          .prepare(
            "UPDATE content SET kind=?,slug=?," +
              editableFields.map((k) => k + "=?").join(",") +
              ",updated_at=? WHERE id=?",
          )
          .bind(kind, b.slug, ...values, now(), id),
      ]);
      await audit(db, u.id, "content.update", id, b.status);
      return json({ ok: true });
    }
    if (method === "DELETE") {
      await run(
        db,
        "UPDATE content SET status='archived',updated_at=? WHERE id=?",
        now(),
        id,
      );
      await audit(db, u.id, "content.archive", id);
      return json({ ok: true });
    }
  }
  const tables: Record<string, string> = {
    applications: "applications",
    donations: "donations",
    users: "users",
    inbox: "contacts",
    audit: "audit_logs",
    media: "media",
    notifications: "notifications",
    store: "store_orders",
  };
  const table = tables[section];
  assert(table, "Unknown administration section.", 404);
  if (method === "GET") {
    const page = Math.max(1, Number(url.searchParams.get("page")) || 1),
      limit = 20,
      q = (url.searchParams.get("q") || "").slice(0, 150),
      status = url.searchParams.get("status"),
      kind = url.searchParams.get("kind"),
      from = url.searchParams.get("from"),
      to = url.searchParams.get("to");
    let where = "1=1";
    const values: any[] = [];
    const searchCols: Record<string, string[]> = {
      applications: ["name", "email", "reference"],
      donations: ["name", "email", "purpose"],
      users: ["name", "email"],
      inbox: ["name", "email", "subject"],
      audit: ["action", "target"],
      media: ["name", "alt"],
      notifications: ["email", "subject"],
      store: ["reference", "status"],
    };
    if (q) {
      where +=
        " AND (" +
        searchCols[section].map((k) => k + " LIKE ?").join(" OR ") +
        ")";
      values.push(...searchCols[section].map(() => "%" + q + "%"));
    }
    if (
      status &&
      ["applications", "donations", "inbox", "notifications", "store"].includes(
        section,
      )
    ) {
      where += " AND status=?";
      values.push(status);
    }
    if (kind && section === "applications") {
      where += " AND kind=?";
      values.push(kind);
    }
    if (from) {
      where += " AND created_at>=?";
      values.push(from);
    }
    if (to) {
      where += " AND created_at<=?";
      values.push(to + "T23:59:59.999Z");
    }
    if (id) {
      where += " AND id=?";
      values.push(id);
    }
    const columns =
      section === "users"
        ? "id,name,email,phone,verified,active,created_at"
        : section === "notifications"
          ? "id,email,subject,status,attempts,created_at"
          : "*";
    const count = await first(
      db,
      `SELECT COUNT(*) AS total FROM ${table} WHERE ${where}`,
      ...values,
    );
    const exportCsv = url.searchParams.get("export") === "csv";
    const rows = await all(
      db,
      `SELECT ${columns} FROM ${table} WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      ...values,
      exportCsv ? 10000 : limit,
      exportCsv ? 0 : (page - 1) * limit,
    );
    if (section === "users")
      for (const row of rows)
        row.roles = (
          await all(
            db,
            "SELECT role_id FROM user_roles WHERE user_id=?",
            row.id,
          )
        ).map((r) => r.role_id);
    if (id && section === "applications" && rows[0])
      rows[0].history = await all(
        db,
        "SELECT * FROM application_history WHERE application_id=? ORDER BY created_at DESC",
        id,
      );
    if (id && section === "donations" && rows[0]) {
      rows[0].orders = await all(
        db,
        "SELECT * FROM payment_orders WHERE donation_id=?",
        id,
      );
      rows[0].transactions = await all(
        db,
        "SELECT t.* FROM payment_transactions t JOIN payment_orders o ON o.id=t.order_id WHERE o.donation_id=?",
        id,
      );
      rows[0].receipt = await first(
        db,
        "SELECT id FROM receipts WHERE donation_id=?",
        id,
      );
    }
    if (id && section === "store" && rows[0])
      rows[0].items = await all(
        db,
        "SELECT i.*,c.title FROM store_items i JOIN content c ON c.id=i.product_id WHERE i.order_id=?",
        id,
      );
    if (exportCsv) {
      await audit(db, u.id, section + ".export", table);
      return new Response(csv(rows), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${section}.csv"`,
          "Cache-Control": "private, no-store",
        },
      });
    }
    return json({
      items: rows,
      total: count.total,
      page,
      pages: Math.ceil(count.total / limit),
    });
  }
  if (section === "media" && method === "DELETE") {
    const item = await first(db, "SELECT * FROM media WHERE id=?", id);
    assert(item, "File not found.", 404);
    const used = await first(
      db,
      "SELECT id FROM content WHERE image=? OR data LIKE ? OR body LIKE ? UNION SELECT id FROM settings WHERE value LIKE ? LIMIT 1",
      "/api/media/" + id,
      "%" + id + "%",
      "%" + id + "%",
      "%" + id + "%",
    );
    assert(
      !used,
      "This file is still used by content. Remove its references before deleting.",
      409,
    );
    await bucket().delete(item.key);
    await run(db, "DELETE FROM media WHERE id=?", id);
    await audit(db, u.id, "media.delete", id);
    return json({ ok: true });
  }
  if (section === "notifications" && method === "POST") {
    await sendNotification(db, id);
    await audit(db, u.id, "notification.retry", id);
    return json({ ok: true });
  }
  if (method === "PATCH") {
    const b = await body(req);
    const item = await first(db, `SELECT * FROM ${table} WHERE id=?`, id);
    assert(item, "Record not found.", 404);
    if (section === "applications") {
      assert(statuses.includes(b.status), "Invalid application status.");
      const message = String(b.message || "").slice(0, 2000);
      await db.batch([
        db
          .prepare(
            "UPDATE applications SET status=?,notes=?,updated_at=? WHERE id=?",
          )
          .bind(b.status, String(b.notes || "").slice(0, 5000), now(), id),
        db
          .prepare(
            "INSERT INTO application_history(id,application_id,status,message,actor_id,created_at) VALUES(?,?,?,?,?,?)",
          )
          .bind(uid(), id, b.status, message, u.id, now()),
      ]);
      await notify(
        db,
        item.user_id,
        item.email,
        "Application update: " + item.reference,
        "Your application status is " +
          b.status.replace(/_/g, " ") +
          ". " +
          message,
      );
    } else if (section === "inbox") {
      assert(
        ["new", "read", "resolved"].includes(b.status),
        "Invalid message status.",
      );
      await run(
        db,
        "UPDATE contacts SET status=?,notes=? WHERE id=?",
        b.status,
        String(b.notes || "").slice(0, 5000),
        id,
      );
    } else if (section === "store") {
      assert(
        ["inquiry", "contacted", "cancelled", "fulfilled"].includes(b.status),
        "Invalid store status.",
      );
      await run(
        db,
        "UPDATE store_orders SET status=? WHERE id=?",
        b.status,
        id,
      );
    } else if (section === "users") {
      assert(
        id !== u.id,
        "Use your profile to edit your own account. Administrator access cannot be self-revoked.",
      );
      assert(roleNames.includes(b.role), "Invalid role.");
      const isAdmin = await first(
        db,
        "SELECT id FROM user_roles WHERE user_id=? AND role_id='admin'",
        id,
      );
      if (isAdmin && (b.role !== "admin" || !b.active)) {
        const admins = await first(
          db,
          "SELECT COUNT(*) AS count FROM user_roles ur JOIN users u ON u.id=ur.user_id WHERE ur.role_id='admin' AND u.active=1",
        );
        assert(
          admins.count > 1,
          "At least one active administrator must remain.",
        );
      }
      await db.batch([
        db
          .prepare("UPDATE users SET active=?,verified=? WHERE id=?")
          .bind(b.active ? 1 : 0, b.verified ? 1 : 0, id),
        db.prepare("DELETE FROM user_roles WHERE user_id=?").bind(id),
        db
          .prepare("INSERT INTO user_roles(id,user_id,role_id) VALUES(?,?,?)")
          .bind(uid(), id, b.role),
        db.prepare("DELETE FROM sessions WHERE user_id=?").bind(id),
      ]);
    } else if (section === "media") {
      await run(
        db,
        "UPDATE media SET alt=?,caption=? WHERE id=?",
        clean(b.alt, 300),
        String(b.caption || "").slice(0, 500),
        id,
      );
    } else throw new HttpError(405, "This record cannot be edited directly.");
    await audit(
      db,
      u.id,
      section + ".update",
      id,
      JSON.stringify({ status: b.status, role: b.role }),
    );
    return json({ ok: true });
  }
  throw new HttpError(405, "Method not supported.");
}
