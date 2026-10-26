import { createClient } from "@libsql/client/web";
import { createDatabase, type Database } from "./database";
import { createStorage } from "./storage";
import { assert } from "./security";

export const config = process.env;
let db: Database | undefined;
let storage: ReturnType<typeof createStorage> | undefined;

export async function getDatabase() {
  const url = config.TURSO_DATABASE_URL;
  assert(
    url,
    "Database is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.",
    503,
  );
  // Serverless filesystems are temporary and must never hold the production DB.
  assert(
    !config.VERCEL || /^(libsql|https):\/\//.test(url),
    "Vercel requires a remote Turso database.",
    503,
  );
  assert(
    url.startsWith("file:") || config.TURSO_AUTH_TOKEN,
    "Database authentication is not configured.",
    503,
  );
  // Remote deployments use the HTTP client with no native SQLite binary.
  // Load the native driver only for an explicitly configured local file.
  if (!db) {
    const clientFactory = url.startsWith("file:")
      ? (await import("@libsql/client")).createClient
      : createClient;
    db = createDatabase(
      clientFactory({ url, authToken: config.TURSO_AUTH_TOKEN }),
    );
  }
  return db;
}

export function getBucket() {
  assert(
    config.BLOB_READ_WRITE_TOKEN,
    "File storage is not configured. Connect a private Vercel Blob store.",
    503,
  );
  storage ??= createStorage(config.BLOB_READ_WRITE_TOKEN);
  return storage;
}
