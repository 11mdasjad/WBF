"use client";
import { useState, useEffect } from "react";
import { ArrowUpRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { api } from "@/lib/client";
import { Brand, Field, Notice } from "../site/shared";
import { useSite } from "../site/context";
export function AuthForm({ mode }: { mode: string }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [show, setShow] = useState(false);
  const { refreshUser } = useSite();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const register = mode === "register",
    forgot = mode === "forgot-password",
    reset = mode === "reset-password",
    verify = mode === "verify-email";
  const title = register
    ? "A little care can change a lot."
    : forgot
      ? "Let’s get you back in."
      : reset
        ? "A fresh start."
        : verify
          ? "One last step."
          : "Welcome back.";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const data = Object.fromEntries(new FormData(e.currentTarget)) as any;
    try {
      if ((register || reset) && data.password !== data.confirm)
        throw new Error("Your passwords do not match.");
      let result;
      if (verify || reset) {
        const token = new URLSearchParams(location.search).get("token");
        if (!token)
          throw new Error("Open the link from your email to continue.");
        result = await api("auth/" + (verify ? "verify" : "reset"), "POST", {
          token,
          password: data.password,
        });
        setSuccess(
          verify
            ? "Your email is verified. You can now submit applications."
            : "Your password has been updated. You can sign in now.",
        );
        await refreshUser();
      } else {
        result = await api(
          "auth/" + (register ? "register" : forgot ? "forgot" : "login"),
          "POST",
          { ...data, consent: data.consent === "on" },
        );
        if (forgot || register) {
          setSuccess(result.message);
          await refreshUser();
        } else {
          const signedIn = await refreshUser();
          const staffHome = signedIn?.permissions?.length
            ? signedIn.permissions.length === 1 &&
              signedIn.permissions.includes("products")
              ? "/admin/products/"
              : "/admin/"
            : "/user/";
          const next = new URLSearchParams(location.search).get("next");
          location.assign(
            next &&
              next.startsWith("/") &&
              !next.startsWith("//") &&
              !next.includes("\\")
              ? signedIn?.roles?.includes("store_employee") &&
                !signedIn?.roles?.includes("admin") &&
                next.startsWith("/admin")
                ? "/admin/products/"
                : next
              : staffHome,
          );
        }
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="auth-section">
      <div className="auth-story">
        <img
          src="/images/education.jpg"
          alt="Children reading together — illustrative photograph"
        />
        <div>
          <p className="eyebrow">BE PART OF SOMETHING MEANINGFUL</p>
          <h1>
            A community
            <br />
            of possibility.
          </h1>
          <p>
            Your time. Your ideas. Your compassion.
            <br />
            They all have a place here.
          </p>
        </div>
      </div>
      <div className="auth-panel">
        <Brand />
        <h2>{title}</h2>
        <p className="muted">
          {register
            ? "Create your account and take the first step."
            : forgot
              ? "Enter your email to request a password reset link."
              : verify
                ? "Confirm your email address to activate applications."
                : reset
                  ? "Choose a strong password for your account."
                  : "Sign in to follow your applications and contributions."}
        </p>
        {error && <Notice error>{error}</Notice>}
        {success ? (
          <div>
            <Notice>{success}</Notice>
            <a
              className="button"
              href={
                forgot ? "/login/" : register || verify ? "/user/" : "/login/"
              }
            >
              {register || verify ? "Go to my account" : "Back to sign in"}
              <ArrowUpRight size={17} />
            </a>
          </div>
        ) : (
          <form method="post" onSubmit={submit}>
            {register && (
              <Field
                label="Full name"
                name="name"
                autoComplete="name"
                required
                maxLength={100}
              />
            )}{" "}
            {!verify && !reset && (
              <Field
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            )}
            {!verify && !forgot && (
              <div className="password-field">
                <Field
                  label={reset ? "New password" : "Password"}
                  name="password"
                  type={show ? "text" : "password"}
                  autoComplete={
                    register || reset ? "new-password" : "current-password"
                  }
                  required
                  minLength={register || reset ? 12 : 1}
                  maxLength={72}
                />
                <button
                  type="button"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            )}
            {(register || reset) && (
              <>
                <small className="field-help">
                  Use at least 12 characters.
                </small>
                <Field
                  label="Confirm password"
                  name="confirm"
                  type="password"
                  autoComplete="new-password"
                  required
                />
              </>
            )}
            {register && (
              <label className="check-label">
                <input type="checkbox" name="consent" required />
                <span>
                  I agree to the <a href="/terms/">terms</a> and{" "}
                  <a href="/privacy/">privacy notice</a>.
                </span>
              </label>
            )}
            {!register && !forgot && !verify && !reset && (
              <a className="forgot-link" href="/forgot-password/">
                Forgot your password?
              </a>
            )}
            <button className="button full" disabled={busy || !ready}>
              {busy
                ? "Please wait…"
                : register
                  ? "Create my account"
                  : forgot
                    ? "Send reset link"
                    : verify
                      ? "Verify my email"
                      : reset
                        ? "Update password"
                        : "Sign in"}
              <ArrowUpRight size={17} />
            </button>
          </form>
        )}
        {!success && !verify && !reset && (
          <p className="auth-switch">
            {register ? "Already part of the community?" : "New to WBF?"}{" "}
            <a href={register ? "/login/" : "/register/"}>
              {register ? "Sign in" : "Create an account"}
            </a>
          </p>
        )}
        <div className="secure-note">
          <ShieldCheck size={16} /> Your information is kept private.
        </div>
      </div>
    </section>
  );
}
