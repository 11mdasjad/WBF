# Well Being Foundation

A full-stack NGO website and staff workspace built from the supplied visual reference and a read-only audit of [wbfngo.org](https://wbfngo.org/). This is an independent implementation, not the original organization's production service. It uses licensed illustrative photography and concise source-based content; it does not fabricate beneficiary figures, staff biographies or tax assurances.

## Run locally

Requires Node 22.15+ and npm. The application uses React 19, TypeScript, Next-compatible Vinext, Cloudflare Workers, Drizzle/D1 and R2. D1 is relational SQLite; this implementation does **not** use PostgreSQL/Prisma.

```sh
npm ci
cp .env.example .dev.vars
# Set a cryptographically random 32+ character SETUP_TOKEN in .dev.vars.
npm run build
npm run db:migrate
npm run dev -- --hostname 127.0.0.1
```

Open the printed local URL (normally http://127.0.0.1:5173). In another terminal, create the first administrator:

```sh
npm run admin:bootstrap
```

This uses the setup token, creates a generated password and writes it to **local-access.json**, ignored by Git and restricted to mode 0600. The script defaults to `admin@wbf.test`; set `WBF_ADMIN_EMAIL`, `WBF_ADMIN_NAME` and `WBF_BASE_URL` in the environment to customize it. Bootstrap is disabled after an administrator exists. No default password is committed. The current workspace already has a local administrator; see its local-access.json.

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
- R2 media uploads, MIME/signature/size checks, alternative text, captions, public/private visibility, permissioned access and deletion usage checks.
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
# With the local server, migrations and bootstrap account ready:
npx playwright install chromium
npm run test:e2e
```

API tests use the real route handlers, crypto and an isolated relational SQLite database via a D1-compatible test adapter. Browser tests use the actual local D1/R2 application. Browser fixtures create clearly named local test records; none are seeded in hosted production. Results and screenshots are written to ignored `outputs/` and `test-results/`. See [test-report.md](docs/test-report.md).

## Project map

- `app/`: server pages, metadata, XML sitemap, errors and API routing
- `components/site/`: public layouts and pages
- `components/forms/`: accounts, applications, contact and donations
- `components/admin/`: staff workspace and content editor
- `lib/server/`: validation, authorization, persistence, seed and payment processing
- `db/schema.ts`, `drizzle/`: 24-table schema and migration history
- `tests/`: API/security and browser tests
- `docs/`: audit, credits, admin and deployment guides, acceptance report

Content types share a structured `content` table rather than separate near-identical tables. Users, sessions, roles, permissions, applications/history, financial records, files, notifications and audit records have separate relational tables with foreign keys and unique constraints. The schema and architecture tradeoffs are documented in [architecture.md](docs/architecture.md).
