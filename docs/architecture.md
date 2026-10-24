# Architecture and security decisions

## Runtime

The application runs as a Next-compatible Vinext Worker using React server rendering for public content and client components for interaction. Server pages query D1; public CMS content is not a browser-local mock. `GET /api/public` exposes only published content whose publication timestamp has arrived. The initial content seed is idempotent and separate from schema migrations.

D1 was chosen for the supplied managed Worker deployment. Drizzle generates a reproducible schema. PostgreSQL and Prisma were suggestions in the brief, not an established repository constraint. There was no existing code to preserve.

## Relational model

24 tables separate users, hashed sessions, tokens, roles, permissions, memberships, role grants, organization settings, content, content revisions, applications, application history, contacts, donations, payment orders, payment transactions, receipts, webhook identifiers, notifications, media, audit logs, rate limits, store orders and line items. Several counts above are logical groups; `db/schema.ts` is authoritative. The physical 24-table inventory is in the generated migration.

Programs, categories, pages, posts, team, partners, jobs, events, galleries, reports, metrics and products share `content`: a discriminated kind with safe typed common fields and JSON for kind-specific details. This is an intentional CMS design, not a claim that each conceptual entity has its own normalized table. CMS revisions retain old snapshots; published lists sort by display order. Financial entities are separated and constrained by unique provider IDs; application deduplication uses a unique member/type/opportunity key.

## Authentication and authorization

Passwords use bcrypt cost 12 (12–72 UTF-8 bytes). Session cookies are HttpOnly, SameSite=Lax and Secure under HTTPS. Only a SHA-256 digest of each random session token is stored. Sessions expire after seven days. Password changes/reset and role changes revoke sessions. Email verification expires in 24 hours; reset tokens expire in one hour.

All mutations except signed provider webhooks and secret-protected bootstrap require the request Origin to match the site origin. Each sensitive handler checks session ownership or a named permission. Public registration always assigns the member role. No frontend-only role checks protect data. Login, registration and public writes use database-backed rate limits. Production rate limiting trusts Cloudflare's connecting IP header; do not run behind an untrusted proxy that lets callers forge it.

Application notes, donor details, addresses, private media, staff settings and exports are not present in public content. Member history omits internal notes. SQL values are bound parameters. CSV cells beginning with formula markers are neutralized. Plain text rendering prevents stored HTML execution. Media allowlists format signatures and size; no SVG/executable upload is accepted, and served files use nosniff and sandbox headers.

## Payment integrity

Razorpay order creation happens on the server. Amounts are integer paise, bounded and tied to the authenticated donor. The signature over order ID/payment ID is checked, then the server fetches captured provider state and checks amount/currency. Webhooks use raw-body HMAC verification. Unique webhook IDs, transaction IDs and donation receipt constraints make repeated capture events idempotent. Late failures cannot downgrade paid records. Fully refunded payments do not expose a paid acknowledgement.

Sandbox key prefixes and explicit configuration keep live payments off. There is no client-only success state and no manual “mark paid” endpoint. Tests verify these transitions without contacting a payment provider.

## Boundaries

Private Sites hosting retains its platform gate. The explicit brief requires separate email/password member accounts; this intentionally supplements the usual Sites identity flow. External provider webhooks require public/supported ingress, which has not been configured for the owner-private deployment. No OAuth, MFA or original protected admin replication is claimed.

Operational backup/recovery, malware scanning beyond type/signature checks, automated outbox processing, long-term retention enforcement, store checkout/inventory, recurring donations and organization-approved legal policies remain documented deployment/product follow-up items. They are not represented as completed services.
