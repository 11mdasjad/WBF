import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
const base = process.env.WBF_BASE_URL || "http://127.0.0.1:5173";
const vars = await readFile(".dev.vars", "utf8").catch(() => "");
const token = process.env.SETUP_TOKEN || vars.match(/^SETUP_TOKEN=(.+)$/m)?.[1];
if (!token)
  throw new Error("Set SETUP_TOKEN in .dev.vars before starting the server.");
const credentials = {
  name: process.env.WBF_ADMIN_NAME || "Foundation Administrator",
  email: process.env.WBF_ADMIN_EMAIL || "admin@wbf.test",
  password: randomBytes(24).toString("base64url"),
};
const r = await fetch(base + "/api/setup", {
  method: "POST",
  headers: { "content-type": "application/json", "x-setup-token": token },
  body: JSON.stringify(credentials),
});
const data = await r.json();
if (!r.ok) throw new Error(data.error);
await writeFile(
  "local-access.json",
  JSON.stringify({ url: base + "/admin/", ...credentials }, null, 2) + "\n",
  { mode: 0o600 },
);
console.log(
  "Administrator created. Credentials saved to ignored local-access.json (permissions 0600).",
);
