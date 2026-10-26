"use client";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Heart,
  Inbox,
  Settings,
  Image as ImageIcon,
  History,
  Mail,
  ShoppingBag,
  Search,
  Plus,
  Download,
  ArrowUpRight,
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Check,
  TrendingUp,
  ClipboardList,
  Eye,
  RefreshCw,
} from "lucide-react";
import { useSite } from "../site/context";
import {
  Brand,
  Field,
  Notice,
  Loading,
  Empty,
  Status,
  ButtonLink,
} from "../site/shared";
import { StoreManager } from "./store-manager";
import { NavigationEditor } from "./navigation-editor";
import { ContentEditor } from "./editor";
import { api } from "@/lib/client";
import { money, niceDate, contentKinds, roleNames } from "@/lib/content";
const nav = [
  ["overview", "Overview", LayoutDashboard, ""],
  ["content", "Content studio", FileText, "content"],
  ["applications", "Applications", ClipboardList, "applications"],
  ["donations", "Donations", Heart, "donations"],
  ["products", "Store", ShoppingBag, "products"],
  ["store", "Store inquiries", ShoppingBag, "donations"],
  ["users", "People & access", Users, "users"],
  ["media", "Media library", ImageIcon, "media"],
  ["inbox", "Contact inbox", Inbox, "inbox"],
  ["notifications", "Email outbox", Mail, "notifications"],
  ["settings", "Settings", Settings, "settings"],
  ["audit", "Audit trail", History, "audit"],
] as const;
export function Admin({ section = "overview" }: { section?: string }) {
  const { user, authLoading, refreshUser } = useSite();
  const [data, setData] = useState<any>(null),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [query, setQuery] = useState(""),
    [status, setStatus] = useState(""),
    [kind, setKind] = useState(""),
    [page, setPage] = useState(1),
    [from, setFrom] = useState(""),
    [to, setTo] = useState(""),
    [editor, setEditor] = useState<any>(null),
    [detail, setDetail] = useState<any>(null),
    [busy, setBusy] = useState(false),
    [mobile, setMobile] = useState(false);
  const params = new URLSearchParams({
    q: query,
    status,
    kind,
    page: String(page),
    from,
    to,
  });
  async function load() {
    setError("");
    try {
      setData(await api("admin/" + section + "?" + params));
    } catch (e: any) {
      setError(e.message);
    }
  }
  useEffect(() => {
    if (!user?.permissions?.length || section === "products") return;
    const timeout = setTimeout(() => load(), 180);
    return () => clearTimeout(timeout);
  }, [user?.id, section, query, status, kind, page, from, to]);
  useEffect(() => {
    if (
      section === "overview" &&
      user?.permissions?.length === 1 &&
      user.permissions.includes("products")
    )
      location.replace("/admin/products/");
  }, [section, user?.id]);
  async function mutate(
    path: string,
    method: string,
    body: any,
    success = "Changes saved.",
  ) {
    setBusy(true);
    setError("");
    try {
      await api(path, method, body);
      setMessage(success);
      setDetail(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function openDetail(id: string) {
    try {
      setDetail((await api("admin/" + section + "/" + id)).items[0]);
    } catch (e: any) {
      setError(e.message);
    }
  }
  if (authLoading) return <Loading />;
  if (!user)
    return (
      <div className="admin-signin">
        <Brand />
        <Empty
          title="Welcome to the WBF workspace"
          text="Sign in with an authorized staff account to manage the foundation’s work."
          href={
            "/login/?next=/admin/" +
            (section === "overview" ? "" : section + "/")
          }
          label="Sign in"
        />
      </div>
    );
  if (!user.permissions?.length)
    return (
      <div className="admin-signin">
        <Brand />
        <Empty
          title="Staff access is required"
          text="Your account does not have access to administration."
          href="/user/"
          label="Go to my account"
        />
      </div>
    );
  const sectionPermission = nav.find((n) => n[0] === section)?.[3];
  if (sectionPermission && !user.permissions.includes(sectionPermission))
    return (
      <div className="admin-signin">
        <Empty
          title="This section is not available for your account"
          href="/admin/"
          label="Back to workspace"
        />
      </div>
    );
  const label = nav.find((n) => n[0] === section)?.[1] || "Administration";
  const items = data?.items || [];
  const filteredContent =
    section === "content"
      ? items.filter(
          (x: any) =>
            (!kind || x.kind === kind) &&
            (!status || x.status === status) &&
            (!query ||
              (x.title + " " + x.summary)
                .toLowerCase()
                .includes(query.toLowerCase())),
        )
      : items;
  const totalPages =
    section === "content"
      ? Math.ceil(filteredContent.length / 20)
      : data?.pages || 0;
  const totalRecords =
    section === "content" ? filteredContent.length : data?.total || 0;
  const content =
    section === "content"
      ? filteredContent.slice((page - 1) * 20, page * 20)
      : filteredContent;
  return (
    <div className="admin-app">
      <aside className={"admin-sidebar " + (mobile ? "open" : "")}>
        <Brand light />
        <p className="workspace-label">FOUNDATION WORKSPACE</p>
        <nav aria-label="Administration">
          {nav
            .filter((n) => !n[3] || user.permissions.includes(n[3]))
            .map(([key, label, Icon]) => (
              <a
                className={section === key ? "active" : ""}
                key={key}
                href={"/admin/" + (key === "overview" ? "" : key + "/")}
              >
                <Icon size={18} />
                {label}
              </a>
            ))}
        </nav>
        <div className="admin-sidebar-bottom">
          <a href="/" target="_blank">
            <ArrowUpRight size={17} /> View website
          </a>
          <a href="/user/">
            <Users size={17} /> My account
          </a>
          <button
            onClick={async () => {
              await api("auth/logout", "POST", {});
              await refreshUser();
              location.assign("/login/");
            }}
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="mobile-toggle icon-button"
            onClick={() => setMobile(!mobile)}
            aria-label="Toggle administration menu"
          >
            {mobile ? <X /> : <Menu />}
          </button>
          <span>
            Workspace <span className="muted">/ {label}</span>
          </span>
          <div>
            <span className="admin-avatar">{user.name[0]}</span>
            <span>
              {user.name}
              <small>{user.roles.join(", ")}</small>
            </span>
          </div>
        </header>
        <main id="main-content" className="admin-body">
          <div className="admin-title">
            <div>
              <p className="eyebrow">
                {section === "overview"
                  ? "A CLEARER PICTURE"
                  : "WBF ADMINISTRATION"}
              </p>
              <h1>
                {section === "overview"
                  ? "Welcome back, " + user.name.split(" ")[0] + "."
                  : label}
              </h1>
              <p>
                {section === "overview"
                  ? "Your community’s work, at a glance."
                  : section === "products"
                    ? "Manage products, images, prices and availability in your store."
                    : section === "content"
                      ? "Create, refine, and publish the stories behind your work."
                      : "Keep every record clear, current, and connected."}
              </p>
            </div>
            {section === "content" ? (
              <button
                className="button"
                onClick={() =>
                  setEditor({
                    kind: kind || "post",
                    status: "draft",
                    title: "",
                    slug: "",
                    summary: "",
                    body: "",
                    image: "",
                    source: "",
                    sort: 0,
                    data: {},
                  })
                }
              >
                <Plus size={17} /> Create content
              </button>
            ) : section === "products" ? null : (
              <button className="button secondary small" onClick={load}>
                <RefreshCw size={15} /> Refresh
              </button>
            )}
          </div>
          {error && <Notice error>{error}</Notice>}
          {message && (
            <Notice>
              {message}
              <button className="inline-button" onClick={() => setMessage("")}>
                {" "}
                Dismiss
              </button>
            </Notice>
          )}
          {section === "overview" && (
            <div className="admin-shortcuts">
              {nav
                .filter((n) => n[3] && user.permissions.includes(n[3]))
                .map(([key, label, Icon]) => (
                  <a href={`/admin/${key}/`} key={key}>
                    <Icon size={19} />
                    <span>{label}</span>
                    <ArrowUpRight size={15} />
                  </a>
                ))}
            </div>
          )}
          {section === "products" ? (
            <StoreManager />
          ) : section === "overview" ? (
            <>
              <div className="overview-controls">
                <Field
                  label="Show activity since"
                  type="date"
                  value={from}
                  onChange={(e: any) => setFrom(e.target.value)}
                />
              </div>
              {!data ? (
                <Loading />
              ) : (
                <>
                  <div className="admin-stat-grid">
                    {[
                      [
                        Heart,
                        "Verified test donations",
                        data.donations ? money(data.donations.amount) : null,
                        "From captured payments",
                      ],
                      [
                        ClipboardList,
                        "Applications",
                        data.applications?.total,
                        "Submitted applications",
                      ],
                      [
                        Users,
                        "Community accounts",
                        data.users?.total,
                        "Registered members",
                      ],
                      [
                        FileText,
                        "Published content",
                        data.content?.total,
                        "Visible on the website",
                      ],
                    ]
                      .filter((x) => x[2] !== null && x[2] !== undefined)
                      .map(([Icon, label, value, note]: any) => (
                        <div className="admin-stat" key={label}>
                          <span>
                            <Icon size={20} />
                          </span>
                          <p>{label}</p>
                          <strong>{value}</strong>
                          <small>{note}</small>
                        </div>
                      ))}
                  </div>
                  <div className="overview-grid">
                    <div className="admin-card">
                      <h2>Contributions over time</h2>
                      <p className="muted">
                        Verified test payment totals by month.
                      </p>
                      {data.chart?.length ? (
                        <div className="bar-chart">
                          {data.chart.map((c: any) => (
                            <div key={c.month}>
                              <span>{money(c.amount)}</span>
                              <div
                                style={{
                                  height: Math.max(
                                    10,
                                    (c.amount /
                                      Math.max(
                                        ...data.chart.map((v: any) => v.amount),
                                      )) *
                                      160,
                                  ),
                                }}
                              />
                              <small>{c.month}</small>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <Empty
                          title="Every contribution starts somewhere"
                          text="The chart will populate when a test payment has been verified."
                        />
                      )}
                    </div>
                    <div className="admin-card">
                      <h2>Needs your attention</h2>
                      <div className="attention-item">
                        <span>Pending applications</span>
                        <strong>{data.applications?.pending || 0}</strong>
                      </div>
                      <div className="attention-item">
                        <span>Pending transactions</span>
                        <strong>{data.donations?.pending || 0}</strong>
                      </div>
                      <p className="field-help">
                        All totals come from the database. Pending payments are
                        excluded from contribution amounts.
                      </p>
                      <a className="text-link" href="/admin/applications/">
                        Review applications <ArrowUpRight size={16} />
                      </a>
                    </div>
                  </div>
                  {data.activity && (
                    <div className="admin-card">
                      <h2>Recent activity</h2>
                      {data.activity.length ? (
                        data.activity.map((a: any) => (
                          <div className="activity-row" key={a.id}>
                            <span className="activity-dot" />
                            <div>
                              <strong>{a.action.replace(/[.]/g, " · ")}</strong>
                              <p>
                                {a.name || "System"} · {niceDate(a.created_at)}
                              </p>
                            </div>
                            <small>{a.target.slice(0, 18)}</small>
                          </div>
                        ))
                      ) : (
                        <p className="muted">
                          Administrative activity will appear here.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          ) : section === "settings" ? (
            data ? (
              <SettingsPanel
                data={data}
                onSave={(b: any) => mutate("admin/settings", "PATCH", b)}
                busy={busy}
              />
            ) : (
              <Loading />
            )
          ) : (
            <>
              {section === "media" && (
                <form
                  className="admin-card upload-form"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    setBusy(true);
                    try {
                      const data = new FormData(form);
                      const file = data.get("file");
                      if (file instanceof File && file.size > 4000000)
                        throw new Error("Choose a file smaller than 4 MB.");
                      await api("media", "POST", data);
                      form.reset();
                      setMessage("File uploaded.");
                      await load();
                    } catch (e: any) {
                      setError(e.message);
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <h2>Add to your media library</h2>
                  <div className="form-grid">
                    <Field
                      label="Image or PDF (maximum 4 MB)"
                      type="file"
                      name="file"
                      accept="image/jpeg,image/png,image/webp,application/pdf"
                      required
                    />
                    <Field
                      label="Description / alternative text"
                      name="alt"
                      required
                      maxLength={300}
                    />
                    <Field label="Caption" name="caption" />
                    <Field label="Visibility">
                      <select name="visibility">
                        <option value="public">Public</option>
                        <option value="private">Staff only</option>
                      </select>
                    </Field>
                  </div>
                  <button className="button" disabled={busy}>
                    <Plus size={16} />
                    {busy ? "Uploading…" : "Upload file"}
                  </button>
                </form>
              )}
              <div className="admin-card records-card">
                <div className="admin-filters">
                  <label className="search-field">
                    <Search size={17} />
                    <input
                      placeholder="Search records…"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                      }}
                      aria-label="Search records"
                    />
                  </label>
                  {section === "content" && (
                    <select
                      value={kind}
                      onChange={(e) => {
                        setKind(e.target.value);
                        setPage(1);
                      }}
                      aria-label="Content type"
                    >
                      <option value="">All content types</option>
                      {contentKinds.map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  )}
                  {section === "applications" && (
                    <select
                      value={kind}
                      onChange={(e) => {
                        setKind(e.target.value);
                        setPage(1);
                      }}
                      aria-label="Application type"
                    >
                      <option value="">All application types</option>
                      {[
                        "volunteer",
                        "internship",
                        "job",
                        "event",
                        "partnership",
                      ].map((k) => (
                        <option key={k}>{k}</option>
                      ))}
                    </select>
                  )}
                  {[
                    "content",
                    "applications",
                    "donations",
                    "inbox",
                    "notifications",
                    "store",
                  ].includes(section) && (
                    <select
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value);
                        setPage(1);
                      }}
                      aria-label="Filter by status"
                    >
                      <option value="">All statuses</option>
                      {(section === "content"
                        ? ["draft", "published", "archived"]
                        : section === "applications"
                          ? [
                              "pending",
                              "approved",
                              "rejected",
                              "more_information",
                              "interview",
                              "withdrawn",
                            ]
                          : section === "donations"
                            ? ["pending", "paid", "failed", "refunded"]
                            : section === "inbox"
                              ? ["new", "read", "resolved"]
                              : section === "store"
                                ? [
                                    "inquiry",
                                    "contacted",
                                    "cancelled",
                                    "fulfilled",
                                  ]
                                : ["queued", "sent", "failed"]
                      ).map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  )}
                  {section !== "content" && (
                    <a
                      className="button secondary small"
                      href={
                        "/api/admin/" + section + "?" + params + "&export=csv"
                      }
                    >
                      <Download size={15} /> Export
                    </a>
                  )}
                </div>
                {["donations", "applications", "audit"].includes(section) && (
                  <div className="date-filters">
                    <Field
                      label="From date"
                      type="date"
                      value={from}
                      onChange={(e: any) => {
                        setFrom(e.target.value);
                        setPage(1);
                      }}
                    />
                    <Field
                      label="To date"
                      type="date"
                      value={to}
                      onChange={(e: any) => {
                        setTo(e.target.value);
                        setPage(1);
                      }}
                    />
                  </div>
                )}
                {!data ? (
                  <Loading />
                ) : !content.length ? (
                  <Empty
                    title="A clear space for what comes next"
                    text={
                      query || status || kind
                        ? "No records match these filters."
                        : "New records will appear here as people take part."
                    }
                  />
                ) : section === "media" ? (
                  <div className="media-grid">
                    {content.map((m: any) => (
                      <div key={m.id}>
                        {m.mime.startsWith("image/") ? (
                          <img src={"/api/media/" + m.id} alt={m.alt} />
                        ) : (
                          <FileText size={45} />
                        )}
                        <h3>{m.name}</h3>
                        <p>{m.alt}</p>
                        <small>
                          {Math.round(m.size / 1024)} KB · {m.visibility}
                        </small>
                        <div>
                          <button
                            className="inline-button"
                            onClick={async () => {
                              await navigator.clipboard.writeText(
                                "/api/media/" + m.id,
                              );
                              setMessage("File URL copied.");
                            }}
                          >
                            Copy URL
                          </button>
                          <button
                            className="inline-button"
                            onClick={() => setDetail(m)}
                          >
                            Edit
                          </button>
                          <button
                            className="inline-button danger"
                            onClick={() => {
                              if (
                                confirm("Delete this unused file permanently?")
                              )
                                mutate("admin/media/" + m.id, "DELETE", {});
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="table-scroll">
                    <table>
                      <thead>
                        <tr>
                          {section === "content" ? (
                            <>
                              <th>Title</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Updated</th>
                              <th>Actions</th>
                            </>
                          ) : section === "users" ? (
                            <>
                              <th>Person</th>
                              <th>Role</th>
                              <th>Verified</th>
                              <th>Access</th>
                              <th>Actions</th>
                            </>
                          ) : section === "audit" ? (
                            <>
                              <th>Action</th>
                              <th>Record</th>
                              <th>Detail</th>
                              <th>Date</th>
                            </>
                          ) : section === "notifications" ? (
                            <>
                              <th>Recipient / subject</th>
                              <th>Status</th>
                              <th>Attempts</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </>
                          ) : (
                            <>
                              <th>
                                {section === "store" ? "Reference" : "Name"}
                              </th>
                              <th>
                                {section === "donations" || section === "store"
                                  ? "Amount"
                                  : section === "inbox"
                                    ? "Subject"
                                    : "Application"}
                              </th>
                              <th>Status</th>
                              <th>Date</th>
                              <th>Actions</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {content.map((r: any) => (
                          <tr key={r.id}>
                            {section === "content" ? (
                              <>
                                <td>
                                  <strong>{r.title}</strong>
                                  <small>/{r.slug}/</small>
                                </td>
                                <td>
                                  <span className="type-label">{r.kind}</span>
                                </td>
                                <td>
                                  <Status status={r.status} />
                                </td>
                                <td>{niceDate(r.updated_at)}</td>
                                <td>
                                  <button
                                    className="table-button"
                                    onClick={() => setEditor(r)}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    className="inline-button"
                                    onClick={() => {
                                      if (confirm("Archive this content?"))
                                        mutate(
                                          "admin/content/" + r.id,
                                          "DELETE",
                                          {},
                                        );
                                    }}
                                  >
                                    Archive
                                  </button>
                                </td>
                              </>
                            ) : section === "users" ? (
                              <>
                                <td>
                                  <strong>{r.name}</strong>
                                  <small>{r.email}</small>
                                </td>
                                <td>{r.roles.join(", ")}</td>
                                <td>{r.verified ? "Verified" : "Pending"}</td>
                                <td>
                                  <Status
                                    status={r.active ? "active" : "inactive"}
                                  />
                                </td>
                                <td>
                                  <button
                                    className="table-button"
                                    onClick={() => setDetail(r)}
                                  >
                                    Manage
                                  </button>
                                </td>
                              </>
                            ) : section === "audit" ? (
                              <>
                                <td>
                                  <strong>{r.action}</strong>
                                </td>
                                <td className="mono-cell">{r.target}</td>
                                <td>{r.detail || "—"}</td>
                                <td>{niceDate(r.created_at)}</td>
                              </>
                            ) : section === "notifications" ? (
                              <>
                                <td>
                                  <strong>{r.subject}</strong>
                                  <small>{r.email}</small>
                                </td>
                                <td>
                                  <Status status={r.status} />
                                </td>
                                <td>{r.attempts}</td>
                                <td>{niceDate(r.created_at)}</td>
                                <td>
                                  {r.status !== "sent" && (
                                    <button
                                      className="table-button"
                                      disabled={busy}
                                      onClick={() =>
                                        mutate(
                                          "admin/notifications/" + r.id,
                                          "POST",
                                          {},
                                          "Delivery attempt completed. Check its status.",
                                        )
                                      }
                                    >
                                      Retry delivery
                                    </button>
                                  )}
                                </td>
                              </>
                            ) : (
                              <>
                                <td>
                                  <strong>{r.name || r.reference}</strong>
                                  <small>{r.email || r.id.slice(0, 8)}</small>
                                </td>
                                <td>
                                  {section === "donations" ||
                                  section === "store"
                                    ? money(r.amount)
                                    : r.subject || r.kind}
                                </td>
                                <td>
                                  <Status status={r.status} />
                                </td>
                                <td>{niceDate(r.created_at)}</td>
                                <td>
                                  <button
                                    className="table-button"
                                    onClick={() => openDetail(r.id)}
                                  >
                                    View
                                  </button>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      disabled={page <= 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft size={16} /> Previous
                    </button>
                    <span>
                      {totalRecords} records · Page {page} of {totalPages}
                    </span>
                    <button
                      disabled={page >= totalPages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
      {editor && (
        <ContentEditor
          item={editor}
          onClose={() => setEditor(null)}
          onSave={() => {
            setEditor(null);
            setMessage(
              "Content saved. Published changes are now visible on the website.",
            );
            load();
          }}
        />
      )}
      {detail && (
        <RecordDetail
          section={section}
          item={detail}
          busy={busy}
          onClose={() => setDetail(null)}
          onSave={(b: any) =>
            mutate("admin/" + section + "/" + detail.id, "PATCH", b)
          }
        />
      )}
    </div>
  );
}
function RecordDetail({ section, item, busy, onClose, onSave }: any) {
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Record details"
    >
      <div className="editor-modal record-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">{section}</p>
            <h2>{item.name || item.reference || "Record details"}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close record"
          >
            <X />
          </button>
        </div>
        {item.email && (
          <p>
            {item.email} {item.phone && "· " + item.phone}
          </p>
        )}
        {section === "applications" && (
          <>
            <div className="record-heading">
              <strong>{item.reference}</strong>
              <Status status={item.status} />
            </div>
            <dl className="review-details">
              {Object.entries(JSON.parse(item.data)).map(
                ([key, value]: any) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>
                      {Array.isArray(value) ? value.join(", ") : String(value)}
                    </dd>
                  </div>
                ),
              )}
            </dl>
          </>
        )}
        {section === "inbox" && (
          <div className="message-body">
            <h3>{item.subject}</h3>
            <p>{item.message}</p>
          </div>
        )}
        {section === "store" && (
          <>
            <p>{item.address}</p>
            <dl className="review-details">
              {item.items?.map((i: any) => (
                <div key={i.id}>
                  <dt>
                    {i.title} × {i.quantity}
                  </dt>
                  <dd>{money(i.unit_amount * i.quantity)}</dd>
                </div>
              ))}
            </dl>
            <strong>Subtotal {money(item.amount)}</strong>
          </>
        )}
        {section === "donations" ? (
          <>
            <dl className="review-details">
              {[
                ["Amount", money(item.amount)],
                ["Purpose", item.purpose],
                ["Status", item.status],
                ["Date", niceDate(item.created_at)],
                ["Anonymous", item.anonymous ? "Yes" : "No"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <h3>Gateway records</h3>
            {item.orders?.map((o: any) => (
              <p key={o.id}>
                {o.provider_id} · {o.status}
              </p>
            ))}
            {item.transactions?.map((t: any) => (
              <p key={t.id}>
                {t.provider_id} · {t.status} · {money(t.amount)}
              </p>
            ))}
            {item.receipt && item.status === "paid" && (
              <a
                className="button secondary"
                href={"/api/receipts/" + item.receipt.id}
              >
                Download acknowledgement
              </a>
            )}
            <p className="field-help">
              Payment states come from provider verification. They cannot be
              manually marked paid.
            </p>
          </>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const b: any = Object.fromEntries(new FormData(e.currentTarget));
              if (section === "users") {
                b.active = b.active === "on";
                b.verified = b.verified === "on";
              }
              onSave(b);
            }}
          >
            {section === "users" ? (
              <>
                <Field label="Role">
                  <select name="role" defaultValue={item.roles[0] || "member"}>
                    {roleNames.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </Field>
                <label className="check-label">
                  <input
                    type="checkbox"
                    name="active"
                    defaultChecked={!!item.active}
                  />
                  Account active
                </label>
                <label className="check-label">
                  <input
                    type="checkbox"
                    name="verified"
                    defaultChecked={!!item.verified}
                  />
                  Email verified by administrator
                </label>
                <Notice>
                  Changing access revokes existing sessions. Only verify an
                  email after confirming its ownership.
                </Notice>
              </>
            ) : section === "media" ? (
              <>
                <Field
                  label="Alternative text"
                  name="alt"
                  defaultValue={item.alt}
                  required
                />
                <Field
                  label="Caption"
                  name="caption"
                  defaultValue={item.caption}
                />
              </>
            ) : (
              <>
                <Field label="Status">
                  <select name="status" defaultValue={item.status}>
                    {(section === "applications"
                      ? [
                          "pending",
                          "approved",
                          "rejected",
                          "more_information",
                          "interview",
                          "withdrawn",
                        ]
                      : section === "inbox"
                        ? ["new", "read", "resolved"]
                        : ["inquiry", "contacted", "cancelled", "fulfilled"]
                    ).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                {section === "applications" && (
                  <Field label="Message visible to applicant">
                    <textarea name="message" rows={3} maxLength={2000} />
                  </Field>
                )}
                {section !== "store" && (
                  <Field label="Internal notes — staff only">
                    <textarea
                      name="notes"
                      rows={4}
                      defaultValue={item.notes}
                      maxLength={5000}
                    />
                  </Field>
                )}
              </>
            )}
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
        {item.history && (
          <div className="application-history">
            <h3>Status history</h3>
            {item.history.map((h: any) => (
              <div key={h.id}>
                <span className="history-dot" />
                <p>
                  <strong>{h.status}</strong>
                  <br />
                  {h.message}
                  <br />
                  <small>{niceDate(h.created_at)}</small>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function SettingsPanel({ data, onSave, busy }: any) {
  const [navigation, setNavigation] = useState<any[]>(
    data.organization.navigation || [],
  );
  const [role, setRole] = useState("editor"),
    [perms, setPerms] = useState<string[]>(
      data.permissions
        .filter((p: any) => p.role_id === "editor")
        .map((p: any) => p.permission_id),
    );
  return (
    <>
      <form
        className="admin-card settings-form"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...Object.fromEntries(new FormData(e.currentTarget)),
            navigation,
          });
        }}
      >
        <h2>Organization & homepage</h2>
        <p className="muted">
          Publish accurate details and approved messaging across the website.
        </p>
        <div className="form-grid">
          {Object.entries(data.organization)
            .filter(([k]) => !["maintenance", "navigation"].includes(k))
            .map(([key, val]: any) => (
              <Field
                key={key}
                label={key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (s: string) => s.toUpperCase())}
                name={key}
                defaultValue={val}
              />
            ))}
        </div>
        <NavigationEditor items={navigation} onChange={setNavigation} />
        <button className="button" disabled={busy}>
          Save organization details
        </button>
      </form>
      <div className="admin-card">
        <h2>Connected services</h2>
        <div className="service-grid">
          {Object.entries(data.configuration).map(([k, v]) => (
            <div key={k}>
              <strong>{k}</strong>
              <Status status={v ? "configured" : "pending"} />
            </div>
          ))}
        </div>
        <p className="field-help">
          Provider secrets are configured through environment variables and are
          never displayed here.
        </p>
      </div>
      <form
        className="admin-card"
        onSubmit={(e) => {
          e.preventDefault();
          onSave({ role, permissions: perms });
        }}
      >
        <h2>Role permissions</h2>
        <p className="muted">
          Grant the minimum access a role needs. Administrator permissions are
          fixed.
        </p>
        <Field label="Role">
          <select
            value={role}
            onChange={(e) => {
              setRole(e.target.value);
              setPerms(
                data.permissions
                  .filter((p: any) => p.role_id === e.target.value)
                  .map((p: any) => p.permission_id),
              );
            }}
          >
            {roleNames
              .filter((r) => r !== "admin")
              .map((r) => (
                <option key={r}>{r}</option>
              ))}
          </select>
        </Field>
        <div className="interest-grid">
          {[
            "content",
            "products",
            "media",
            "applications",
            "donations",
            "inbox",
            "users",
            "settings",
            "audit",
            "notifications",
          ].map((p) => (
            <label className="check-label" key={p}>
              <input
                type="checkbox"
                disabled={role === "store_employee"}
                checked={perms.includes(p)}
                onChange={(e) =>
                  setPerms(
                    e.target.checked
                      ? [...perms, p]
                      : perms.filter((x) => x !== p),
                  )
                }
              />
              {p}
            </label>
          ))}
        </div>
        <button className="button secondary" disabled={busy}>
          Save permissions
        </button>
      </form>
    </>
  );
}
