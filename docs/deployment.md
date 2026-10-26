# Deployment and service configuration

## Vercel hosting

This repository now runs native Next.js. `npm run build` produces `.next/routes-manifest.json` and the server bundles Vercel expects. The prior Vinext/Cloudflare build produced a Worker under `dist/server`, which is not a Next.js deployment artifact. Changing the output-directory setting alone cannot make that Worker run on Vercel.

Use the repository root, the Next.js framework preset, Node 22.x and the checked-in `vercel.json`. Remove any dashboard build override that invokes Vinext or `scripts/run-framework.mjs`. The app uses Node.js functions, not Edge functions.

### Persistent database

Create a Turso/libSQL database, preferably near the Vercel function region, and set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in the appropriate Vercel environments. Locally, put the same credentials in ignored `.env.local` and run `npm run db:migrate`. The migration command records checksums in `wbf_migrations`, runs each migration transactionally and can be rerun. It refuses to reapply edited migrations. Builds do not automatically migrate shared databases.

The application preserves the existing SQLite schema, bound SQL parameters and atomic write batches. Initial content and role definitions are seeded on the first request after migration. Database files in Vercel's temporary filesystem are explicitly rejected; `.data/wbf.db` is only for local development. Separate Preview and Production databases prevent preview builds from changing live records.

If moving real data from Cloudflare D1, export and back it up first, then import a reviewed copy into Turso and validate accounts, row counts, permissions, and payment records before switching traffic. The migration script initializes an empty database; it does not copy old D1 data. Legacy Cloudflare helper files remain in the repository for reference, but are not the active build/runtime path. Do not use the old Worker entrypoint for this Next.js deployment.

### File storage

Create a **private** Vercel Blob store under the project's Storage tab and connect it to the desired environments. This supplies `BLOB_READ_WRITE_TOKEN`. All blobs are private at the storage layer, including files marked public by the CMS. `/api/media/:id` checks database visibility and user permissions before streaming the file; tokens and raw Blob URLs are never returned to the browser. Public CMS files retain their existing public cache behavior, while private downloads use `private, no-store`.

Server uploads are limited to 4 MB so multipart requests fit within Vercel's [4.5 MB function payload limit](https://vercel.com/docs/functions/limitations). The UI checks the file size before uploading, and the API revalidates size, MIME type and file signatures. Files previously stored in R2 are not automatically copied. If migrating existing media, copy each object into the private Blob store using its existing database key before switching traffic.

See [Vercel private storage](https://vercel.com/docs/vercel-blob/private-storage) and the [libSQL client documentation](https://tursodatabase.github.io/libsql-client-ts/).

### First deployment

1. Configure the database and private Blob store above.
2. Set `SETUP_TOKEN` to a generated 32+ character random secret and `WBF_SITE_URL` to the public HTTPS origin. Without an explicit site URL, metadata uses Vercel's production domain.
3. Apply migrations with `npm run db:migrate` against the remote database.
4. Deploy `main`, then run `WBF_BASE_URL=https://your-domain.example npm run admin:bootstrap` locally with the same setup token and desired `WBF_ADMIN_EMAIL` in the environment or `.env.local`.
5. Store the generated administrator credentials securely and remove `SETUP_TOKEN` from Vercel after bootstrap. Redeploy environment changes.

A successful build alone does not configure the backend. Pages need the migrated database, uploads need the Blob token, and email/payment providers remain optional as described below. Never upload `.env.local`, `.dev.vars`, local database files or `local-access.json`.

## Environment variables

| Name                         | Purpose                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `TURSO_DATABASE_URL`       | Remote Turso/libSQL URL; local `file:` URLs are rejected on Vercel. |
| `TURSO_AUTH_TOKEN`          | Database access token, server-only. |
| `BLOB_READ_WRITE_TOKEN`     | Token for a private Vercel Blob store, server-only. |
| `WBF_SITE_URL`              | Public HTTPS origin for canonical metadata. |
| `SETUP_TOKEN`                | Random 32+ character secret for one-time admin bootstrap. Remove after bootstrap.  |
| `RAZORPAY_TEST_ENABLED`      | Exactly `true` to allow sandbox checkout.                                          |
| `RAZORPAY_KEY_ID`            | Razorpay test public key; must start `rzp_test_`.                                  |
| `RAZORPAY_KEY_SECRET`        | Razorpay test secret; server-only.                                                 |
| `RAZORPAY_WEBHOOK_SECRET`    | HMAC secret for `/api/payments/webhook`.                                           |
| `RESEND_API_KEY`             | Outbound email provider credential.                                                |
| `EMAIL_FROM`                 | Verified sending identity owned by the actual operator.                            |
| `CONTACT_NOTIFICATION_EMAIL` | Optional authorized inbox destination. No WBF address is automatically subscribed. |

Use `.env.local` locally and Vercel environment variables in hosting. Never put secrets in the hosting manifest or frontend bundle.

## First administrator

Use `scripts/bootstrap-admin.mjs` against the selected site with its setup token. If Vercel Deployment Protection is enabled, use an authorized protection bypass for bootstrap and provider callbacks. The endpoint requires the secret and refuses any subsequent bootstrap once an admin exists. Generated credentials belong in a local password manager or ignored local-access.json; change the password in My Account after handoff.

Do not create an admin through public registration fields. Administrators can promote an already-registered, verified member in People & Access. Role changes revoke old sessions immediately.

## Razorpay sandbox

1. Provide merchant-owned sandbox credentials and a webhook signing secret.
2. Configure a webhook to the site's `/api/payments/webhook` URL for `payment.captured`, `payment.failed` and `refund.processed`.
3. The route must be reachable by Razorpay. Vercel Deployment Protection can block provider callbacks; configure an authorized callback endpoint before provider end-to-end testing. Do not change sharing automatically.
4. Test order creation, captured verification, failure/cancellation, retries, duplicates, amount mismatch and refunds with the provider sandbox.
5. Check the database and download an acknowledgement only after verified capture.

The code rejects live keys. Enabling real payments is a separate reviewed release, requiring merchant identity, organization authorization, policies, reconciliation operations and verified receipt/tax wording. This build has no recurring-subscription or store-payment integration.

## Email

Configure a verified sending domain before sending email. Verification and reset links are single use with expiry. Pending emails are stored in the outbox, not falsely marked delivered. Staff can retry queued/failed messages after configuration. Delivery status means provider acceptance, not proof that a mailbox received/read it. No background queue scheduler is installed; configure an authorized queue/cron consumer if automated retries are required.

## Operations

- Configure and test Turso backup/export and recovery and Blob object retention. Do not assume a backup exists because storage is managed.
- Add organization-approved error monitoring. The Worker logs server error messages; credentials and password fields are not logged.
- Review permissions using separate editor, applications and finance accounts. Use least privilege.
- Approve a personal-data retention schedule. Expired rate-limit buckets are cleaned during requests; session expiry is enforced on every request. Plan periodic removal of expired sessions/tokens, old drafts and obsolete personal records.
- Link and verify the real domain, configure HTTPS, and verify canonical/OG links on that host.
- Before public launch, replace preview policy notices with reviewed organization policies; confirm event/job/product validity, content rights, impact evidence and contact information.
- Test accessibility with assistive technology and additional browsers/devices; the current browser report covers Chromium desktop, tablet and mobile dimensions.
