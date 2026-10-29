import assert from "node:assert/strict";
import { test } from "node:test";
import { mkdtemp, mkdir, copyFile, writeFile, readFile, readdir, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { LOCAL_DATABASE_ID, storageBindings } from "../scripts/cloudflare-bindings.mjs";

const hosting = { d1: "DB", r2: "BUCKET" };
test("Workers Builds never deploys the preview D1 UUID and retains required storage", () => {
  for (const env of [{ WORKERS_CI: "1" }, { WORKERS_CI: "true" }, { WBF_DEPLOY_TARGET: "cloudflare" }]) {
    const result = storageBindings(hosting, "build", env);
    assert.equal(result.d1_databases[0].database_id, undefined);
    assert.equal(result.d1_databases[0].binding, "DB");
    assert.equal(result.d1_databases[0].database_name, "site-creator-d1");
    assert.deepEqual(result.r2_buckets, [{ binding: "BUCKET", bucket_name: "site-creator-r2" }]);
  }
});
test("production can reuse account resources without changing local preview state", () => {
  const env = {
    WBF_DEPLOY_TARGET: "cloudflare",
    WBF_D1_DATABASE_ID: "12345678-1234-4234-8234-123456789abc",
    WBF_D1_DATABASE_NAME: "wbf-production",
    WBF_R2_BUCKET_NAME: "wbf-uploads",
  };
  const result = storageBindings(hosting, "build", env);
  assert.equal(result.d1_databases[0].database_id, env.WBF_D1_DATABASE_ID);
  assert.equal(result.d1_databases[0].database_name, env.WBF_D1_DATABASE_NAME);
  assert.equal(result.r2_buckets[0].bucket_name, env.WBF_R2_BUCKET_NAME);
  const local = storageBindings(hosting, "serve", env);
  assert.equal(local.d1_databases[0].database_id, LOCAL_DATABASE_ID);
  assert.equal(local.d1_databases[0].database_name, "site-creator-d1");
  assert.equal(local.r2_buckets[0].bucket_name, "site-creator-r2");
  assert.deepEqual(storageBindings(hosting, "build", {}), local);
});
test("invalid or placeholder production IDs fail before deployment", () => {
  for (const id of [LOCAL_DATABASE_ID, "not-a-database-id"]) {
    assert.throws(() => storageBindings(hosting, "build", {
      WORKERS_CI: "1", WBF_D1_DATABASE_ID: id,
    }), /real Cloudflare D1 database ID/);
  }
});
test("unconfigured bindings remain absent", () => {
  assert.deepEqual(storageBindings({}, "build", { WORKERS_CI: "1" }), {
    d1_databases: [], r2_buckets: [],
  });
});

async function migrationFixture(t, database, databases = []) {
  const root = await realpath(await mkdtemp(path.join(tmpdir(), "wbf-deploy-test-")));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const directory of ["scripts", "dist/server", "node_modules/wrangler/bin", "drizzle"]) {
    await mkdir(path.join(root, directory), { recursive: true });
  }
  for (const file of ["migrate-cloudflare.mjs", "cloudflare-bindings.mjs"]) {
    await copyFile(new URL(`../scripts/${file}`, import.meta.url), path.join(root, "scripts", file));
  }
  await writeFile(path.join(root, "package.json"), '{"type":"module"}');
  await writeFile(path.join(root, "dist/server/wrangler.json"), JSON.stringify({ d1_databases: [database] }));
  await writeFile(path.join(root, "databases.json"), JSON.stringify(databases));
  // Exercise the real orchestration with a network-free Wrangler executable.
  await writeFile(path.join(root, "node_modules/wrangler/bin/wrangler.js"), `
    const fs = require("node:fs");
    const args = process.argv.slice(2);
    const configPath = args[args.indexOf("--config") + 1];
    fs.appendFileSync("calls.jsonl", JSON.stringify({ args, config: JSON.parse(fs.readFileSync(configPath, "utf8")) }) + "\\n");
    if (args[1] === "list") process.stdout.write(fs.readFileSync("databases.json"));
  `);
  return {
    root,
    run: () => spawnSync(process.execPath, [path.join(root, "scripts/migrate-cloudflare.mjs")], { encoding: "utf8" }),
    calls: async () => (await readFile(path.join(root, "calls.jsonl"), "utf8").catch(() => ""))
      .trim().split("\n").filter(Boolean).map((line) => JSON.parse(line)),
  };
}

test("remote migrations reject local preview builds before invoking Wrangler", async (t) => {
  const fixture = await migrationFixture(t, { binding: "DB", database_id: LOCAL_DATABASE_ID });
  const result = fixture.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing remote migrations/);
  assert.deepEqual(await fixture.calls(), []);
});

test("remote migrations resolve the exact provisioned database and clean temporary config", async (t) => {
  const id = "12345678-1234-4234-8234-123456789abc";
  const fixture = await migrationFixture(t, { binding: "DB", database_name: "wbf-production" }, [
    { name: "unrelated-project", uuid: "unrelated" },
    { name: "wbf-production", uuid: id },
  ]);
  const result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  const calls = await fixture.calls();
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[1].args.slice(0, 5), ["d1", "migrations", "apply", "DB", "--remote"]);
  assert.equal(calls[1].config.d1_databases[0].database_id, id);
  assert.equal(calls[1].config.d1_databases[0].migrations_dir, path.join(fixture.root, "drizzle"));
  assert.deepEqual(await readdir(path.join(fixture.root, ".sites-runtime/cloudflare")), []);
});

test("missing production database never applies migrations to an unrelated database", async (t) => {
  const fixture = await migrationFixture(t, { binding: "DB", database_name: "wbf-production" }, [
    { name: "unrelated-project", uuid: "unrelated" },
  ]);
  const result = fixture.run();
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Deploy first/);
  assert.equal((await fixture.calls()).length, 1);
});

test("explicit production database ID skips account-wide lookup", async (t) => {
  const id = "12345678-1234-4234-8234-123456789abc";
  const fixture = await migrationFixture(t, { binding: "DB", database_id: id });
  const result = fixture.run();
  assert.equal(result.status, 0, result.stderr);
  const calls = await fixture.calls();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].args[1], "migrations");
  assert.equal(calls[0].config.d1_databases[0].database_id, id);
});
