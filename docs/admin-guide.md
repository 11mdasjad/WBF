# Staff guide

Sign in at `/login/`, then open `/admin/`. Your assigned permissions determine the sections you can access. The dashboard displays only database records and excludes unverified payments from totals.

## Content studio

Choose a content type or search by title. Create a draft, enter its title and a unique lowercase hyphenated slug, then add introduction, body, image path and a source link. Text is safely rendered as text, not arbitrary HTML.

Use Preview before publication. Set Published to make it public; a future publication timestamp schedules visibility without a background job. Archived content leaves public listings. Editing creates a revision. Open Revision history to load a previous version as a draft, review it, and save.

Programs, posts, events and careers have detail routes. Team, partners, metrics, reports, documents, gallery, videos and products populate their respective listings. Page entries override built-in content at the matching page slug. The public organization profile stays `/profile/`; members use `/user/`.

Events require valid start/end dates. Enter Indian local times in date/time fields. Metrics require a traceable source and reporting period. Do not publish guessed figures, unlicensed photos or unsupported eligibility claims. For documents, supply an approved file URL from Media Library or a valid HTTPS source link.

Homepage title, description, image, mission, vision, organization introduction, contact details and social destinations are editable in Settings. Main navigation labels, destinations, visibility and order, plus footer copy, are also editable. Page entries support ordered text, image and call-to-action sections; hide unfinished sections before publishing. Hidden sections are excluded from public responses. The core application route structure and footer resource groups remain application code.

## Applications

Filter by application type, status, date or applicant. View the applicant's interests, experience and availability. Update status and, optionally, write a message visible to the applicant. Internal notes stay staff-only. Each decision is recorded in status history and the audit log; notification email is queued. Applications are unique per member/opportunity.

## Donations

Search/filter donations and open a record to see its provider orders, transactions and verified acknowledgement. A pending or failed record is not revenue. Staff cannot manually mark a donation paid. CSV exports are permission checked and protected against spreadsheet formula injection. Refunds are recognized only through verified provider state.

## People & access

Administrators can activate/deactivate users, verify email after checking ownership and assign a role. Changes invalidate existing sessions. The current administrator cannot revoke their own access. Use the permission editor with care: granting user/settings permissions can delegate privileged administration.

## Media

Upload JPEG, PNG, WebP or PDF files up to 8 MB. Include meaningful alternative text and captions. Public assets can appear on the website; private assets require media permission. Copy the file URL into a content entry. Edit descriptions and delete unused assets. Delete is rejected while content/settings still reference the file. Replacing a file currently uses a new upload followed by updating its references; it is not an in-place overwrite.

## Inbox, store and notifications

Contact and partnership messages are stored in Contact Inbox; mark them read or resolved and add private notes. Store inquiries contain server-priced line items and a delivery address. Review availability and shipping separately; no payment or stock reservation is implied. Set inquiry status to contacted, cancelled or fulfilled only when appropriate.

Email Outbox shows queued, sent or failed delivery attempts. Retry after the provider is configured. It does not expose email verification/reset link bodies in the staff listing.

## Audit and records

Audit Trail records authentication, publication, reviews, access changes, exports and file actions. It has no edit/delete interface. Authorized users can export records, up to 10,000 rows per export. Handle exported personal data under the organization's approved retention and access policy.
