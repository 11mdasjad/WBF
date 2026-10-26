import test from "node:test";
import assert from "node:assert/strict";
import { build } from "esbuild";
import { mkdir } from "node:fs/promises";

await mkdir("outputs", { recursive: true });
await build({
  entryPoints: ["lib/server/runtime.ts"],
  outfile: "outputs/test-runtime.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  packages: "external",
});
const { getDatabase, getBucket } = await import("../outputs/test-runtime.mjs");

test("Vercel runtime refuses missing credentials and temporary database files", async () => {
  const names = [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "VERCEL",
    "BLOB_READ_WRITE_TOKEN",
  ];
  const saved = Object.fromEntries(names.map((key) => [key, process.env[key]]));
  try {
    names.forEach((key) => delete process.env[key]);
    await assert.rejects(getDatabase, (e) => e.status === 503);
    assert.throws(getBucket, (e) => e.status === 503);
    process.env.VERCEL = "1";
    process.env.TURSO_DATABASE_URL = "file:/tmp/wbf.db";
    await assert.rejects(getDatabase, /remote Turso database/);
    process.env.TURSO_DATABASE_URL = "libsql://example.turso.io";
    await assert.rejects(getDatabase, /authentication is not configured/);
  } finally {
    for (const key of names) {
      if (saved[key] === undefined) delete process.env[key];
      else process.env[key] = saved[key];
    }
  }
});

const calls = [];
let blobResult;
globalThis.__WBF_BLOB_TEST = {
  put: async (...args) => calls.push(["put", ...args]),
  get: async (...args) => {
    calls.push(["get", ...args]);
    return blobResult;
  },
  del: async (...args) => calls.push(["del", ...args]),
};
await build({
  entryPoints: ["lib/server/storage.ts"],
  outfile: "outputs/test-storage.mjs",
  bundle: true,
  platform: "node",
  format: "esm",
  plugins: [
    {
      name: "blob-service-boundary",
      setup(b) {
        b.onResolve({ filter: /^@vercel\/blob$/ }, () => ({
          path: "blob",
          namespace: "test",
        }));
        b.onLoad({ filter: /.*/, namespace: "test" }, () => ({
          contents:
            "export const { put, get, del } = globalThis.__WBF_BLOB_TEST;",
          loader: "js",
        }));
      },
    },
  ],
});
const { createStorage } = await import("../outputs/test-storage.mjs");

test("Blob adapter keeps uploads private and streams reads through the API", async () => {
  const storage = createStorage("test-token");
  await storage.put("image.png", new Uint8Array([137, 80, 78, 71]), {
    httpMetadata: { contentType: "image/png" },
  });
  assert.equal(calls[0][1], "image.png");
  assert.equal(calls[0][3].access, "private");
  assert.equal(calls[0][3].addRandomSuffix, false);
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array([1]));
      controller.close();
    },
  });
  blobResult = { statusCode: 200, stream };
  assert.deepEqual(await storage.get("image.png"), { body: stream });
  assert.deepEqual(calls[1], [
    "get",
    "image.png",
    { access: "private", token: "test-token" },
  ]);
  blobResult = null;
  assert.equal(await storage.get("missing.png"), null);
  await storage.delete("image.png");
  assert.deepEqual(calls.at(-1), ["del", "image.png", { token: "test-token" }]);
});
