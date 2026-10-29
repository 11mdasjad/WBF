process.env.WBF_DEPLOY_TARGET = "cloudflare";
process.argv = [process.execPath, process.argv[1], "build", ...process.argv.slice(2)];
await import("./run-framework.mjs");
