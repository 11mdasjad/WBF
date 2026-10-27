"use client";
import { useState, useEffect } from "react";
import {
  ShoppingBag,
  Plus,
  Minus,
  X,
  Search,
  ArrowUpRight,
  Palette,
} from "lucide-react";
import { useSite } from "./context";
import { PageHero, Field, Notice, ButtonLink, Empty } from "./shared";
import { money, type Entry } from "@/lib/content";
import { api } from "@/lib/client";
const price = (p: Entry) =>
  p.data.salePrice && new Date(p.data.saleUntil).getTime() > Date.now()
    ? p.data.salePrice
    : p.data.price;
export function Store({ slug }: { slug?: string }) {
  const { content, user } = useSite();
  const products = content.filter((p) => p.kind === "product"),
    product = products.find((p) => p.slug === slug);
  const [q, setQ] = useState(""),
    [sort, setSort] = useState("name"),
    [cart, setCart] = useState<Record<string, number>>({}),
    [show, setShow] = useState(false),
    [page, setPage] = useState(1),
    [ready, setReady] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [ref, setRef] = useState("");
  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem("wbf-cart") || "{}"));
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("wbf-cart", JSON.stringify(cart));
  }, [cart, ready]);
  const update = (id: string, delta: number) =>
    setCart((old) => {
      const c = { ...old };
      c[id] = Math.max(
        0,
        Math.min(
          20,
          products.find((p) => p.id === id)?.data.stock ?? 20,
          (c[id] || 0) + delta,
        ),
      );
      if (!c[id]) delete c[id];
      return c;
    });
  const cartItems = products.filter((p) => cart[p.id] > 0);
  const total = cartItems.reduce((s, p) => s + price(p) * cart[p.id], 0);
  const filtered = products
    .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) =>
      sort === "low"
        ? price(a) - price(b)
        : sort === "high"
          ? price(b) - price(a)
          : a.title.localeCompare(b.title),
    );
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) {
      location.assign("/login/?next=/store/");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await api("store/orders", "POST", {
        address: new FormData(e.currentTarget).get("address"),
        items: cartItems.map((p) => ({ id: p.id, quantity: cart[p.id] })),
      });
      setRef(r.reference);
      setCart({});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHero
        eyebrow="THE WBF E-STORE"
        title={product ? product.title : "Made by hand. Made with purpose."}
        description="Explore thoughtful, handcrafted pieces. Find something you love and connect with our team."
        compact
      />
      <section className="section container">
        <div className="store-notice">
          <p>
            Choose your favorites and send an inquiry. Our team will confirm
            availability, pricing and delivery before you place an order.
          </p>
          <button className="button secondary" onClick={() => setShow(true)}>
            <ShoppingBag size={18} /> My bag (
            {Object.values(cart).reduce((a, b) => a + b, 0)})
          </button>
        </div>
        {product ? (
          <div className="product-detail">
            <div className="product-placeholder">
              {product.image ? (
                <img src={product.image} alt={product.title} />
              ) : (
                <>
                  <Palette size={70} strokeWidth={0.7} />
                  <span>HANDCRAFTED COLLECTION</span>
                </>
              )}
            </div>
            <div>
              <p className="eyebrow">{product.category}</p>
              <h2>{product.title}</h2>
              <strong className="product-price">{money(price(product))}</strong>
              <p>{product.summary}</p>
              <p>{product.body}</p>
              <button
                className="button"
                disabled={product.data.stock === 0}
                onClick={() => {
                  update(product.id, 1);
                  setShow(true);
                }}
              >
                {product.data.stock === 0 ? "Out of stock" : "Add to bag"}{" "}
                <Plus size={18} />
              </button>
              <p>
                <a href={product.source} target="_blank" rel="noreferrer">
                  View the foundation’s catalog ↗
                </a>
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="listing-toolbar">
              <label className="search-field">
                <Search size={18} />
                <input
                  placeholder="Find something meaningful…"
                  aria-label="Search products"
                  value={q}
                  onChange={(e) => {
                    setQ(e.target.value);
                    setPage(1);
                  }}
                />
              </label>
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="name">Name, A–Z</option>
                <option value="low">Price, low to high</option>
                <option value="high">Price, high to low</option>
              </select>
            </div>
            <div className="store-grid">
              {filtered.slice((page - 1) * 12, page * 12).map((p) => (
                <article className="product-card" key={p.id}>
                  <a
                    href={"/product/?slug=" + p.slug}
                    className="product-placeholder"
                  >
                    {p.image ? (
                      <img src={p.image} alt={p.title} />
                    ) : (
                      <>
                        <Palette size={46} strokeWidth={0.8} />
                        <span>HANDCRAFTED COLLECTION</span>
                      </>
                    )}
                  </a>
                  <div>
                    <a href={"/product/?slug=" + p.slug}>
                      <h3>{p.title}</h3>
                    </a>
                    <strong>{money(price(p))}</strong>
                    <button
                      disabled={p.data.stock === 0}
                      aria-label={
                        p.data.stock === 0
                          ? p.title + " is out of stock"
                          : "Add " + p.title + " to bag"
                      }
                      onClick={() => update(p.id, 1)}
                    >
                      <Plus size={18} />
                    </button>
                    {p.data.stock === 0 && <small>Out of stock</small>}
                    {cart[p.id] > 0 && <small>{cart[p.id]} in your bag</small>}
                  </div>
                </article>
              ))}
            </div>
            {!filtered.length && (
              <Empty title="No products match" text="Try another search." />
            )}
            {filtered.length > 12 && (
              <div className="pagination">
                <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                  Previous
                </button>
                <span>
                  {page} / {Math.ceil(filtered.length / 12)}
                </span>
                <button
                  disabled={page * 12 >= filtered.length}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </section>
      {show && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Shopping bag"
          onClick={() => setShow(false)}
        >
          <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              autoFocus
              onClick={() => setShow(false)}
              aria-label="Close shopping bag"
            >
              <X />
            </button>
            <p className="eyebrow">MADE WITH PURPOSE</p>
            <h2>Your bag</h2>
            {error && <Notice error>{error}</Notice>}
            {ref ? (
              <>
                <Notice>
                  Your inquiry is saved: <strong>{ref}</strong>. Availability,
                  shipping and payment remain to be confirmed. No payment was
                  taken.
                </Notice>
                <ButtonLink href="/user/">View my inquiries</ButtonLink>
              </>
            ) : cartItems.length ? (
              <>
                <div className="cart-items">
                  {cartItems.map((p) => (
                    <div key={p.id}>
                      <div>
                        <h3>{p.title}</h3>
                        <p>{money(price(p))}</p>
                      </div>
                      <div className="quantity">
                        <button
                          onClick={() => update(p.id, -1)}
                          aria-label={"Remove one " + p.title}
                        >
                          <Minus size={14} />
                        </button>
                        <span>{cart[p.id]}</span>
                        <button
                          onClick={() => update(p.id, 1)}
                          aria-label={"Add one " + p.title}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-total">
                  <span>Product subtotal</span>
                  <strong>{money(total)}</strong>
                </div>
                <p className="field-help">
                  Shipping and availability will be confirmed by the team. This
                  is an inquiry, not a paid order.
                </p>
                <form onSubmit={submit}>
                  <Field label="Delivery address" required>
                    <textarea
                      rows={3}
                      name="address"
                      required
                      maxLength={1000}
                    />
                  </Field>
                  <button className="button full" disabled={busy}>
                    {busy
                      ? "Saving…"
                      : user
                        ? "Send product inquiry"
                        : "Sign in to continue"}
                    <ArrowUpRight size={17} />
                  </button>
                </form>
              </>
            ) : (
              <Empty
                title="A little room for possibility"
                text="Add a handcrafted product to start an inquiry."
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
