# WBF implementation plan and acceptance checklist

Prepared 25 October 2026 before application implementation. Audit: reference-audit.md. The visual reference guides styling; verified live routes guide information architecture.

## Route inventory

Public: /, /about/, /our-work/, /focus-areas/, /focus-areas/[slug]/ (8), /our-approach/, /our-impact/, /our-team/, /donate/, /donate-now/, /get-involved/, /become-a-volunteer/, /volunteering-internships/, /careers/, /internships/, /csr-partnerships/, /register/, /login/, /forgot-password/, /reset-password/, /verify-email/, /profile/ (organization), /user/ (account), /contact/, /blog/, /blog/[slug]/, /events/, /events/[slug]/, /photos/, /videos/, /gallery/, /resources/, /reports/, /financials/, /license/, /tax-exemptions/, /policies/, /privacy/, /terms/, /refund/, /cookies/, /faq-2/, /accessibility/, /store/, /sitemap.xml, /robots.txt, 404.
Admin: /admin/, /admin/content/, /admin/applications/, /admin/donations/, /admin/users/, /admin/media/, /admin/inbox/, /admin/settings/, /admin/audit/.

## Architecture

React 19 / TypeScript with Next-compatible Vinext routes; Sites Cloudflare Worker hosting; Drizzle migrations with D1 relational SQLite; R2 objects; bcrypt password hashes and opaque cookie sessions; server-enforced roles. This portable managed architecture uses D1 instead of suggested PostgreSQL, preserving a relational schema and parameterized SQL. The explicit user requirement for email/password accounts takes precedence over Sites' usual platform-only identity; private hosting also retains the platform access gate. Payment integration: Razorpay server orders and HMAC-verified captured payment webhooks, test keys only. Email: configurable Resend and persisted outbox. No real transactions or messages to existing WBF contacts during development.

## Work stages

- [x] Inspect empty workspace and establish route inventory.
- [x] Design system and responsive shared navigation/footer.
- [x] Full public routes and detail views, accurate content, licensed imagery.
- [x] Database schema, generated migrations, content seed.
- [x] Registration, verification, login/reset, profile, authorization.
- [x] Four-step applications, duplicate protection, tracking/review.
- [x] Razorpay test integration, server verification, idempotent webhooks and verified acknowledgements; provider sandbox exercise still requires credentials.
- [x] Admin overview, content CRUD/preview/publication, operational management.
- [x] Media validation/storage, audit, settings, notification outbox.
- [x] Store catalog, cart and inquiry persistence; store payment/shipping/inventory are not implemented.
- [x] API/security integration tests and Chromium desktop/tablet/mobile browser verification.
- [x] Setup, deployment and admin guides, test report, generated local admin access and explicit limitations.

## Content constraints

No fabricated figures, testimonials, personnel, reports or legal assurances. Reference self-reported claims are distinguished from independently verified facts. Use original summaries instead of wholesale copied prose. Stock photographs are illustrative; they do not identify WBF beneficiaries. Policies need actual organization approval. Missing external credentials must remain visible dependencies, never fake success.

## Deployment and product dependencies

- [ ] Organization-approved live merchant configuration and provider sandbox validation. Live keys are intentionally rejected.
- [ ] Verified email sender and external delivery test; queued notifications are persisted meanwhile.
- [ ] Recurring donation subscriptions; manual UPI reconciliation is not offered.
- [ ] Store payment collection, stock reservation and shipping/tax rules. Store inquiries are fully persisted and accurately labelled.
- [ ] Authorized program photography, staff portraits, current reports, evidence-backed metrics and partner records.
- [ ] Reviewed legal policies, approved personal-data retention schedule, automated backup/recovery and operational monitoring.
- [ ] Broader browser/assistive-technology audit beyond the tested Chromium layouts.

## Current CMS scope

Draft/preview/publish/archive/restore, scheduled visibility, editable publication order, content pagination, safe structured page sections with visibility/order, homepage and organization settings, main navigation editing, footer copy, media metadata, and all requested content categories are implemented. A custom Page entry can replace a built-in information page by slug. The core application routes and footer resource groups remain code-defined.

## Private-reference limits

The original protected dashboard and account review were not accessible without authorized credentials. The implementation provides the requested sensible workflows; it does not claim to reproduce hidden original behavior. The database schema intentionally consolidates CMS entities while normalizing financial, identity and application records.
