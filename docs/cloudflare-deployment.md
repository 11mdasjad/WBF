# Deploy to your own Cloudflare account

The application needs both D1 (`DB`) and R2 (`BUCKET`). A successful build does not mean these account services are ready.

## Error 10042: enable R2

`Please enable R2 through the Cloudflare Dashboard [code: 10042]` is an account provisioning error, not a compilation error. In the **same account used by Workers Builds**, open **Storage & databases → R2 Object Storage**, and complete the R2 activation flow. Cloudflare may request billing details. A Workers Paid subscription does not automatically activate R2. Repository code cannot enable the subscription. Keep the `BUCKET` binding: removing it breaks uploads and stored documents.

Official instructions: https://developers.cloudflare.com/r2/get-started/

## Workers Builds settings

- Build command: `npm run build:cloudflare`
- Deploy command: `npx wrangler deploy && npm run db:migrate:cloudflare`
- Root directory: the directory containing `package.json` (`/` in this GitHub repository).

The existing `npm run build` also selects production bindings automatically inside Workers Builds (`WORKERS_CI=1`). The explicit build command works locally and in other CI systems too. Local development and normal local builds keep their existing preview database.

On first deployment, Wrangler provisions or reuses the named D1 database and R2 bucket. Subsequent deployments reuse these resources. The default resource names remain `site-creator-d1` and `site-creator-r2`, matching the previous configuration; do not rename them after storing production data.

The migration command resolves the provisioned D1 database, applies the SQL files in `drizzle/`, and records applied migrations using Wrangler's migration history. It does not upload local preview data. Initial deployment must finish these migrations before the website can serve database-backed requests; future releases with schema changes should apply backward-compatible migrations before deploying the new application.

If an existing database was initialized outside Wrangler migrations, reconcile its migration history before using this command; do not run the initial schema over existing tables blindly.

## Existing resources / custom names

Optional **build variables**:

| Variable | Purpose |
| --- | --- |
| `WBF_D1_DATABASE_ID` | Real D1 UUID, if the database already exists. Never use the all-zero local preview UUID. |
| `WBF_D1_DATABASE_NAME` | Database name; defaults to `site-creator-d1`. Set this to the name matching the supplied ID. |
| `WBF_R2_BUCKET_NAME` | Bucket name; defaults to `site-creator-r2`. |

These are resource identifiers, not secrets. Do not share the default resources between unrelated projects; give each project its own names. Ensure the deployment token has access to Workers, D1 and R2 in the intended account. Workers Builds supplies its deployment credentials; local deployments require `wrangler login` or appropriate Cloudflare environment credentials.

Keep application secrets such as `SETUP_TOKEN` and payment/email provider keys in the deployed Worker's secrets, not Git or frontend build variables. Follow [deployment.md](deployment.md) for administrator bootstrap and service configuration.

## Local verification without publishing

```sh
npm run test:deployment
npm run typecheck
npm run build:cloudflare
npx wrangler deploy --dry-run
```

A dry run validates the generated bundle and bindings without creating resources or verifying R2 activation in the account. After activating R2 and updating the build/deploy commands, retry the failed Cloudflare deployment.
