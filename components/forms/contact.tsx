"use client";
import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/client";
import { Field, Notice } from "../site/shared";
export function ContactForm({
  subject = "",
  partnership = false,
}: {
  subject?: string;
  partnership?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [reference, setReference] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api(
        "contact",
        "POST",
        Object.fromEntries(new FormData(e.currentTarget)),
      );
      setReference(r.reference);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="form-card">
      <p className="eyebrow">LET’S START A CONVERSATION</p>
      <h2>We’d love to hear from you.</h2>
      <p className="muted">
        Have a question, an idea, or a little time to give?
      </p>
      {error && <Notice error>{error}</Notice>}
      {reference ? (
        <Notice>
          Your message is saved. Reference: <strong>{reference}</strong>. The
          team can now review it in the contact inbox.
        </Notice>
      ) : (
        <form onSubmit={submit}>
          {partnership && (
            <>
              <input type="hidden" name="type" value="partnership" />
              <Field
                label="Organization"
                name="organization"
                required
                maxLength={200}
              />
            </>
          )}
          <div className="form-grid">
            <Field
              label="Your name"
              name="name"
              required
              maxLength={100}
              autoComplete="name"
            />
            <Field
              label="Email address"
              name="email"
              type="email"
              required
              autoComplete="email"
            />
          </div>
          {partnership && (
            <div className="form-grid">
              <Field
                label="Phone number (optional)"
                name="phone"
                type="tel"
                maxLength={30}
              />
              <Field label="Budget range (optional)">
                <select name="budget">
                  <option value="">Prefer to discuss</option>
                  <option>Under ₹1 lakh</option>
                  <option>₹1–5 lakh</option>
                  <option>₹5–25 lakh</option>
                  <option>Over ₹25 lakh</option>
                </select>
              </Field>
              <Field label="Area of interest">
                <select name="focus">
                  <option>Open to discussion</option>
                  <option>Education & skills</option>
                  <option>Women empowerment</option>
                  <option>Health & hygiene</option>
                  <option>Environment & sustainability</option>
                </select>
              </Field>
            </div>
          )}
          <Field
            label="Subject"
            name="subject"
            defaultValue={subject}
            required
            maxLength={150}
          />
          <Field label="Your message">
            <textarea
              name="message"
              rows={5}
              required
              maxLength={5000}
              placeholder="Tell us a little about how we can help…"
            />
          </Field>
          <div className="honeypot" aria-hidden="true">
            <label>
              Website
              <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
          <p className="field-help">
            By sending, you agree that we may use these details to respond. Read
            our <a href="/privacy/">privacy notice</a>.
          </p>
          <button className="button" disabled={busy}>
            {busy ? "Sending…" : "Send message"}
            <ArrowUpRight size={17} />
          </button>
        </form>
      )}
    </div>
  );
}
