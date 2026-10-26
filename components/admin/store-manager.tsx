"use client";
import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Package,
  Upload,
  X,
  Users,
  ExternalLink,
} from "lucide-react";
import { api } from "@/lib/client";
import { money } from "@/lib/content";
import { Field, Notice, Loading } from "../site/shared";
import { useSite } from "../site/context";
const blank = {
  title: "",
  slug: "",
  summary: "",
  body: "",
  image: "",
  category: "",
  status: "draft",
  kind: "product",
  data: {},
};
export function StoreManager() {
  const { user } = useSite();
  const [items, setItems] = useState<any[]>([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState(""),
    [form, setForm] = useState<any>(null),
    [employee, setEmployee] = useState(false),
    [busy, setBusy] = useState(false);
  async function load() {
    try {
      setItems((await api("admin/products")).items);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    load();
  }, []);
  function edit(p: any) {
    setError("");
    setForm({
      ...p,
      rupees: p.data.price ? p.data.price / 100 : "",
      sale: p.data.salePrice ? p.data.salePrice / 100 : "",
      stock: p.data.stock ?? "",
      data: { ...p.data },
    });
  }
  function update(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }));
  }
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { rupees, sale, stock, ...payload } = form;
      payload.data = {
        ...form.data,
        price: Math.round(Number(rupees) * 100),
        salePrice: sale === "" ? 0 : Math.round(Number(sale) * 100),
      };
      if (stock === "") delete payload.data.stock;
      else payload.data.stock = Number(stock);
      await api(
        "admin/products" + (form.id ? "/" + form.id : ""),
        form.id ? "PATCH" : "POST",
        payload,
      );
      setForm(null);
      setMessage(
        payload.status === "published"
          ? "Product published. It is now available in the website store."
          : "Product saved.",
      );
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function upload(file?: File) {
    if (file && file.size > 4000000) {
      setError("Choose a file smaller than 4 MB.");
      return;
    }
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      data.set("file", file);
      data.set("alt", form.title || "Product photograph");
      data.set("visibility", "public");
      const result = await api("media", "POST", data);
      update("image", result.url);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function createEmployee(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setBusy(true);
    setError("");
    try {
      await api("admin/users", "POST", { ...data, role: "store_employee" });
      setEmployee(false);
      setMessage(
        "Store employee created. Share the sign-in email and password privately. Their account can manage product listings only.",
      );
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const visible = items.filter(
    (p) =>
      (!filter || p.status === filter) &&
      (p.title + " " + p.category).toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <div className="store-management">
      <div className="store-management-actions">
        <button className="button" onClick={() => edit(blank)}>
          <Plus size={17} /> Add product
        </button>
        {user.roles?.includes("admin") && (
          <button
            className="button secondary"
            onClick={() => {
              setEmployee(true);
              setError("");
            }}
          >
            <Users size={17} /> Create store employee
          </button>
        )}
        {user.permissions.includes("donations") && (
          <a className="button secondary" href="/admin/store/">
            Product inquiries
          </a>
        )}
        <a
          className="text-link"
          href="/store/"
          target="_blank"
          rel="noreferrer"
        >
          View store <ExternalLink size={16} />
        </a>
      </div>
      <div className="store-management-stats">
        <span>
          <strong>{items.length}</strong> Total products
        </span>
        <span>
          <strong>
            {items.filter((p) => p.status === "published").length}
          </strong>{" "}
          Published
        </span>
        <span>
          <strong>{items.filter((p) => p.status === "draft").length}</strong>{" "}
          Drafts
        </span>
      </div>
      {error && !form && !employee && <Notice error>{error}</Notice>}
      {message && <Notice>{message}</Notice>}
      <div className="store-management-filters">
        <label>
          <Search size={17} />
          <input
            aria-label="Search products"
            placeholder="Search name or category"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter product status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <div className="managed-products">
          {visible.map((p) => (
            <article key={p.id}>
              {p.image ? (
                <img src={p.image} alt={p.title} />
              ) : (
                <div className="product-placeholder">
                  <Package size={36} />
                </div>
              )}
              <div>
                <span className={"status status-" + p.status}>{p.status}</span>
                <h3>{p.title}</h3>
                <p>{p.category || "Uncategorized"}</p>
                <strong>{money(p.data.price || 0)}</strong>
                <p>
                  {p.data.stock === undefined
                    ? "Availability on request"
                    : p.data.stock + " in stock"}
                </p>
                <button
                  className="button secondary small"
                  onClick={() => edit(p)}
                >
                  Edit product
                </button>
              </div>
            </article>
          ))}
          {!visible.length && (
            <p className="store-empty">
              No products found. Add your first product or adjust the filters.
            </p>
          )}
        </div>
      )}
      {form && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Product editor"
        >
          <div className="editor-modal product-editor">
            <div className="modal-header">
              <div>
                <p className="eyebrow">STORE</p>
                <h2>{form.id ? "Edit product" : "Add a product"}</h2>
              </div>
              <button
                className="icon-button"
                aria-label="Close product editor"
                disabled={busy}
                onClick={() => setForm(null)}
              >
                <X />
              </button>
            </div>
            {error && <Notice error>{error}</Notice>}
            <form onSubmit={save}>
              <div className="form-grid">
                <Field
                  label="Product name"
                  required
                  value={form.title}
                  onChange={(e: any) => {
                    update("title", e.target.value);
                    if (!form.id)
                      update(
                        "slug",
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, "-")
                          .replace(/^-|-$/g, ""),
                      );
                  }}
                />
                <Field
                  label="URL slug"
                  required
                  value={form.slug}
                  onChange={(e: any) => update("slug", e.target.value)}
                />
                <Field
                  label="Category"
                  value={form.category}
                  onChange={(e: any) => update("category", e.target.value)}
                />
                <Field label="Status">
                  <select
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">
                      Published — visible in store
                    </option>
                    <option value="archived">
                      Archived — hidden from store
                    </option>
                  </select>
                </Field>
                <Field
                  label="Price (₹)"
                  type="number"
                  min="0.01"
                  max="1000000"
                  step="0.01"
                  required
                  value={form.rupees}
                  onChange={(e: any) => update("rupees", e.target.value)}
                />
                <Field
                  label="Stock quantity (optional)"
                  type="number"
                  min="0"
                  max="1000000"
                  step="1"
                  value={form.stock}
                  onChange={(e: any) => update("stock", e.target.value)}
                />
                <Field
                  label="Sale price (₹, optional)"
                  type="number"
                  min="0.01"
                  max={form.rupees}
                  step="0.01"
                  value={form.sale}
                  onChange={(e: any) => update("sale", e.target.value)}
                />
                <Field
                  label="Sale ends"
                  type="datetime-local"
                  required={!!form.sale}
                  value={
                    form.data.saleUntil
                      ? new Date(form.data.saleUntil)
                          .toLocaleString("sv-SE")
                          .replace(" ", "T")
                          .slice(0, 16)
                      : ""
                  }
                  onChange={(e: any) =>
                    update("data", {
                      ...form.data,
                      saleUntil: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    })
                  }
                />
              </div>
              <Field
                label="Short description"
                required
                value={form.summary}
                onChange={(e: any) => update("summary", e.target.value)}
              />
              <Field label="Product details">
                <textarea
                  rows={5}
                  value={form.body}
                  onChange={(e) => update("body", e.target.value)}
                />
              </Field>
              <div className="product-upload">
                {form.image && <img src={form.image} alt="Product preview" />}
                <div>
                  <label className="upload-product-label">
                    <Upload size={18} /> Upload product image
                    <input
                      aria-label="Upload product image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={busy}
                      onChange={(e) => upload(e.target.files?.[0])}
                    />
                  </label>
                  <small>JPEG, PNG or WebP · up to 4 MB</small>
                  <Field
                    label="Or image URL"
                    value={form.image}
                    onChange={(e: any) => update("image", e.target.value)}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="button secondary"
                  disabled={busy}
                  onClick={() => setForm(null)}
                >
                  Cancel
                </button>
                <button className="button" disabled={busy}>
                  {busy ? "Saving…" : "Save product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {employee && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Create store employee"
        >
          <div className="editor-modal employee-editor">
            <div className="modal-header">
              <h2>Create store employee</h2>
              <button
                className="icon-button"
                aria-label="Close employee form"
                disabled={busy}
                onClick={() => setEmployee(false)}
              >
                <X />
              </button>
            </div>
            <p>
              This account can add, edit, publish and archive products, and
              upload product images. Other admin sections are unavailable.
            </p>
            {error && <Notice error>{error}</Notice>}
            <form onSubmit={createEmployee}>
              <Field
                label="Employee name"
                name="name"
                required
                maxLength={100}
              />
              <Field label="Email address" name="email" type="email" required />
              <Field
                label="Password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={12}
                maxLength={72}
              />
              <p className="field-help">
                Use at least 12 characters. The employee can change it in My
                account.
              </p>
              <button className="button" disabled={busy}>
                {busy ? "Creating…" : "Create employee"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
