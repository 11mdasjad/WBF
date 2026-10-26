# Verification report

Date: 25 October 2026 (Asia/Kolkata). Tests were run against the implemented application, not the original WBF service. No real payment or message to existing foundation contacts was submitted.

## Passed checks

- TypeScript strict type check (`npm run typecheck`).
- Production Vinext/Worker build, including server, client and SSR bundles.
- Drizzle schema generation and all 43 initial SQL statements applied successfully to local D1.
- **28 API/database/security tests** using actual route handlers, real password hashing, Web Crypto and isolated SQLite through a D1-compatible adapter.
- **Nine browser acceptance tests** passed (eight in the full run, plus the corrected structured-editor test).
- Chromium route checks across all **48 audited public routes**, plus a real 404 response.
- Responsive overflow checks at **390, 768 and 1440 pixels** for home, work, contact, donation and store.
- Browser workflows covering navigation, contact submission/staff resolution, four-step applications/staff approval/member history, CMS draft preview/publication, search, event filtering, store cart, disabled checkout, structured page sections and desktop/mobile screenshots.

The source API test file is `tests/api.test.mjs`; browser tests are in `tests/browser/site.spec.ts`. Run results are written to `outputs/api-test-results.txt` and `outputs/browser-results.json`; screenshots are `outputs/home-desktop.png`, `outputs/home-mobile.png`, `outputs/admin-desktop.png` and `outputs/admin-mobile.png`. Runtime/test artifacts and generated credentials are ignored by version control.

## API/security coverage

| Area               | Evidence                                                                                                                                                                                                             |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Seed/persistence   | Eight correct focus areas, idempotent seed, no invented metric records                                                                                                                                               |
| Bootstrap          | Secret required; bootstrap unavailable once an administrator exists                                                                                                                                                  |
| Accounts           | Password hashing; weak/invalid/duplicate registration rejection; no self-assigned admin role                                                                                                                         |
| Sessions           | Secure/HttpOnly cookies, expiry, logout, password-reset and access-change revocation                                                                                                                                 |
| Verification/reset | Single-use tokens, expiry enforcement and queued notification state                                                                                                                                                  |
| Authorization      | Anonymous staff access denied, editor/finance separation, member ownership checks                                                                                                                                    |
| Forms              | Required data, consent, phone, verified-email and opportunity-type validation                                                                                                                                        |
| Applications       | Persistence, deduplication, status decisions, user history and private internal notes                                                                                                                                |
| Content            | Private drafts, public publication, archives, revisions, source requirements, safe URLs                                                                                                                              |
| Page builder       | Section order, exclusion of hidden content from public responses, safe destinations                                                                                                                                  |
| Settings           | Authorized menu editing and rejection of unsafe links                                                                                                                                                                |
| Injection/exports  | Bound SQL searches and CSV formula neutralization                                                                                                                                                                    |
| Media              | Format/signature checks and private-file authorization                                                                                                                                                               |
| Store              | Server-calculated prices, quantity bounds and honest inquiry state                                                                                                                                                   |
| Payments           | Disabled checkout without credentials; server-created orders; captured-state verification, valid/invalid HMAC, amount mismatch, duplicate callbacks, late failure ordering, receipt ownership and refund restriction |
| Abuse controls     | Database-backed login rate limiting and same-origin write checks                                                                                                                                                     |

Payment order/verification tests stub the external Razorpay HTTP responses. Webhook tests use locally constructed signed test payloads. This proves application state transitions and guards, **not successful merchant onboarding or real provider delivery**.

## Issues found and corrected

- A seed timestamp fell after the execution host's UTC clock despite the client already being on the next calendar day. It hid source content until the timestamp was corrected.
- The installed icon library omitted brand icons; imports were replaced with supported interface icons.
- Initial test selectors included required-marker text and ambiguous password/administration labels. Field rendering now uses explicit label/control associations; tests scope dialogs and wait for hydration.
- The sidebar overflowed short viewports; it now scrolls within its fixed area.
- Hidden structured sections are removed server-side from public responses.
- Application email now has to match the verified member account, and opportunity types/deadlines are checked server-side.

## Not verified / external dependencies

- Actual Razorpay sandbox or live payment transactions, provider webhook delivery through private hosting, recurring billing, store payment/shipping/inventory.
- Real Resend delivery without a verified sender/key. The outbox queues accurately and exposes no fake delivery success.
- Original private admin behavior, original account approval, historical claimed outcomes or current tax eligibility.
- Organization authorization for reference photos/portraits/documents. Only licensed stock is mirrored; valid documents remain source links.
- Full WCAG conformance, assistive technology, Safari/Firefox, operational recovery, load testing or penetration testing.

The project is a tested full-stack implementation with documented product/service dependencies. It is not a certification of readiness to collect real donations or personal data at production scale.
