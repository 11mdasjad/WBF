"use client";
import { useEffect, useState } from "react";
import {
  User,
  ClipboardList,
  Heart,
  Settings,
  LogOut,
  ArrowUpRight,
  Download,
  ShoppingBag,
} from "lucide-react";
import { useSite } from "../site/context";
import { api } from "@/lib/client";
import {
  ButtonLink,
  Field,
  Notice,
  Loading,
  Status,
  Empty,
} from "../site/shared";
import { money, niceDate } from "@/lib/content";
export function Account() {
  const { user, authLoading, refreshUser } = useSite();
  const [data, setData] = useState<any>(null),
    [tab, setTab] = useState("Overview"),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setData(await api("profile"));
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    if (user) load();
  }, [user?.id]);
  async function save(e: React.FormEvent<HTMLFormElement>, password = false) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    const form = e.currentTarget;
    try {
      const values = Object.fromEntries(new FormData(form));
      if (password && values.password !== values.confirm)
        throw new Error("Passwords do not match.");
      await api(
        password ? "profile/password" : "profile",
        password ? "POST" : "PATCH",
        values,
      );
      setMessage(
        password
          ? "Password changed. Other sessions have been signed out."
          : "Your profile is updated.",
      );
      await refreshUser();
      await load();
      if (password) form.reset();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  if (authLoading) return <Loading />;
  if (!user)
    return (
      <div className="section container narrow">
        <Empty
          title="Your community account"
          text="Sign in to see applications, contributions and account details."
          href="/login/?next=/user/"
          label="Sign in"
        />
      </div>
    );
  return (
    <section className="section container account-layout">
      <aside className="account-sidebar">
        <div className="account-avatar">{user.name[0]}</div>
        <h3>{user.name}</h3>
        <p>{user.email}</p>
        {[
          ["Overview", User],
          ["Applications", ClipboardList],
          ["Donations", Heart],
          ["E-Store inquiries", ShoppingBag],
          ["Settings", Settings],
        ].map(([label, Icon]: any) => (
          <button
            key={label}
            className={tab === label ? "active" : ""}
            onClick={() => {
              setTab(label);
              setError("");
              setMessage("");
            }}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
        {user.permissions?.length > 0 && (
          <a href="/admin/">
            <Settings size={18} /> Administration
          </a>
        )}
        <button
          onClick={async () => {
            await api("auth/logout", "POST", {});
            await refreshUser();
            location.assign("/");
          }}
        >
          <LogOut size={18} /> Sign out
        </button>
      </aside>
      <div className="account-content">
        <p className="eyebrow">YOUR WBF COMMUNITY</p>
        <h2>
          {tab === "Overview"
            ? "Good to see you, " + user.name.split(" ")[0] + "."
            : tab}
        </h2>
        {error && <Notice error>{error}</Notice>}
        {message && <Notice>{message}</Notice>}
        {!user.verified && (
          <Notice>
            Your email is awaiting verification.{" "}
            <button
              className="inline-button"
              onClick={async () => {
                try {
                  const r = await api("auth/resend", "POST", {});
                  setMessage(r.message);
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            >
              Resend verification email
            </button>
          </Notice>
        )}
        {!data ? (
          <Loading />
        ) : tab === "Overview" ? (
          <>
            <p className="muted">
              Every act of care is part of a bigger story. Here’s yours.
            </p>
            <div className="account-stat-grid">
              <div>
                <ClipboardList />
                <strong>{data.applications.length}</strong>
                <span>Applications</span>
              </div>
              <div>
                <Heart />
                <strong>
                  {money(
                    data.donations
                      .filter((d: any) => d.status === "paid")
                      .reduce((s: number, d: any) => s + d.amount, 0),
                  )}
                </strong>
                <span>Verified test donations</span>
              </div>
              <div>
                <User />
                <strong>{user.verified ? "Verified" : "Pending"}</strong>
                <span>Email status</span>
              </div>
            </div>
            <div className="form-card">
              <h2>Make your next move.</h2>
              <p>
                Find an opportunity to share your time, experience and ideas.
              </p>
              <ButtonLink href="/get-involved/">
                Explore ways to contribute
              </ButtonLink>
            </div>
            <h3 className="subheading">Account updates</h3>
            {data.notifications.length ? (
              data.notifications.map((n: any) => (
                <div className="account-record" key={n.id}>
                  <div>
                    <h3>{n.subject}</h3>
                    <p>
                      {niceDate(n.created_at)} · Email {n.status}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="muted">Your account updates will appear here.</p>
            )}
          </>
        ) : tab === "Applications" ? (
          data.applications.length ? (
            data.applications.map((a: any) => (
              <div className="account-record" key={a.id}>
                <div className="record-heading">
                  <div>
                    <p className="eyebrow">{a.kind}</p>
                    <h3>{a.reference}</h3>
                    <p>Submitted {niceDate(a.created_at)}</p>
                  </div>
                  <Status status={a.status} />
                </div>
                <div className="application-history">
                  {data.history
                    .filter((h: any) => h.application_id === a.id)
                    .map((h: any) => (
                      <div key={h.id}>
                        <span className="history-dot" />
                        <div>
                          <strong>{h.status.replace(/_/g, " ")}</strong>
                          <p>{h.message}</p>
                          <small>{niceDate(h.created_at)}</small>
                        </div>
                      </div>
                    ))}
                </div>
                {["pending", "more_information"].includes(a.status) && (
                  <button
                    className="inline-button danger"
                    onClick={async () => {
                      if (!confirm("Withdraw this application?")) return;
                      try {
                        await api("applications/" + a.id, "PATCH", {});
                        await load();
                      } catch (e: any) {
                        setError(e.message);
                      }
                    }}
                  >
                    Withdraw application
                  </button>
                )}
              </div>
            ))
          ) : (
            <Empty
              title="Your first step is waiting"
              text="Applications you submit will appear here."
              href="/become-a-volunteer/"
              label="Explore volunteering"
            />
          )
        ) : tab === "Donations" ? (
          data.donations.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Purpose</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {data.donations.map((d: any) => (
                    <tr key={d.id}>
                      <td>{niceDate(d.created_at)}</td>
                      <td>{d.purpose}</td>
                      <td>{money(d.amount)}</td>
                      <td>
                        <Status status={d.status} />
                      </td>
                      <td>
                        {d.receipt_id && d.status === "paid" ? (
                          <a href={"/api/receipts/" + d.receipt_id}>
                            Download <Download size={14} />
                          </a>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty
              title="No donations recorded"
              text="Verified test donations and their acknowledgements will appear here."
              href="/donate/"
              label="Visit donations"
            />
          )
        ) : tab === "E-Store inquiries" ? (
          data.orders.length ? (
            data.orders.map((o: any) => (
              <div className="account-record record-heading" key={o.id}>
                <div>
                  <h3>{o.reference}</h3>
                  <p>
                    {niceDate(o.created_at)} · {money(o.amount)}
                  </p>
                </div>
                <Status status={o.status} />
              </div>
            ))
          ) : (
            <Empty
              title="No E-Store inquiries yet"
              text="Explore handcrafted products in the E-Store."
              href="/store/"
              label="Browse the E-Store"
            />
          )
        ) : (
          <>
            <form className="form-card" onSubmit={(e) => save(e)}>
              <h2>Personal details</h2>
              <Field
                label="Full name"
                name="name"
                defaultValue={user.name}
                required
              />
              <Field
                label="Email address"
                type="email"
                value={user.email}
                disabled
              />
              <Field
                label="Phone number"
                name="phone"
                defaultValue={user.phone}
              />
              <button className="button" disabled={busy}>
                Save profile
              </button>
            </form>
            <form className="form-card" onSubmit={(e) => save(e, true)}>
              <h2>Change password</h2>
              <Field
                label="Current password"
                name="currentPassword"
                type="password"
                required
                autoComplete="current-password"
              />
              <Field
                label="New password"
                name="password"
                type="password"
                minLength={12}
                maxLength={72}
                required
                autoComplete="new-password"
              />
              <Field
                label="Confirm new password"
                name="confirm"
                type="password"
                required
                autoComplete="new-password"
              />
              <button className="button secondary" disabled={busy}>
                Update password
              </button>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
