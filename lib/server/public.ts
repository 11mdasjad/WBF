import {
  database,
  all,
  first,
  publicEntry,
  organizationSettings,
} from "./core";
import { now } from "./security";
import { paymentReady } from "./payments";
import { config } from "./core";
export async function publicData() {
  const db = await database();
  const organization = await organizationSettings(db);
  return {
    organization,
    content: (
      await all(
        db,
        "SELECT * FROM content WHERE status='published' AND (published_at IS NULL OR published_at<=?) ORDER BY sort,created_at DESC",
        now(),
      )
    ).map(publicEntry),
    paymentsEnabled: !!paymentReady(),
    emailEnabled: !!(config.RESEND_API_KEY && config.EMAIL_FROM),
  };
}
