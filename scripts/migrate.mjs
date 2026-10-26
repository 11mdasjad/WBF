import { createClient } from "@libsql/client";
import { createHash } from "node:crypto";
import { readdir, readFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const url = process.env.TURSO_DATABASE_URL;
if (!url)
  throw new Error("Set TURSO_DATABASE_URL in .env.local or the environment.");
if (process.env.VERCEL && !/^(libsql|https):\/\//.test(url))
  throw new Error("Vercel requires a remote Turso database.");
if (!url.startsWith("file:") && !process.env.TURSO_AUTH_TOKEN)
  throw new Error("Set TURSO_AUTH_TOKEN for the remote database.");
if (url.startsWith("file:"))
  await mkdir(dirname(resolve(url.slice(5))), { recursive: true });

const client = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
try {
  await client.execute(`CREATE TABLE IF NOT EXISTS wbf_migrations (
    name TEXT PRIMARY KEY, checksum TEXT NOT NULL, applied_at TEXT NOT NULL
  )`);
  for (const name of (await readdir("drizzle"))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    const sql = await readFile("drizzle/" + name, "utf8");
    const checksum = createHash("sha256").update(sql).digest("hex");
    // Serialize migration checks with the schema writes and journal entry.
    const tx = await client.transaction("write");
    try {
      const applied = await tx.execute({
        sql: "SELECT checksum FROM wbf_migrations WHERE name=?",
        args: [name],
      });
      if (applied.rows.length) {
        if (applied.rows[0].checksum !== checksum)
          throw new Error(`Applied migration changed: ${name}`);
      } else {
        for (const statement of sql
          .split("--> statement-breakpoint")
          .map((s) => s.trim())
          .filter(Boolean))
          await tx.execute(statement);
        await tx.execute({
          sql: "INSERT INTO wbf_migrations(name,checksum,applied_at) VALUES(?,?,?)",
          args: [name, checksum, new Date().toISOString()],
        });
      }
      await tx.commit();
      console.log(
        `${applied.rows.length ? "Already applied" : "Applied"}: ${name}`,
      );
    } finally {
      if (!tx.closed) await tx.rollback();
      tx.close();
    }
  }
  console.log("Database migrations are current.");
} finally {
  client.close();
}
