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
function FooterFoliage({ className }: { className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 240 400"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M115 400C101 324 132 253 138 185S132 81 155 6M121 313 67 267M132 253l61-47M138 182 88 135M139 116l51-54" />
        <path d="M139 110C99 85 118 35 155 6c12 54 7 81-16 104ZM140 170c8-53 42-81 84-94-3 41-40 72-84 94ZM136 231c-54-18-72-54-72-96 48 25 73 55 72 96ZM126 293c28-54 64-70 111-62-24 41-62 59-111 62ZM116 353c-50-19-77-49-80-88 49 13 79 40 80 88ZM121 377c28-43 61-58 102-50-28 35-58 48-102 50Z" />
        <path
          d="m139 109 16-99m-14 157 80-88m-86 150-68-91m61 151 105-55m-119 116-75-81m84 105 96-44M146 73l-19-22m19 23 15-18m-14 79 35-5m-16-15 23-3m-88 76-20-13m28 25 12-12m37 78 41-3m-59 14 20-23m-84 66-19-4m30 14 3-19"
          strokeOpacity=".65"
        />
      </g>
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
      <FooterFoliage className="footer-foliage footer-foliage-left" />
      <FooterFoliage className="footer-foliage footer-foliage-right" />
      <svg
        className="footer-landscape"
        viewBox="0 0 1600 190"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 12C160 36 115 182 300 150S437 128 550 177 735 170 890 165 1163 213 1300 146 1460 37 1600 19V190H0Z"
          fill="#829363"
          fillOpacity=".22"
        />
        <path
          d="M0 76C172 113 190 194 340 172S490 195 660 180 900 140 1060 182 1360 167 1600 89V190H0Z"
          fill="#a8ad77"
          fillOpacity=".16"
        />
        <path
          d="M0 132C135 135 147 185 285 183S520 170 695 189 1040 150 1180 185 1430 129 1600 141V190H0Z"
          fill="#c1be89"
          fillOpacity=".12"
        />
      </svg>
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
            <p className="footer-signoff">
              Stronger Communities
              <br />
              <span>Brighter Futures</span>
            </p>
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
