# Deployment and service configuration

## Hosting

The Sites project is declared in `.openai/hosting.json`. It uses the `DB` D1 binding and `BUCKET` R2 binding. Private hosting keeps the platform's ChatGPT access gate in addition to the application's own accounts. Application roles still govern every protected API call.

Build with `npm run build`. The generated Worker is under `dist/server`, with static assets under the build outputs. Sites packaging must include the manifest, matching build and generated Drizzle migrations. Publish the exact pushed commit. Sites provisions D1/R2 and applies schema migrations before deployment. Local `.wrangler/state`, `.dev.vars`, generated admin credentials and test artifacts must never be uploaded.

Standalone compatible Cloudflare hosting can use the generated Worker configuration, real D1/R2 IDs, HTTPS, managed secrets and the same migrations. Do not deploy this Worker to a static-only host. PostgreSQL migration would require replacing the persistence adapter and migrations.

## Environment variables

| Name                         | Purpose                                                                            |
| ---------------------------- | ---------------------------------------------------------------------------------- |
| `SETUP_TOKEN`                | Random 32+ character secret for one-time admin bootstrap. Remove after bootstrap.  |
| `RAZORPAY_TEST_ENABLED`      | Exactly `true` to allow sandbox checkout.                                          |
| `RAZORPAY_KEY_ID`            | Razorpay test public key; must start `rzp_test_`.                                  |
| `RAZORPAY_KEY_SECRET`        | Razorpay test secret; server-only.                                                 |
| `RAZORPAY_WEBHOOK_SECRET`    | HMAC secret for `/api/payments/webhook`.                                           |
| `RESEND_API_KEY`             | Outbound email provider credential.                                                |
| `EMAIL_FROM`                 | Verified sending identity owned by the actual operator.                            |
| `CONTACT_NOTIFICATION_EMAIL` | Optional authorized inbox destination. No WBF address is automatically subscribed. |

Use `.dev.vars` locally and managed runtime secrets in hosting. Never put secrets in the hosting manifest or frontend bundle.

## First administrator

Use `scripts/bootstrap-admin.mjs` against the selected site with its setup token. For private hosting, the operator can run the request from an authenticated browser or an authorized existing service-access token. The endpoint requires the secret and refuses any subsequent bootstrap once an admin exists. Generated credentials belong in a local password manager or ignored local-access.json; change the password in My Account after handoff.

Do not create an admin through public registration fields. Administrators can promote an already-registered, verified member in People & Access. Role changes revoke old sessions immediately.

## Razorpay sandbox

1. Provide merchant-owned sandbox credentials and a webhook signing secret.
2. Configure a webhook to the site's `/api/payments/webhook` URL for `payment.captured`, `payment.failed` and `refund.processed`.
3. The route must be reachable by Razorpay. A private Sites access gate blocks unauthenticated provider callbacks; use an organization-approved public deployment or supported ingress before provider end-to-end testing. Do not change sharing automatically.
4. Test order creation, captured verification, failure/cancellation, retries, duplicates, amount mismatch and refunds with the provider sandbox.
5. Check the database and download an acknowledgement only after verified capture.

The code rejects live keys. Enabling real payments is a separate reviewed release, requiring merchant identity, organization authorization, policies, reconciliation operations and verified receipt/tax wording. This build has no recurring-subscription or store-payment integration.

## Email

Configure a verified sending domain before sending email. Verification and reset links are single use with expiry. Pending emails are stored in the outbox, not falsely marked delivered. Staff can retry queued/failed messages after configuration. Delivery status means provider acceptance, not proof that a mailbox received/read it. No background queue scheduler is installed; configure an authorized queue/cron consumer if automated retries are required.

## Operations

- Configure and test D1 backup/export and recovery and R2 object retention. Do not assume a backup exists because storage is managed.
- Add organization-approved error monitoring. The Worker logs server error messages; credentials and password fields are not logged.
- Review permissions using separate editor, applications and finance accounts. Use least privilege.
- Approve a personal-data retention schedule. Expired rate-limit buckets are cleaned during requests; session expiry is enforced on every request. Plan periodic removal of expired sessions/tokens, old drafts and obsolete personal records.
- Link and verify the real domain, configure HTTPS, and verify canonical/OG links on that host.
- Before public launch, replace preview policy notices with reviewed organization policies; confirm event/job/product validity, content rights, impact evidence and contact information.
- Test accessibility with assistive technology and additional browsers/devices; the current browser report covers Chromium desktop, tablet and mobile dimensions.
