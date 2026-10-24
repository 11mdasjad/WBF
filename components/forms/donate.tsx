"use client";
import { useState } from "react";
import {
  Heart,
  ShieldCheck,
  LockKeyhole,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";
import { useSite } from "../site/context";
import { Field, Notice, ButtonLink } from "../site/shared";
import { api } from "@/lib/client";
import { money } from "@/lib/content";
declare global {
  interface Window {
    Razorpay: any;
  }
}
export function DonateForm() {
  const { user, paymentsEnabled } = useSite();
  const [amount, setAmount] = useState(1000),
    [custom, setCustom] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(false);
  const [key, setKey] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (!user) {
      location.assign("/login/?next=/donate/");
      return;
    }
    setBusy(true);
    try {
      const data = Object.fromEntries(new FormData(e.currentTarget));
      let token = key;
      if (!token) {
        token = crypto.randomUUID();
        setKey(token);
      }
      const r = await api("donations/order", "POST", {
        ...data,
        amount: Math.round(amount * 100),
        anonymous: data.anonymous === "on",
        idempotencyKey: token,
      });
      if (!window.Razorpay)
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Checkout could not load. Please try again."));
          document.body.appendChild(script);
        });
      const checkout = new window.Razorpay({
        key: r.key,
        order_id: r.order.provider_id,
        amount: r.order.amount,
        currency: "INR",
        name: "Well Being Foundation",
        description: "Test donation",
        prefill: { name: data.name, email: data.email },
        theme: { color: "#ad512f" },
        handler: async (response: any) => {
          try {
            await api("donations/verify", "POST", response);
            setSuccess(true);
            setKey("");
          } catch (e: any) {
            setError(e.message);
          } finally {
            setBusy(false);
          }
        },
        modal: {
          ondismiss: () => {
            setBusy(false);
            setError(
              "Checkout was closed. Payment is still unconfirmed; check your donation history before retrying.",
            );
          },
        },
      });
      checkout.on("payment.failed", () => {
        setBusy(false);
        setError(
          "The payment provider reported a failed payment. Please check your history before retrying.",
        );
        setKey("");
      });
      checkout.open();
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  }
  return (
    <section className="section container donation-layout">
      <div className="donation-copy">
        <p className="eyebrow">A LITTLE GENEROSITY. A LASTING POSSIBILITY.</p>
        <h1>
          Help a brighter
          <br />
          tomorrow <em>take root.</em>
        </h1>
        <p>
          Your generosity can support learning, well-being, and opportunities
          for communities to thrive.
        </p>
        <div className="donation-photo">
          <img
            src="/images/hero.jpg"
            alt="Schoolchildren smiling — illustrative photograph"
          />
          <span>Every act of care matters.</span>
        </div>
        <div className="donation-trust">
          <span>
            <ShieldCheck size={20} /> Secure checkout
          </span>
          <span>
            <LockKeyhole size={20} /> Private details
          </span>
          <span>
            <Heart size={20} /> People first
          </span>
        </div>
      </div>
      <div className="form-card donation-card">
        <p className="eyebrow">SUPPORT OUR MISSION</p>
        <h2>Make a contribution.</h2>
        <p className="muted">Choose a one-time donation amount.</p>
        {!paymentsEnabled && (
          <Notice>
            Checkout is awaiting test merchant configuration. No live donations
            are being accepted on this preview.
          </Notice>
        )}
        {error && <Notice error>{error}</Notice>}
        {success ? (
          <div className="application-success">
            <CheckCircle2 size={48} />
            <h3>Your test payment is verified.</h3>
            <p>Find the payment acknowledgement in your account.</p>
            <ButtonLink href="/user/">View donation history</ButtonLink>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div className="amount-grid">
              {[500, 1000, 2500, 5000, 10000].map((n) => (
                <button
                  type="button"
                  className={!custom && amount === n ? "selected" : ""}
                  key={n}
                  onClick={() => {
                    setCustom(false);
                    setAmount(n);
                  }}
                >
                  {money(n * 100)}
                </button>
              ))}
              <button
                type="button"
                className={custom ? "selected" : ""}
                onClick={() => setCustom(true)}
              >
                Other amount
              </button>
            </div>
            {custom && (
              <Field
                label="Custom amount (₹)"
                type="number"
                min={100}
                max={1000000}
                value={amount}
                onChange={(e: any) => setAmount(Number(e.target.value))}
                required
              />
            )}
            <Field label="Direct my support to">
              <select name="purpose">
                <option>Where it is needed most</option>
                <option>Education & skills</option>
                <option>Women empowerment</option>
                <option>Health & hygiene</option>
                <option>Environment & sustainability</option>
              </select>
            </Field>
            <div className="form-divider" />
            <h3>Your details</h3>
            <Field
              label="Full name"
              name="name"
              required
              defaultValue={user?.name}
              autoComplete="name"
            />
            <Field
              label="Email address"
              name="email"
              type="email"
              required
              defaultValue={user?.email}
              autoComplete="email"
            />
            <label className="check-label">
              <input type="checkbox" name="anonymous" />
              <span>Keep my name private in public acknowledgements.</span>
            </label>
            <button className="button full" disabled={busy || !paymentsEnabled}>
              {busy
                ? "Opening secure checkout…"
                : paymentsEnabled
                  ? "Continue with " + money(amount * 100)
                  : "Test checkout not configured"}
              <ArrowUpRight size={18} />
            </button>
            <p className="field-help">
              Payments are recorded only after server verification. No tax
              benefit is claimed. Read the{" "}
              <a href="/donation-policy/">donation information</a>.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
