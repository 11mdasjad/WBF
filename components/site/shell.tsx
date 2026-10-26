"use client";
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  Search,
  User,
  Heart,
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Home,
  ShoppingBag,
} from "lucide-react";
import { Brand } from "./shared";
import { navigation } from "@/lib/content";
import { useSite } from "./context";

const subnavigation: Record<string, [string, string][]> = {
  "/about/": [
    ["Our story", "/about/"],
    ["Our approach", "/our-approach/"],
    ["Our team", "/our-team/"],
    ["Organization profile", "/profile/"],
    ["Contact us", "/contact/"],
  ],
  "/our-work/": [
    ["Focus areas", "/our-work/"],
    ["Our impact", "/our-impact/"],
    ["Community stories", "/blog/"],
  ],
  "/events/": [
    ["Explore events", "/events/"],
    ["Photos & moments", "/photos/"],
  ],
  "/get-involved/": [
    ["Ways to get involved", "/get-involved/"],
    ["Become a volunteer", "/become-a-volunteer/"],
    ["Internships", "/internships/"],
    ["Careers", "/careers/"],
    ["CSR partnerships", "/csr-partnerships/"],
  ],
  "/resources/": [
    ["Reports & resources", "/resources/"],
    ["News & stories", "/blog/"],
    ["Photo gallery", "/photos/"],
  ],
};
function HeaderSearch({ mobile = false }: { mobile?: boolean }) {
  return (
    <form
      className={"masthead-search" + (mobile ? " mobile-search" : "")}
      action="/search/"
      role="search"
      aria-label={mobile ? "Mobile site search" : "Site search"}
    >
      <button type="submit" aria-label="Search website">
        <Search size={19} />
      </button>
      <input
        name="q"
        aria-label="Search website content"
        placeholder="Search anything…"
        required
        maxLength={120}
      />
    </form>
  );
}
export function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const root = useRef<HTMLElement>(null);
  const { user, organization: o } = useSite();
  const links: { label: string; href: string; visible: boolean }[] =
    o.navigation ||
    navigation.map(([label, href]) => ({ label, href, visible: true }));
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) {
        setExpanded(null);
        setOpen(false);
      }
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (expanded) {
        root.current
          ?.querySelector<HTMLButtonElement>(`[aria-controls="${expanded}"]`)
          ?.focus();
        setExpanded(null);
      } else if (open) {
        setOpen(false);
        root.current
          ?.querySelector<HTMLButtonElement>(".masthead-toggle")
          ?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [expanded, open]);
  const toggle = (id: string) => setExpanded(expanded === id ? null : id);
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="wbf-masthead" ref={root}>
        <div className="masthead-bar">
          <Brand full />
          <nav
            id="wbf-navigation"
            className={"masthead-nav" + (open ? " is-open" : "")}
            aria-label="Main navigation"
          >
            <HeaderSearch mobile />
            {links
              .filter((x) => x.visible && x.href !== "/")
              .map(({ label, href }, i) => {
                const children = subnavigation[href];
                const id = `header-submenu-${i}`;
                const active =
                  path === href ||
                  (href !== "/" && path.startsWith(href)) ||
                  children?.some(([, child]) => child === path) ||
                  (href === "/store/" && path === "/product/");
                return (
                  <div
                    key={href + i}
                    className={
                      "masthead-nav-item" + (active ? " is-active" : "")
                    }
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget))
                        setExpanded((current) =>
                          current === id ? null : current,
                        );
                    }}
                  >
                    <div className="masthead-nav-label">
                      <a
                        href={href}
                        aria-current={path === href ? "page" : undefined}
                      >
                        {href === "/" && <Home size={17} />}
                        {href === "/store/" && <ShoppingBag size={16} />}
                        {label}
                      </a>
                      {children && (
                        <button
                          type="button"
                          aria-label={`${label} submenu`}
                          aria-expanded={expanded === id}
                          aria-controls={id}
                          onClick={() => toggle(id)}
                        >
                          <ChevronDown size={13} />
                        </button>
                      )}
                    </div>
                    {children && (
                      <div
                        id={id}
                        className="masthead-dropdown"
                        hidden={expanded !== id}
                      >
                        {children.map(([title, url]) => (
                          <a
                            key={url}
                            href={url}
                            aria-current={path === url ? "page" : undefined}
                          >
                            {title}
                            <ArrowUpRight size={13} />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
          </nav>
          <div className="masthead-actions">
            <HeaderSearch />
            <a className="masthead-donate" href="/donate/">
              <Heart size={19} />
              <span>
                Donate <span className="donate-now">Now</span>
              </span>
              <ArrowRight size={18} className="donate-arrow" />
            </a>
            <div
              className="masthead-account"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget))
                  setExpanded((current) =>
                    current === "header-account" ? null : current,
                  );
              }}
            >
              <button
                type="button"
                className="masthead-account-button"
                aria-label="Account menu"
                aria-expanded={expanded === "header-account"}
                aria-controls="header-account"
                onClick={() => toggle("header-account")}
              >
                <User size={20} />
                <span>Account</span>
                <ChevronDown size={13} />
              </button>
              <div
                id="header-account"
                className="masthead-dropdown account-dropdown"
                hidden={expanded !== "header-account"}
              >
                <p>
                  {user
                    ? `Hello, ${user.name?.split(" ")[0] || "friend"}`
                    : "Welcome to WBF"}
                </p>
                {user ? (
                  <>
                    <a href="/user/">
                      My dashboard <ArrowUpRight size={13} />
                    </a>
                    {user.permissions?.length > 0 && (
                      <a href="/admin/">
                        Admin dashboard <ArrowUpRight size={13} />
                      </a>
                    )}
                  </>
                ) : (
                  <>
                    <a href="/login/">
                      Sign in <ArrowUpRight size={13} />
                    </a>
                    <a href="/register/">
                      Create an account <ArrowUpRight size={13} />
                    </a>
                  </>
                )}
              </div>
            </div>
            <button
              type="button"
              className="masthead-toggle"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="wbf-navigation"
              onClick={() => {
                setOpen(!open);
                setExpanded(null);
              }}
            >
              {open ? <X size={23} /> : <Menu size={23} />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
const footerGroups = [
  [
    "Explore",
    ["About us", "/about/"],
    ["Our work", "/our-work/"],
    ["Our approach", "/our-approach/"],
    ["Our impact", "/our-impact/"],
    ["Our team", "/our-team/"],
  ],
  [
    "Take part",
    ["Volunteer with us", "/become-a-volunteer/"],
    ["Internships & careers", "/careers/"],
    ["Partner with us", "/csr-partnerships/"],
    ["Donate", "/donate/"],
    ["Shop with purpose", "/store/"],
  ],
  [
    "Stay connected",
    ["News & stories", "/blog/"],
    ["Upcoming events", "/events/"],
    ["Photos & videos", "/photos/"],
    ["Reports & resources", "/resources/"],
    ["Contact us", "/contact/"],
  ],
] as const;
function FooterSocialIcon({
  kind,
}: {
  kind: "instagram" | "facebook" | "linkedin" | "youtube";
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="21"
      height="21"
      aria-hidden="true"
      fill="currentColor"
    >
      {kind === "instagram" && (
        <g fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r=".8" fill="currentColor" stroke="none" />
        </g>
      )}
      {kind === "facebook" && (
        <path d="M14 22v-9h3l.5-4H14V7c0-1.1.3-2 2-2h2V1.4C17.5 1.2 16.2 1 15 1c-3 0-5 1.8-5 5v3H7v4h3v9z" />
      )}
      {kind === "linkedin" && (
        <path d="M3 8h4v13H3zm0-6h4v4H3zm7 6h4v2c1-1.7 2.2-2.3 4-2.3 3 0 4 2 4 5V21h-4v-7c0-2-.5-3-2-3s-2 1-2 3v7h-4z" />
      )}
      {kind === "youtube" && (
        <>
          <rect x="1" y="4" width="22" height="16" rx="5" />
          <path d="m10 8 6 4-6 4z" fill="#e72121" />
        </>
      )}
    </svg>
  );
}
export function Footer() {
  const { organization: o } = useSite();
  const socials = [
    { kind: "instagram" as const, label: "Instagram", href: o.socialInstagram },
    { kind: "facebook" as const, label: "Facebook", href: o.socialFacebook },
    { kind: "linkedin" as const, label: "LinkedIn", href: o.socialLinkedin },
    {
      kind: "youtube" as const,
      label: "YouTube",
      href: o.socialYoutube ?? "https://www.youtube.com/@wbfngo",
    },
  ].filter((s) => s.href);
  return (
    <footer className="site-footer forest-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Brand light />
            <span className="footer-accent" aria-hidden="true" />
            <p>{o.footerText}</p>
            <div
              className="footer-socials"
              aria-label="Follow Well Being Foundation"
            >
              {socials.map((s) => (
                <a
                  href={s.href}
                  key={s.kind}
                  className={"footer-social footer-social-" + s.kind}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label + " (opens in a new tab)"}
                >
                  <FooterSocialIcon kind={s.kind} />
                </a>
              ))}
            </div>
          </div>
          {footerGroups.map(([title, ...links]) => (
            <nav
              className="footer-column"
              key={title}
              aria-label={"Footer: " + title}
            >
              <h3>{title}</h3>
              <span className="footer-accent" aria-hidden="true" />
              {links.map(([label, href]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
            </nav>
          ))}
        </div>
        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} Well Being Foundation. All rights
            reserved.
          </span>
          <nav aria-label="Footer policies">
            <a href="/privacy/">Privacy</a>
            <a href="/terms/">Terms</a>
            <a href="/refund/">Refunds</a>
            <a href="/cookies/">Cookies</a>
            <a href="/accessibility/">Accessibility</a>
            <a href="/admin/">Admin</a>
          </nav>
        </div>
        <p className="photo-disclosure">
          Photography is illustrative. Source information: wbfngo.org. This
          independently built preview does not process live payments.
        </p>
      </div>
    </footer>
  );
}
