"use client";
import { useState, useEffect } from "react";
import { X, Save, Eye, History } from "lucide-react";
import { Field, Notice } from "../site/shared";
import { api } from "@/lib/client";
import { SectionsEditor } from "./sections";
import { contentKinds, type Entry } from "@/lib/content";
export function ContentEditor({
  item,
  onClose,
  onSave,
}: {
  item: any;
  onClose: () => void;
  onSave: () => void;
}) {
  const [form, setForm] = useState<any>({
      ...item,
      data: { ...(item.data || {}) },
    }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [preview, setPreview] = useState(false),
    [revisions, setRevisions] = useState<any[] | null>(null);
  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const detail = (k: string, v: any) =>
    setForm((f: any) => ({ ...f, data: { ...f.data, [k]: v } }));
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api(
        "admin/content" + (item.id ? "/" + item.id : ""),
        item.id ? "PATCH" : "POST",
        form,
      );
      onSave();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const field = (
    label: string,
    key: string,
    type = "text",
    required = false,
  ) => (
    <Field
      label={label}
      type={type}
      value={form[key] || ""}
      required={required}
      onChange={(e: any) => update(key, e.target.value)}
    />
  );
  const df = (label: string, key: string, type = "text", required = false) => (
    <Field
      label={label}
      type={type}
      value={
        type === "datetime-local"
          ? String(form.data[key] || "").slice(0, 16)
          : (form.data[key] ?? "")
      }
      required={required}
      onChange={(e: any) =>
        detail(
          key,
          type === "number"
            ? Number(e.target.value)
            : type === "datetime-local" && e.target.value
              ? e.target.value + "+05:30"
              : e.target.value,
        )
      }
    />
  );
  const kind = form.kind;
  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Content editor"
    >
      <div className="editor-modal">
        <div className="modal-header">
          <div>
            <p className="eyebrow">CONTENT STUDIO</p>
            <h2>{item.id ? "Edit content" : "Create something meaningful"}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close editor"
          >
            <X />
          </button>
        </div>
        <div className="editor-tools">
          <button
            className="button secondary small"
            onClick={() => setPreview(!preview)}
          >
            <Eye size={15} />
            {preview ? "Back to editor" : "Preview"}
          </button>
          {item.id && (
            <button
              className="button secondary small"
              onClick={async () => {
                try {
                  setRevisions(
                    (await api("admin/content/revisions?contentId=" + item.id))
                      .items,
                  );
                } catch (e: any) {
                  setError(e.message);
                }
              }}
            >
              <History size={15} /> Revision history
            </button>
          )}
        </div>
        {error && <Notice error>{error}</Notice>}
        {revisions && (
          <div className="revisions-panel">
            <h3>Saved revisions</h3>
            {!revisions.length && <p>No previous revisions yet.</p>}
            {revisions.map((r) => (
              <button
                key={r.id}
                onClick={() => {
                  const old = JSON.parse(r.snapshot);
                  setForm({
                    ...old,
                    data: JSON.parse(old.data),
                    status: "draft",
                    updated_at: item.updated_at,
                  });
                  setRevisions(null);
                }}
              >
                {new Date(r.created_at).toLocaleString()} · Restore as draft
              </button>
            ))}
          </div>
        )}
        {preview ? (
          <article className="editor-preview">
            <p className="eyebrow">Unpublished preview · {form.kind}</p>
            {form.image && <img src={form.image} alt={form.title} />}
            <h1>{form.title}</h1>
            <p className="lead">{form.summary}</p>
            {String(form.body || "")
              .split("\n\n")
              .map((p: string, i: number) => (
                <p key={i}>{p}</p>
              ))}
            {(form.data.sections || [])
              .filter((s: any) => s.visible)
              .map((s: any) => (
                <section key={s.id} className="cms-section">
                  <h2>{s.title}</h2>
                  {s.image && <img src={s.image} alt={s.title} />}
                  <p>{s.body}</p>
                  {s.link && (
                    <a href={s.link} target="_blank" rel="noreferrer">
                      {s.linkLabel || "Learn more"} ↗
                    </a>
                  )}
                </section>
              ))}
          </article>
        ) : (
          <form onSubmit={submit}>
            <div className="form-grid">
              <Field label="Content type">
                <select
                  value={kind}
                  onChange={(e) => update("kind", e.target.value)}
                >
                  {contentKinds.map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </Field>
              <Field label="Publication status">
                <select
                  value={form.status}
                  onChange={(e) => update("status", e.target.value)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </Field>
            </div>
            {field("Title", "title", "text", true)}
            <div className="form-grid">
              {field("URL slug", "slug", "text", true)}
              {field("Category / department", "category")}
            </div>
            <Field label="Short introduction">
              <textarea
                rows={3}
                value={form.summary || ""}
                onChange={(e) => update("summary", e.target.value)}
                maxLength={1200}
              />
            </Field>
            <Field label="Main text">
              <textarea
                rows={8}
                value={form.body || ""}
                onChange={(e) => update("body", e.target.value)}
                maxLength={40000}
              />
            </Field>
            <div className="form-grid">
              {field("Image path or HTTPS URL", "image")}
              {field("Source or evidence URL", "source")}
            </div>
            <p className="field-help">
              Upload images in Media Library, then copy the file URL. Only use
              content you have permission to publish.
            </p>
            <div className="form-grid">
              {field("Display order", "sort", "number")}
              {field("Publish from (ISO date/time)", "published_at")}
            </div>
            {kind === "event" && (
              <div className="form-grid">
                {df("Starts at", "start", "datetime-local", true)}
                {df("Ends at", "end", "datetime-local", true)}
                {df("Venue", "location")}
                {df("External registration URL (optional)", "registrationUrl")}
              </div>
            )}
            {kind === "team" && df("Team group", "group")}
            {kind === "job" && (
              <div className="form-grid">
                {df("Location", "location")}
                {df("Employment type", "employmentType")}
                {df("Application deadline (optional)", "deadline", "date")}
              </div>
            )}
            {kind === "metric" && (
              <div className="form-grid">
                {df("Published value", "value", "text", true)}
                {df("Reporting period", "period", "text", true)}
              </div>
            )}
            {["document", "report", "video", "partner", "team"].includes(
              kind,
            ) && df("Document, video or profile URL", "url")}
            {kind === "product" && (
              <div className="form-grid">
                {df("Regular price (paise)", "price", "number", true)}
                {df("Sale price (paise)", "salePrice", "number")}
                {df("Sale ends", "saleUntil", "datetime-local")}
              </div>
            )}
            {kind === "program" && df("Icon name", "icon")}
            {kind === "page" && (
              <SectionsEditor
                sections={form.data.sections || []}
                onChange={(sections) => detail("sections", sections)}
              />
            )}{" "}
            <div className="form-actions">
              <button
                type="button"
                className="button secondary"
                onClick={onClose}
              >
                Cancel
              </button>
              <button className="button" disabled={busy}>
                <Save size={16} />
                {busy ? "Saving…" : "Save " + form.status}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
