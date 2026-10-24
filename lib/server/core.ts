import { env } from "cloudflare:workers";
import { seed, defaults } from "./seed";
import { assert, digest, uid, now, randomToken, HttpError } from "./security";
export const config = env as unknown as Record<string, string>;
export async function database() {
  assert(env.DB, "Database is not configured.", 503);
  await seed(env.DB);
  return env.DB!;
}
export async function all(db: D1Database, sql: string, ...args: any[]) {
  return (
    await db
      .prepare(sql)
      .bind(...args)
      .all()
  ).results as any[];
}
export async function first(db: D1Database, sql: string, ...args: any[]) {
  return db
    .prepare(sql)
    .bind(...args)
    .first() as Promise<any>;
}
export async function run(db: D1Database, sql: string, ...args: any[]) {
  return db
    .prepare(sql)
    .bind(...args)
    .run();
}
export async function audit(
  db: D1Database,
  userId: string | null,
  action: string,
  target: string,
  detail = "",
) {
  await run(
    db,
    "INSERT INTO audit_logs(id,user_id,action,target,detail,created_at) VALUES(?,?,?,?,?,?)",
    uid(),
    userId,
    action,
    target,
    detail,
    now(),
  );
}
export async function rate(
  db: D1Database,
  req: Request,
  scope: string,
  max = 12,
) {
  const bucket = Math.floor(Date.now() / 900000);
  const ip = req.headers.get("cf-connecting-ip") || "local";
  const key = await digest(ip + scope + bucket);
  const r = await first(
    db,
    "INSERT INTO rate_limits(id,count,expires_at) VALUES(?,1,?) ON CONFLICT(id) DO UPDATE SET count=count+1 RETURNING count",
    key,
    Date.now() + 900000,
  );
  assert(
    r.count <= max,
    "Too many attempts. Please try again in 15 minutes.",
    429,
  );
  await run(db, "DELETE FROM rate_limits WHERE expires_at < ?", Date.now());
}
export async function currentUser(db: D1Database, req: Request) {
  const raw = req.headers
    .get("cookie")
    ?.match(/(?:^|;\s*)wbf_session=([^;]+)/)?.[1];
  if (!raw) return null;
  const user = await first(
    db,
    "SELECT u.id,u.name,u.email,u.phone,u.verified,u.active,u.created_at FROM sessions s JOIN users u ON u.id=s.user_id WHERE s.id=? AND s.expires_at>? AND u.active=1",
    await digest(raw),
    now(),
  );
  if (!user) return null;
  user.roles = (
    await all(db, "SELECT role_id FROM user_roles WHERE user_id=?", user.id)
  ).map((r) => r.role_id);
  user.permissions = (
    await all(
      db,
      "SELECT DISTINCT rp.permission_id FROM role_permissions rp JOIN user_roles ur ON ur.role_id=rp.role_id WHERE ur.user_id=?",
      user.id,
    )
  ).map((r) => r.permission_id);
  return user;
}
export async function requireUser(
  db: D1Database,
  req: Request,
  permission?: string,
) {
  const u = await currentUser(db, req);
  assert(u, "Please sign in to continue.", 401);
  if (permission)
    assert(
      u.permissions.includes(permission),
      "You do not have permission to access this area.",
      403,
    );
  return u;
}
export async function session(db: D1Database, req: Request, userId: string) {
  const token = randomToken();
  await run(
    db,
    "INSERT INTO sessions(id,user_id,expires_at,created_at) VALUES(?,?,?,?)",
    await digest(token),
    userId,
    new Date(Date.now() + 604800000).toISOString(),
    now(),
  );
  return `wbf_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800${new URL(req.url).protocol === "https:" ? "; Secure" : ""}`;
}
export async function notify(
  db: D1Database,
  userId: string | null,
  email: string,
  subject: string,
  message: string,
) {
  const id = uid();
  await run(
    db,
    "INSERT INTO notifications(id,user_id,email,subject,body,status,attempts,created_at) VALUES(?,?,?,?,?,?,0,?)",
    id,
    userId,
    email,
    subject,
    message,
    "queued",
    now(),
  );
  if (config.RESEND_API_KEY && config.EMAIL_FROM)
    await sendNotification(db, id);
  return id;
}
export async function sendNotification(db: D1Database, id: string) {
  const n = await first(
    db,
    "SELECT * FROM notifications WHERE id=? AND status IN ('queued','failed')",
    id,
  );
  if (!n) return;
  assert(
    config.RESEND_API_KEY && config.EMAIL_FROM,
    "Email delivery is not configured.",
    503,
  );
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + config.RESEND_API_KEY,
        "Content-Type": "application/json",
        "Idempotency-Key": id,
      },
      body: JSON.stringify({
        from: config.EMAIL_FROM,
        to: [n.email],
        subject: n.subject,
        text: n.body,
      }),
    });
    await run(
      db,
      "UPDATE notifications SET status=?,attempts=attempts+1 WHERE id=?",
      r.ok ? "sent" : "failed",
      id,
    );
  } catch {
    await run(
      db,
      "UPDATE notifications SET status='failed',attempts=attempts+1 WHERE id=?",
      id,
    );
  }
}
export async function tokenEmail(
  db: D1Database,
  req: Request,
  u: any,
  kind: string,
) {
  const raw = randomToken();
  const id = await digest(raw);
  await run(
    db,
    "INSERT INTO tokens(id,user_id,kind,expires_at,created_at) VALUES(?,?,?,?,?)",
    id,
    u.id,
    kind,
    new Date(
      Date.now() + (kind === "verify" ? 86400000 : 3600000),
    ).toISOString(),
    now(),
  );
  const path = kind === "verify" ? "verify-email" : "reset-password";
  await notify(
    db,
    u.id,
    u.email,
    kind === "verify" ? "Verify your WBF account" : "Reset your WBF password",
    `${kind === "verify" ? "Verify your email" : "Reset your password"} using this link: ${new URL("/" + path + "/?token=" + raw, req.url)}\nIf you did not request this, ignore this email.`,
  );
}
export const decode = (r: any) => ({ ...r, data: JSON.parse(r.data || "{}") });
export const publicEntry = (r: any) => {
  const item = decode(r);
  if (Array.isArray(item.data.sections))
    item.data.sections = item.data.sections.filter(
      (s: any) => s.visible === true,
    );
  return item;
};
export const bucket = () => {
  assert(env.BUCKET, "File storage is not configured.", 503);
  return env.BUCKET!;
};
export function json(
  data: unknown,
  status = 200,
  headers: Record<string, string> = {},
) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      ...headers,
    },
  });
}
export function errorResponse(e: unknown) {
  if (e instanceof HttpError) return json({ error: e.message }, e.status);
  console.error(e instanceof Error ? e.message : "Request failed");
  return json(
    { error: "We could not complete that request. Please try again." },
    500,
  );
}

export async function organizationSettings(db: D1Database) {
  return {
    ...defaults,
    ...JSON.parse(
      (await first(db, "SELECT value FROM settings WHERE id='organization'"))
        .value,
    ),
  };
}
