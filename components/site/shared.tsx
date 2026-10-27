"use client";
import { pageBanner } from "@/lib/page-banners";
import { useId, cloneElement, isValidElement } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  BookOpen,
  HeartHandshake,
  HeartPulse,
  Scale,
  Sprout,
  Trophy,
  Palette,
  Globe2,
  MapPin,
  CalendarDays,
  Check,
  Leaf,
  Users,
  Mail,
  Phone,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { authenticPhoto, programPhotos } from "@/lib/photography";
import { useSite } from "./context";
import { contentPath, niceDate, type Entry } from "@/lib/content";
export const iconMap: Record<string, any> = {
  BookOpen,
  HeartHandshake,
  HeartPulse,
  Scale,
  Sprout,
  Trophy,
  Palette,
  Globe2,
  Users,
  Leaf,
  Heart,
};
export function Brand({
  light = false,
  full = false,
}: {
  light?: boolean;
  full?: boolean;
}) {
  return (
    <a
      href="/"
      className={
        "brand official-brand" +
        (light ? " light" : "") +
        (full ? " brand-full" : "")
      }
      aria-label="Well Being Foundation home"
    >
      <img src="/brand/wbf-logo.png" width="88" height="88" alt="" />
      <span className="brand-wordmark">
        {full && (
          <span className="brand-classification">
            Non profitable organization
          </span>
        )}
        <strong>WBF</strong>
        <small>Well Being Foundation</small>
        {full && (
          <span className="brand-tagline">
            People <i>•</i> Community <i>•</i> Change
          </span>
        )}
      </span>
    </a>
  );
}
export function ButtonLink({
  href,
  children,
  secondary = false,
  light = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
  light?: boolean;
}) {
  return (
    <a
      className={
        "button " + (secondary ? "secondary " : "") + (light ? "light " : "")
      }
      href={href}
    >
      {children}
      <ArrowUpRight size={17} />
    </a>
  );
}
export function SectionTitle({
  label,
  title,
  description,
  link,
  href,
}: {
  label: string;
  title: string;
  description?: string;
  link?: string;
  href?: string;
}) {
  return (
    <div className="section-title">
      <div>
        <p className="eyebrow">{label}</p>
        <h2>{title}</h2>
        {description && (
          <p className="muted section-description">{description}</p>
        )}
      </div>
      {link && href && (
        <a className="text-link" href={href}>
          {link}
          <ArrowUpRight size={18} />
        </a>
      )}
    </div>
  );
}
export function PageHero({
  eyebrow,
  title,
  description,
  image,
  imageAlt,
  compact = false,
  layout = "image-first",
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  imageAlt?: string;
  compact?: boolean;
  layout?: "overlay" | "image-first";
  children?: React.ReactNode;
}) {
  const { path } = useSite();
  const fallback = pageBanner(path);
  const photo = authenticPhoto(image, fallback.image);
  const headingId = useId();
  return (
    <section
      className={
        "page-hero with-image" +
        (compact ? " compact" : "") +
        (layout === "image-first" ? " image-first" : "")
      }
      aria-labelledby={headingId}
    >
      <img
        className="page-hero-photo"
        src={photo}
        alt={
          imageAlt || (image ? "Community programme photograph" : fallback.alt)
        }
        fetchPriority="high"
        onError={(event) => {
          if (event.currentTarget.getAttribute("src") !== fallback.image)
            event.currentTarget.src = fallback.image;
        }}
      />
      <div className="page-hero-shade" aria-hidden="true" />
      <div className="container page-hero-inner">
        <div className="page-hero-copy">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{eyebrow || title}</span>
          </nav>
          <p className="eyebrow">{eyebrow || "Well Being Foundation"}</p>
          <h1 id={headingId}>{title}</h1>
          {description && <p className="hero-description">{description}</p>}
          {children && <div className="page-hero-extras">{children}</div>}
        </div>
      </div>
    </section>
  );
}
function ProgramPhoto({ slug, fallback }: { slug: string; fallback?: string }) {
  const photo = programPhotos[slug];
  return photo?.crop ? (
    <svg
      viewBox={photo.crop}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={photo.alt}
    >
      <title>{photo.alt}</title>
      <image href={photo.src} width={photo.width} height={photo.height} />
    </svg>
  ) : (
    <img
      src={photo?.src || authenticPhoto(fallback)}
      alt={photo?.alt || "Community programme photograph"}
      loading="lazy"
    />
  );
}
export function ProgramGrid({
  items,
  limit,
  split = false,
}: {
  items: Entry[];
  limit?: number;
  photographic?: boolean;
  split?: boolean;
}) {
  return (
    <div
      className={
        "program-grid " + (split ? "work-focus-grid" : "focus-photo-grid")
      }
    >
      {items.slice(0, limit).map((p, i) => (
        <a
          data-program-card
          className={
            split ? "work-focus-card" : "program-card focus-photo-card"
          }
          href={contentPath(p)}
          key={p.id}
          aria-label={"Explore " + p.title}
        >
          <div className={split ? "work-focus-photo" : "focus-card-photo"}>
            <ProgramPhoto slug={p.slug} fallback={p.image} />
          </div>
          <div className={split ? "work-focus-copy" : "focus-card-copy"}>
            <span className={split ? "work-focus-number" : "program-number"}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{p.title}</h3>
            <p>{p.summary}</p>
            <span
              className={split ? "work-focus-arrow" : "circle-arrow"}
              aria-hidden="true"
            >
              <ArrowUpRight size={19} />
            </span>
          </div>
        </a>
      ))}
    </div>
  );
}
export function StoryCards({
  items,
  editorial = false,
}: {
  items: Entry[];
  editorial?: boolean;
}) {
  if (editorial)
    return (
      <div className="news-photo-grid">
        {items.map((p) => {
          const category = (p.category || "Community").toLowerCase();
          const Icon = category.includes("environment")
            ? Leaf
            : category.includes("education")
              ? BookOpen
              : Users;
          const theme = category.includes("empower")
            ? "empowerment"
            : category.includes("education")
              ? "education"
              : "environment";
          return (
            <article
              className="story-card news-photo-card"
              data-theme={theme}
              key={p.id}
            >
              <a
                className="news-photo"
                href={contentPath(p)}
                aria-label={"Read " + p.title}
              >
                <img
                  src={
                    p.slug === "announcing-2026-womens-skill-graduation"
                      ? "/images/women-skill-training.jpeg"
                      : p.image || "/images/community.jpg"
                  }
                  alt={
                    p.slug === "announcing-2026-womens-skill-graduation"
                      ? "Women practising sewing at a WBF skills session"
                      : ""
                  }
                  loading="lazy"
                />
                <span className="news-category">
                  <Icon size={15} strokeWidth={1.8} />
                  {p.category || "Community"}
                </span>
                {p.published_at && (
                  <time dateTime={p.published_at}>
                    {niceDate(p.published_at)}
                  </time>
                )}
              </a>
              <div className="news-card-copy">
                <h3>
                  <a href={contentPath(p)}>{p.title}</a>
                </h3>
                <p>{p.summary}</p>
                <a
                  className="news-read"
                  href={contentPath(p)}
                  aria-label={"Read the story: " + p.title}
                >
                  <span>
                    Read the story <ArrowUpRight size={16} />
                  </span>
                  <span className="news-next">
                    <ChevronRight size={20} />
                  </span>
                </a>
              </div>
            </article>
          );
        })}
      </div>
    );

  return (
    <div className="story-grid">
      {items.map((p) => (
        <article className="story-card" key={p.id}>
          <a href={contentPath(p)} className="story-image">
            <img
              src={authenticPhoto(p.image)}
              alt={
                p.kind === "post"
                  ? "Illustrative photograph for " + p.category
                  : p.title
              }
              loading="lazy"
            />
            <span className="photo-label">Illustrative photography</span>
          </a>
          <div className="story-body">
            <div className="meta">
              <span>{p.category || "Community"}</span>
              <span>{niceDate(p.published_at)}</span>
            </div>
            <h3>
              <a href={contentPath(p)}>{p.title}</a>
            </h3>
            <p>{p.summary}</p>
            <a className="text-link" href={contentPath(p)}>
              Read the story
              <ArrowUpRight size={16} />
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}
export function CTABand() {
  const titleId = useId();
  return (
    <section className="community-callout" aria-labelledby={titleId}>
      <div className="container community-callout-card">
        <div className="community-callout-copy">
          <p className="eyebrow">
            A LITTLE OF YOUR TIME. A WORLD OF POSSIBILITY.
          </p>
          <h2 id={titleId}>
            Be part of someone’s <span>tomorrow.</span>
          </h2>
          <p className="community-callout-description">
            Bring your skills, your compassion, and your belief in a better
            future.
          </p>
          <nav
            className="community-callout-paths"
            aria-label="Ways to contribute"
          >
            <a href="/become-a-volunteer/">
              Give your time <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href="/volunteering-internships/">
              Share your skills <ArrowUpRight size={16} aria-hidden="true" />
            </a>
            <a href="/csr-partnerships/">
              Partner with us <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </nav>
        </div>
        <div className="community-callout-action">
          <p className="community-callout-kicker">LET’S MAKE A DIFFERENCE</p>
          <h3>It starts with you.</h3>
          <p>Discover how you can contribute to the work we do together.</p>
          <ButtonLink href="/become-a-volunteer/" light>
            Join our community
          </ButtonLink>
          <a className="community-callout-contact" href="/contact/">
            Have a question? Let’s talk{" "}
            <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
export function Empty({
  title = "More to come",
  text = "Updates will appear here as soon as they are published.",
  href,
  label,
}: {
  title?: string;
  text?: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{text}</p>
      {href && (
        <ButtonLink href={href} secondary>
          {label || "Get in touch"}
        </ButtonLink>
      )}
    </div>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: React.ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={"notice " + (error ? "error" : "")}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  );
}
export function Loading() {
  return (
    <div className="loading" role="status">
      <span className="spinner" />
      Loading…
    </div>
  );
}
export function ContactDetails() {
  const { organization: o } = useSite();
  return (
    <div className="contact-details">
      <div>
        <MapPin />
        <p>
          <strong>Visit our office</strong>
          {o.address}
        </p>
      </div>
      <div>
        <Phone />
        <p>
          <strong>Give us a call</strong>
          <a href={"tel:" + o.phone.replace(/\s/g, "")}>{o.phone}</a>
          <a href={"tel:" + o.phone2.replace(/\s/g, "")}>{o.phone2}</a>
        </p>
      </div>
      <div>
        <Mail />
        <p>
          <strong>Write to us</strong>
          <a href={"mailto:" + o.email}>{o.email}</a>
        </p>
      </div>
      <div>
        <CalendarDays />
        <p>
          <strong>Office hours</strong>
          {o.hours}
        </p>
      </div>
    </div>
  );
}
export function Status({ status }: { status: string }) {
  return (
    <span className={"status status-" + status}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
export function Field({
  label,
  name,
  type = "text",
  required = false,
  value,
  onChange,
  placeholder,
  children,
  ...props
}: any) {
  const generatedId = useId();
  const controlId = props.id || generatedId;
  const labelId = controlId + "-label";
  return (
    <div className="field">
      <label id={labelId} htmlFor={controlId}>
        {label}
        {required && <em aria-hidden="true"> *</em>}
      </label>
      {isValidElement(children) ? (
        cloneElement(children as any, {
          id: controlId,
          "aria-labelledby": labelId,
          ...(required ? { required: true } : {}),
        })
      ) : (
        <input
          id={controlId}
          aria-labelledby={labelId}
          name={name}
          type={type}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          {...props}
        />
      )}
    </div>
  );
}
