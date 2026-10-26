import { config, first, run, audit } from "./core";
import { assert, hmac, equal, uid, now } from "./security";
export function paymentReady() {
  return (
    config.RAZORPAY_TEST_ENABLED === "true" &&
    config.RAZORPAY_KEY_ID?.startsWith("rzp_test_") &&
    !!config.RAZORPAY_KEY_SECRET &&
    !!config.RAZORPAY_WEBHOOK_SECRET
  );
}
export async function razor(path: string, method = "GET", data?: unknown) {
  assert(
    paymentReady(),
    "Test checkout is awaiting merchant configuration. No payment has been taken.",
    503,
  );
  const r = await fetch("https://api.razorpay.com/v1/" + path, {
    method,
    headers: {
      Authorization:
        "Basic " +
        btoa(config.RAZORPAY_KEY_ID + ":" + config.RAZORPAY_KEY_SECRET),
      "Content-Type": "application/json",
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  assert(
    r.ok,
    "The payment provider could not process this request. Please try again.",
    502,
  );
  return r.json() as Promise<any>;
}
export async function settle(db: D1Database, p: any) {
  const order = await first(
    db,
    "SELECT * FROM payment_orders WHERE provider_id=?",
    p.order_id,
  );
  assert(order, "Unknown payment order.");
  assert(
    p.currency === order.currency &&
      p.amount === order.amount &&
      p.status === "captured",
    "Payment is not captured or its amount does not match.",
  );
  const date = now();
  await db.batch([
    db
      .prepare(
        "INSERT OR IGNORE INTO payment_transactions(id,order_id,provider_id,amount,status,created_at) VALUES(?,?,?,?,'captured',?)",
      )
      .bind(uid(), order.id, p.id, p.amount, date),
    db
      .prepare("UPDATE payment_orders SET status='paid' WHERE id=?")
      .bind(order.id),
    db
      .prepare(
        "UPDATE donations SET status='paid' WHERE id=? AND status!='refunded'",
      )
      .bind(order.donation_id),
    db
      .prepare(
        "INSERT OR IGNORE INTO receipts(id,donation_id,number,created_at) VALUES(?,?,?,?)",
      )
      .bind(
        uid(),
        order.donation_id,
        "WBF-" + order.donation_id.slice(0, 8).toUpperCase(),
        date,
      ),
  ]);
  return order.donation_id;
}
export async function webhook(db: D1Database, req: Request) {
  assert(paymentReady(), "Payments are disabled.", 503);
  const raw = await req.text();
  assert(raw.length < 100000, "Payload too large.", 413);
  assert(
    equal(
      await hmac(config.RAZORPAY_WEBHOOK_SECRET, raw),
      req.headers.get("x-razorpay-signature") || "",
    ),
    "Invalid webhook signature.",
    401,
  );
  const event = JSON.parse(raw);
  const eventId = req.headers.get("x-razorpay-event-id");
  assert(eventId && eventId.length < 200, "Missing event identifier.");
  if (await first(db, "SELECT id FROM webhook_events WHERE id=?", eventId))
    return { received: true, duplicate: true };
  const p = event.payload?.payment?.entity;
  if (event.event === "payment.captured") await settle(db, p);
  else if (event.event === "payment.failed" && p) {
    await run(
      db,
      "UPDATE donations SET status='failed' WHERE status!='paid' AND id IN(SELECT donation_id FROM payment_orders WHERE provider_id=?)",
      p.order_id,
    );
  } else if (event.event === "refund.processed") {
    const refund = event.payload?.refund?.entity;
    if (refund?.payment_id) {
      const tx = await first(
        db,
        "SELECT * FROM payment_transactions WHERE provider_id=?",
        refund.payment_id,
      );
      if (tx) {
        const verified = await razor(
          "payments/" + encodeURIComponent(refund.payment_id),
        );
        if (verified.amount_refunded >= tx.amount) {
          await db.batch([
            db
              .prepare(
                "UPDATE donations SET status='refunded' WHERE id=(SELECT donation_id FROM payment_orders WHERE id=?)",
              )
              .bind(tx.order_id),
            db
              .prepare(
                "UPDATE payment_transactions SET status='refunded' WHERE id=?",
              )
              .bind(tx.id),
          ]);
        }
      }
    }
  }
  await run(
    db,
    "INSERT OR IGNORE INTO webhook_events(id,type,created_at) VALUES(?,?,?)",
    eventId,
    event.event,
    now(),
  );
  await audit(db, null, "payment.webhook", eventId, event.event);
  return { received: true };
}
