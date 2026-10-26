# Well Being Foundation

A full-stack NGO website and staff workspace built from the supplied visual reference and a read-only audit of [wbfngo.org](https://wbfngo.org/). This is an independent implementation, not the original organization's production service. It uses licensed illustrative photography and concise source-based content; it does not fabricate beneficiary figures, staff biographies or tax assurances.

## Run locally

Requires Node 22.15+ (Node 22 LTS) and npm. The application runs on native Next.js, React 19 and TypeScript. Persistent storage uses Turso/libSQL (SQLite-compatible) and a private Vercel Blob store.

```sh
npm ci
cp .env.example .env.local
# Set a random 32+ character SETUP_TOKEN in .env.local.
npm run db:migrate
npm run dev
```

Open http://localhost:5173. The example database URL creates `.data/wbf.db`, an ignored persistent local SQLite database. A remote Turso URL and token can also be used locally. Uploads require a private Blob store and `BLOB_READ_WRITE_TOKEN`; no temporary filesystem upload storage is used.

In another terminal, run `npm run admin:bootstrap` to create the first administrator. This reads `.env.local`, generates a password, and saves it to ignored `local-access.json` with mode 0600. Set `WBF_ADMIN_EMAIL` and `WBF_ADMIN_NAME` to customize the account. Bootstrap is disabled after an administrator exists. Existing Cloudflare development accounts are not copied to a new Turso database.

## Deploy on Vercel

The repository contains `vercel.json` for Next.js, `npm run build`, and `.next` output. Leave the Vercel Root Directory at the repository root and use Node 22.x.

Before using the deployment:

1. Create a Turso database and set `TURSO_DATABASE_URL` (a remote `libsql://` URL) and `TURSO_AUTH_TOKEN` in Vercel.
2. Create and connect a **private** Vercel Blob store to populate `BLOB_READ_WRITE_TOKEN`.
3. Set a random 32+ character `SETUP_TOKEN` and your public HTTPS `WBF_SITE_URL`.
4. Run `npm run db:migrate` locally with the remote Turso credentials in `.env.local` (or your shell). This applies the checked-in schema once. Do not point production at a local file.
5. Deploy/redeploy, then run `WBF_BASE_URL=https://your-domain.example npm run admin:bootstrap` with the same setup token. Remove the production setup token after bootstrap.

The build does not require database credentials, and does not mutate a production database. Runtime pages and APIs need the configured, migrated database; missing credentials do not silently switch to disposable storage. Use separate databases and Blob stores for preview and production. See [deployment.md](docs/deployment.md) for detailed setup and migration notes.

## Main destinations

- `/`: public website
- `/our-work/` and `/focus-areas/[slug]/`: all eight audited focus areas
- `/about/`, `/our-approach/`, `/our-impact/`, `/our-team/`
- `/get-involved/`, `/become-a-volunteer/`, `/internships/`, `/careers/`, `/csr-partnerships/`
- `/blog/`, `/events/`, `/photos/`, `/videos/`, `/resources/` and document sections
- `/profile/`: **public organization profile**, as on the reference
- `/user/`: private member profile, applications, donations and store inquiries
- `/admin/`: authorized staff workspace
- `/store/`, `/product/?slug=…`: source catalog, device-local cart and persisted inquiries

All 48 audited public routes are retained, with additional account recovery, accessibility and alias routes. Original query-based article/job/product URLs remain usable. See [reference-audit.md](docs/reference-audit.md) and [implementation-checklist.md](docs/implementation-checklist.md).

## Capabilities

- Responsive public layouts with editorial typography, licensed local photos, accessible form labels, keyboard focus, reduced motion, search/filtering and pagination.
- Bcrypt (cost 12), hashed opaque sessions, verification/reset tokens, expiry, revocation, same-origin write protection, validation and database-backed rate limits.
- Four-step volunteer/intern/job applications, server validation, duplicate protection, persistent references, private history, review decisions and staff-only notes.
- Contact and CSR inquiry persistence, staff inbox, status management and notifications.
- Content CRUD across programs, pages, articles, events, jobs, people, partners, metrics, reports, documents, gallery, videos and products. Drafts, previews, scheduled visibility, archives, revision history and restore-as-draft; ordered/hidden page sections and editable navigation.
- Server-enforced configurable role permissions, account activation/verification controls, session revocation and append-only application audit access.
- Private Blob media uploads, MIME/signature/size checks, alternative text, captions, public/private visibility, permissioned access and deletion usage checks.
- Real database-derived admin metrics, date/search/status/type filters, pagination and authorized CSV export with formula neutralization.
- Server-created Razorpay **test** orders, client-signature and captured-payment verification, signed idempotent webhooks, failure handling, full-refund reconciliation and acknowledgements only for verified payments.
- Persistent email outbox; Resend delivery and staff retry when configured.

## External dependencies and deliberate limits

This build is **not ready for real fundraising** until the organization has reviewed its content/policies and configured services. See [deployment.md](docs/deployment.md).

- Live payments are explicitly disabled; only `rzp_test_` keys are accepted. Merchant sandbox checkout and real email delivery were not exercised without credentials. Unit/integration tests use synthetic signed payment payloads, not real transactions.
- Recurring subscriptions, UPI manual transfers and tax-deductible receipt wording are not enabled; the reference UI did not establish valid provider configuration or tax treatment.
- The discovered store supports catalog, cart, server-priced inquiry records and staff fulfillment status. It does **not** collect store payments, reserve inventory, compute shipping/tax or promise fulfillment.
- Reference photos, partner logos, portraits and PDFs were not copied without reuse permission. Nine valid public PDFs link directly to the original host. Sixteen broken policy PDF links are omitted. Stock photos are not evidence of WBF activities.
- Reports, partner records and impact metrics remain empty until approved content is provided. An inconsistent source event with an end before its start is excluded. Source jobs/events/products must be confirmed for current availability.
- Email verification is required before applications. Without an email provider, notifications remain queued and a trusted administrator may verify an account after checking ownership.
- Staff dashboard behavior is designed for the requested workflows; protected original admin functionality could not be audited.
- Backups, operational monitoring, retention schedules and organization-specific legal review are deployment responsibilities. No blanket production-security or WCAG conformance certification is claimed.

## Tests

```sh
npm run typecheck
npm run test:api
npm run test:runtime
# With the local server, migrations and bootstrap account ready:
npx playwright install chromium
npm run test:e2e
```

API tests use the real route handlers, crypto and an isolated relational SQLite database through the actual libSQL adapter. Browser tests use the running Next.js application with its configured database and storage. Browser fixtures create clearly named local test records; none are seeded in hosted production. Results and screenshots are written to ignored `outputs/` and `test-results/`. See [test-report.md](docs/test-report.md).

## Project map

- `app/`: server pages, metadata, XML sitemap, errors and API routing
- `components/site/`: public layouts and pages
- `components/forms/`: accounts, applications, contact and donations
- `components/admin/`: staff workspace and content editor
- `lib/server/`: validation, authorization, persistence, seed and payment processing
- `db/schema.ts`, `drizzle/`: application schema and migration history
- `tests/`: API/security and browser tests
- `docs/`: audit, credits, admin and deployment guides, acceptance report

Content types share a structured `content` table rather than separate near-identical tables. Users, sessions, roles, permissions, applications/history, financial records, files, notifications and audit records have separate relational tables with foreign keys and unique constraints. The schema and architecture tradeoffs are documented in [architecture.md](docs/architecture.md).
