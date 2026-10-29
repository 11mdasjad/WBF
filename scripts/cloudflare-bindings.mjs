// Keep local preview identifiers out of standalone Cloudflare deployments.
export const LOCAL_DATABASE_ID = "00000000-0000-4000-8000-000000000000";

export function storageBindings(hosting, command, env = process.env) {
  const production = command === "build" &&
    (env.WBF_DEPLOY_TARGET === "cloudflare" || env.WORKERS_CI === "1" || env.WORKERS_CI === "true");
  const databaseId = production ? env.WBF_D1_DATABASE_ID?.trim() : LOCAL_DATABASE_ID;
  if (production && databaseId &&
      (databaseId === LOCAL_DATABASE_ID || !/^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i.test(databaseId))) {
    throw new Error("WBF_D1_DATABASE_ID must be a real Cloudflare D1 database ID, not the local preview ID.");
  }
  return {
    d1_databases: hosting.d1 ? [{
      binding: hosting.d1,
      database_name: production ? env.WBF_D1_DATABASE_NAME?.trim() || "site-creator-d1" : "site-creator-d1",
      // Omission lets Wrangler provision/reuse the named database on deployment.
      ...(databaseId ? { database_id: databaseId } : {}),
    }] : [],
    r2_buckets: hosting.r2 ? [{
      binding: hosting.r2,
      bucket_name: production ? env.WBF_R2_BUCKET_NAME?.trim() || "site-creator-r2" : "site-creator-r2",
    }] : [],
  };
}
