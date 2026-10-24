import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
const statePath = ".sites-runtime/local-migrations.json";
const done = JSON.parse(await readFile(statePath, "utf8").catch(() => "[]"));
await mkdir(".sites-runtime", { recursive: true });
for (const file of (await readdir("drizzle"))
  .filter((f) => f.endsWith(".sql"))
  .sort()) {
  if (done.includes(file)) continue;
  const result = spawnSync(
    process.execPath,
    [
      "--import",
      "./scripts/sites-env.mjs",
      "./node_modules/wrangler/bin/wrangler.js",
      "d1",
      "execute",
      "DB",
      "--local",
      "--config",
      "dist/server/wrangler.json",
      "--persist-to",
      ".wrangler/state",
      "--file",
      "drizzle/" + file,
    ],
    { stdio: "inherit" },
  );
  if (result.status !== 0) process.exit(result.status || 1);
  done.push(file);
  await writeFile(statePath, JSON.stringify(done, null, 2) + "\n");
}
console.log("Local database migrations are current.");
