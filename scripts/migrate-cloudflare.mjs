import { readFile, mkdir, writeFile, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { LOCAL_DATABASE_ID } from "./cloudflare-bindings.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const configPath = path.join(root, "dist/server/wrangler.json");
const wrangler = path.join(root, "node_modules/wrangler/bin/wrangler.js");
const environment = { ...process.env, WRANGLER_SEND_METRICS: "false" };

function run(args, capture = false) {
  const result = spawnSync(process.execPath, [wrangler, ...args], {
    cwd: root, env: environment, encoding: "utf8",
    stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`Wrangler failed (exit ${result.status ?? "unknown"}).`);
  return result.stdout;
}

try {
  const config = JSON.parse(await readFile(configPath, "utf8"));
  const database = config.d1_databases?.find((entry) => entry.binding === "DB");
  if (!database || database.database_id === LOCAL_DATABASE_ID) {
    throw new Error("Run npm run build:cloudflare first. Refusing remote migrations with local preview bindings.");
  }
  let databaseId = database.database_id;
  if (!databaseId) {
    // CI auto-provisioning does not write generated IDs back to the repository.
    const databases = JSON.parse(run(["d1", "list", "--json", "--config", configPath], true));
    const matches = databases.filter((entry) => entry.name === database.database_name);
    if (matches.length !== 1) {
      throw new Error(`Deploy first so Wrangler can provision ${database.database_name}, or configure WBF_D1_DATABASE_ID and rebuild.`);
    }
    databaseId = matches[0].uuid;
  }
  if (!databaseId || databaseId === LOCAL_DATABASE_ID) throw new Error("A real D1 database ID is required.");
  const directory = path.join(root, ".sites-runtime/cloudflare");
  await mkdir(directory, { recursive: true });
  const migrationConfig = path.join(directory, `migrations-${process.pid}.json`);
  try {
    await writeFile(migrationConfig, JSON.stringify({
      ...(config.account_id ? { account_id: config.account_id } : {}),
      d1_databases: [{
        ...database,
        database_id: databaseId,
        migrations_dir: path.join(root, "drizzle"),
      }],
    }), { mode: 0o600 });
    run(["d1", "migrations", "apply", "DB", "--remote", "--config", migrationConfig]);
  } finally {
    await rm(migrationConfig, { force: true });
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
