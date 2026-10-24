"use client";
import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft, Check, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/client";
import { focusAreas, type Entry } from "@/lib/content";
import { useSite } from "../site/context";
import { Field, Notice, ButtonLink, Loading } from "../site/shared";
const steps = [
  "About you",
  "Interests & skills",
  "Your availability",
  "Review & submit",
];
export function ApplicationForm({
  kind = "volunteer",
  opportunity,
}: {
  kind?: string;
  opportunity?: Entry;
}) {
  const { user, authLoading } = useSite();
  const [step, setStep] = useState(0),
    [form, setForm] = useState<any>({
      name: "",
      email: "",
      phone: "",
      city: "",
      interests: [],
      skills: "",
      experience: "",
      availability: "",
      mode: "In person",
      motivation: "",
      consent: false,
    }),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ref, setRef] = useState("");
  const draftKey =
    "wbf-application-" +
    kind +
    "-" +
    (opportunity?.id || "general") +
    "-" +
    (user?.id || "guest");
  useEffect(() => {
    if (!user) return;
    try {
      const saved = sessionStorage.getItem(draftKey);
      if (saved) setForm(JSON.parse(saved));
      else
        setForm((f: any) => ({
          ...f,
          name: user.name,
          email: user.email,
          phone: user.phone,
        }));
    } catch {}
    setReady(true);
  }, [user?.id, draftKey]);
  useEffect(() => {
    if (ready) sessionStorage.setItem(draftKey, JSON.stringify(form));
  }, [form, ready, draftKey]);
  const set = (key: string, value: any) =>
    setForm((f: any) => ({ ...f, [key]: value }));
  const field = (
    label: string,
    key: string,
    type = "text",
    required = true,
  ) => (
    <Field
      label={label}
      name={key}
      type={type}
      value={form[key]}
      onChange={(e: any) => set(key, e.target.value)}
      required={required}
      maxLength={key === "phone" ? 30 : 200}
      readOnly={key === "email"}
    />
  );
  async function next(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (step === 1 && form.interests.length === 0) {
      setError("Please select at least one area of interest.");
      return;
    }
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setBusy(true);
    try {
      const r = await api("applications", "POST", {
        kind,
        contentId: opportunity?.id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        consent: form.consent,
        data: {
          city: form.city,
          interests: form.interests,
          skills: form.skills,
          experience: form.experience,
          availability: form.availability,
          mode: form.mode,
          motivation: form.motivation,
        },
      });
      setRef(r.reference);
      sessionStorage.removeItem(draftKey);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (authLoading) return <Loading />;
  if (!user)
    return (
      <div className="form-card account-gate">
        <h2>Your journey starts here.</h2>
        <p>Create an account or sign in to save and track your application.</p>
        <ButtonLink
          href={
            "/login/?next=" +
            encodeURIComponent(
              typeof window !== "undefined"
                ? location.pathname
                : "/become-a-volunteer/",
            )
          }
        >
          Sign in to apply
        </ButtonLink>
        <a className="text-link" href="/register/">
          Create an account <ArrowRight size={16} />
        </a>
      </div>
    );
  if (!user.verified)
    return (
      <div className="form-card">
        <h2>Please verify your email.</h2>
        <p>
          Verification protects your application and allows the team to contact
          you.
        </p>
        <ButtonLink href="/user/">Manage your account</ButtonLink>
      </div>
    );
  if (ref)
    return (
      <div className="form-card application-success">
        <CheckCircle2 size={54} />
        <p className="eyebrow">THANK YOU FOR STEPPING FORWARD</p>
        <h2>Your application is with us.</h2>
        <p>Keep this reference for your records.</p>
        <strong className="reference-number">{ref}</strong>
        <p>You can follow every update in your account.</p>
        <ButtonLink href="/user/">Track my application</ButtonLink>
      </div>
    );
  return (
    <div className="application-layout">
      <aside>
        <p className="eyebrow">YOUR NEXT CHAPTER</p>
        <h2>
          Bring what
          <br />
          makes you, <em>you.</em>
        </h2>
        <p>Every skill, perspective, and helping hand can make a difference.</p>
        <img
          src="/images/volunteering.jpg"
          alt="Hands joined together — illustrative photograph"
        />
        <p className="field-help">
          Your draft is saved in this browser tab as you go. Only submit
          information you are comfortable sharing.
        </p>
      </aside>
      <div className="form-card">
        <div className="stepper">
          {steps.map((s, i) => (
            <div
              className={i === step ? "current" : i < step ? "complete" : ""}
              key={s}
            >
              <span>{i < step ? <Check size={16} /> : i + 1}</span>
              <small>{s}</small>
            </div>
          ))}
        </div>
        {opportunity && (
          <p className="opportunity-name">Applying for: {opportunity.title}</p>
        )}
        {error && <Notice error>{error}</Notice>}
        <form onSubmit={next}>
          <h3>{steps[step]}</h3>
          {step === 0 && (
            <>
              <p className="muted">Let’s start with a few details.</p>
              <div className="form-grid">
                {field("Full name", "name")}
                {field("Email address", "email", "email")}
                {field("Phone number", "phone", "tel")}
                {field("City / location", "city")}
              </div>
            </>
          )}
          {step === 1 && (
            <>
              <p className="muted">What would you love to contribute to?</p>
              <div className="interest-grid">
                {focusAreas.map((f) => (
                  <label
                    className={
                      "interest-option " +
                      (form.interests.includes(f[1]) ? "selected" : "")
                    }
                    key={f[0]}
                  >
                    <input
                      type="checkbox"
                      checked={form.interests.includes(f[1])}
                      onChange={(e) =>
                        set(
                          "interests",
                          e.target.checked
                            ? [...form.interests, f[1]]
                            : form.interests.filter((x: string) => x !== f[1]),
                        )
                      }
                    />
                    {f[1]}
                  </label>
                ))}
              </div>
              <Field label="Skills you’d like to share">
                <textarea
                  rows={3}
                  value={form.skills}
                  onChange={(e) => set("skills", e.target.value)}
                  maxLength={2000}
                  placeholder="Teaching, design, writing, organizing…"
                />
              </Field>
              <Field label="Relevant experience (optional)">
                <textarea
                  rows={3}
                  value={form.experience}
                  onChange={(e) => set("experience", e.target.value)}
                  maxLength={3000}
                />
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <p className="muted">Tell us how you’d like to take part.</p>
              <Field label="Time you can offer" required>
                <select
                  value={form.availability}
                  onChange={(e) => set("availability", e.target.value)}
                  required
                >
                  <option value="">Choose your availability</option>
                  <option>1–5 hours/week</option>
                  <option>5–10 hours/week</option>
                  <option>10–20 hours/week</option>
                  <option>20+ hours/week</option>
                  <option>Flexible</option>
                </select>
              </Field>
              <Field label="Participation preference">
                <select
                  value={form.mode}
                  onChange={(e) => set("mode", e.target.value)}
                >
                  <option>In person</option>
                  <option>Remote</option>
                  <option>Flexible</option>
                </select>
              </Field>
              <Field label="What brings you to WBF?">
                <textarea
                  rows={5}
                  value={form.motivation}
                  onChange={(e) => set("motivation", e.target.value)}
                  maxLength={3000}
                />
              </Field>
            </>
          )}
          {step === 3 && (
            <>
              <p className="muted">
                Take a moment to make sure everything looks right.
              </p>
              <dl className="review-details">
                {[
                  ["Name", form.name],
                  ["Email", form.email],
                  ["Phone", form.phone],
                  ["Location", form.city],
                  ["Interests", form.interests.join(", ")],
                  ["Skills", form.skills || "Not specified"],
                  ["Availability", form.availability],
                  ["Preference", form.mode],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <label className="check-label">
                <input
                  type="checkbox"
                  required
                  checked={form.consent}
                  onChange={(e) => set("consent", e.target.checked)}
                />
                <span>
                  I confirm these details are accurate and consent to WBF
                  reviewing my application under the{" "}
                  <a href="/privacy/">privacy notice</a>.
                </span>
              </label>
            </>
          )}
          <div className="form-actions">
            <button
              className="button secondary"
              type="button"
              disabled={step === 0 || busy}
              onClick={() => {
                setError("");
                setStep(step - 1);
              }}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button className="button" disabled={busy}>
              {busy
                ? "Submitting…"
                : step === 3
                  ? "Submit application"
                  : "Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
