"use client";
import { useState } from "react";
import {
  Menu,
  X,
  Search,
  User,
  Heart,
  ArrowUpRight,
  ChevronDown,
  Camera,
  Globe2,
  BriefcaseBusiness,
} from "lucide-react";
import { Brand } from "./shared";
import { navigation } from "@/lib/content";
import { useSite } from "./context";
export function Header({ path }: { path: string }) {
  const [open, setOpen] = useState(false);
  const { user, organization: o } = useSite();
  const links =
    o.navigation ||
    navigation.map(([label, href]) => ({ label, href, visible: true }));
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <div className="topline">
        <div className="container">
          <span>Rooted in community. Growing together.</span>
          <div>
            <a href="/our-team/">Our team</a>
            <a href="/resources/">Resources</a>
            <a href="/contact/">
              Contact us <ArrowUpRight size={11} />
            </a>
          </div>
        </div>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav
            className={open ? "main-nav open" : "main-nav"}
            aria-label="Main navigation"
          >
            {links
              .filter((x: any) => x.visible)
              .map(({ label, href }: any) => (
                <div className="nav-item" key={href}>
                  <a
                    className={
                      path === href || (href !== "/" && path.startsWith(href))
                        ? "active"
                        : ""
                    }
                    href={href}
                  >
                    {label}
                  </a>
                  {href === "/about/" && (
                    <div className="nav-dropdown">
                      <a href="/our-approach/">Our approach</a>
                      <a href="/our-team/">Our team</a>
                      <a href="/profile/">Organization profile</a>
                    </div>
                  )}
                  {href === "/get-involved/" && (
                    <div className="nav-dropdown">
                      <a href="/become-a-volunteer/">Volunteer</a>
                      <a href="/internships/">Internships</a>
                      <a href="/careers/">Careers</a>
                      <a href="/csr-partnerships/">CSR partnerships</a>
                      <a href="/store/">Shop with purpose</a>
                    </div>
                  )}
                </div>
              ))}
          </nav>
          <div className="header-actions">
            <a
              className="icon-button search-button"
              href="/search/"
              aria-label="Search website"
            >
              <Search size={19} />
            </a>
            <a
              className="icon-button"
              href={user ? "/user/" : "/login/"}
              aria-label={user ? "My account" : "Sign in"}
            >
              <User size={19} />
            </a>
            <a className="donate-button" href="/donate/">
              Donate <Heart size={15} />
            </a>
            <button
              className="mobile-toggle icon-button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <Menu />}
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
export function Footer() {
  const { organization: o } = useSite();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-main">
          <div className="footer-brand">
            <Brand light />
            <p>{o.footerText}</p>
            <div className="social-links">
              {o.socialInstagram && (
                <a
                  href={o.socialInstagram}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Instagram"
                >
                  <Camera size={18} />
                </a>
              )}
              {o.socialFacebook && (
                <a
                  href={o.socialFacebook}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Facebook"
                >
                  <Globe2 size={18} />
                </a>
              )}
              {o.socialLinkedin && (
                <a
                  href={o.socialLinkedin}
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                >
                  <BriefcaseBusiness size={18} />
                </a>
              )}
            </div>
          </div>
          {footerGroups.map(([title, ...links]) => (
            <div className="footer-column" key={title}>
              <h3>{title}</h3>
              {links.map(([label, href]) => (
                <a href={href} key={href}>
                  {label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Well Being Foundation</span>
          <div>
            <a href="/privacy/">Privacy</a>
            <a href="/terms/">Terms</a>
            <a href="/refund/">Refunds</a>
            <a href="/cookies/">Cookies</a>
            <a href="/accessibility/">Accessibility</a>
            <a href="/admin/">Admin</a>
          </div>
        </div>
        <p className="photo-disclosure">
          Photography is illustrative. Source information: wbfngo.org. This
          independently built preview does not process live payments.
        </p>
      </div>
    </footer>
  );
}
