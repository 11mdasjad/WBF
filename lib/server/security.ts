import bcrypt from "bcryptjs";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function assert(ok: unknown, message: string, status = 400): asserts ok {
  if (!ok) throw new HttpError(status, message);
}
export const uid = () => crypto.randomUUID();
export const now = () => new Date().toISOString();
export const randomToken = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(32)), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
export async function digest(value: string) {
  return Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
    (x) => x.toString(16).padStart(2, "0"),
  ).join("");
}
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}
export async function checkPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
export async function hmac(secret: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return Array.from(
    new Uint8Array(
      await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)),
    ),
    (x) => x.toString(16).padStart(2, "0"),
  ).join("");
}
export function equal(a: string, b: string) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < Math.max(a.length, b.length); i++)
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
export function clean(value: unknown, max = 300) {
  assert(typeof value === "string", "Please fill in the required fields.");
  const s = value.trim();
  assert(
    s.length > 0 && s.length <= max,
    `Enter between 1 and ${max} characters.`,
  );
  return s;
}
export function email(value: unknown) {
  const s = clean(value, 254).toLowerCase();
  assert(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s), "Enter a valid email address.");
  return s;
}
export function password(value: unknown) {
  assert(
    typeof value === "string" &&
      value.length >= 12 &&
      new TextEncoder().encode(value).length <= 72,
    "Use a password of 12–72 bytes.",
  );
  return value;
}
export function safeUrl(value: unknown, allowEmpty = true) {
  if (!value && allowEmpty) return "";
  const s = clean(value, 2000);
  assert(
    (s.startsWith("/") && !s.startsWith("//") && !s.includes("\\")) ||
      /^https:\/\//.test(s),
    "Use a local path or an HTTPS URL.",
  );
  return s;
}
export async function body(req: Request) {
  assert(
    Number(req.headers.get("content-length") || 0) < 100000,
    "Request too large.",
    413,
  );
  const raw = await req.text();
  assert(raw.length < 100000, "Request too large.", 413);
  try {
    return JSON.parse(raw);
  } catch {
    throw new HttpError(400, "Invalid JSON request.");
  }
}
export function originCheck(req: Request) {
  const origin = req.headers.get("origin");
  assert(
    origin === new URL(req.url).origin,
    "This request must come from this website.",
    403,
  );
}
export function escapeHtml(s: unknown) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
}
export function csv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "No records\n";
  const keys = Object.keys(rows[0]);
  const cell = (v: unknown) =>
    '"' +
    String(v ?? "")
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replace(/"/g, '""') +
    '"';
  return [
    keys.map(cell).join(","),
    ...rows.map((r) => keys.map((k) => cell(r[k])).join(",")),
  ].join("\r\n");
}
