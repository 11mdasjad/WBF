"use client";
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
import { useSite } from "./context";
import { authenticPhoto, programPhotos } from "@/lib/photography";
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
  compact = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  image?: string;
  compact?: boolean;
}) {
  return (
    <section
      className={
        "page-hero " + (image ? "with-image " : "") + (compact ? "compact" : "")
      }
    >
      {image && (
        <img
          src={authenticPhoto(image)}
          alt="Community photography"
          fetchPriority="high"
        />
      )}
      <div className="container">
        <div className="breadcrumbs">
          <a href="/">Home</a>
          <span>/</span>
          <span>{eyebrow || title}</span>
        </div>
        <p className="eyebrow">{eyebrow || "Well Being Foundation"}</p>
        <h1>{title}</h1>
        {description && <p className="hero-description">{description}</p>}
      </div>
    </section>
  );
}
export function ProgramGrid({
  items,
  limit,
}: {
  items: Entry[];
  limit?: number;
  photographic?: boolean;
  split?: boolean;
}) {
  return (
    <div className="documentary-grid">
      {items.slice(0, limit).map((p, i) => {
        const photo = programPhotos[p.slug];
        return (
          <a
            className="documentary-card"
            href={contentPath(p)}
            key={p.id}
            aria-label={"Explore " + p.title}
          >
            <div className="documentary-photo">
              {photo?.crop ? (
                <svg
                  viewBox={photo.crop}
                  preserveAspectRatio="xMidYMid slice"
                  role="img"
                  aria-label={photo.alt}
                >
                  <title>{photo.alt}</title>
                  <image
                    href={photo.src}
                    width={photo.width}
                    height={photo.height}
                  />
                </svg>
              ) : (
                <img
                  src={photo?.src || authenticPhoto(p.image)}
                  alt={photo?.alt || p.title}
                  loading="lazy"
                />
              )}
            </div>
            <div className="documentary-copy">
              <span className="documentary-number">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <span className="documentary-link">
                Explore this work <ArrowRight size={17} aria-hidden="true" />
              </span>
            </div>
          </a>
        );
      })}
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
    <section className="cta-band" aria-labelledby={titleId}>
      <div className="container cta-inner">
        <div className="cta-copy">
          <p className="eyebrow">
            A little of your time. A world of possibility.
          </p>
          <h2 id={titleId}>Be part of someone’s tomorrow.</h2>
          <p>
            Bring your skills, your compassion, and your belief in a better
            future.
          </p>
        </div>
        <ButtonLink href="/become-a-volunteer/" light>
          Join our community
        </ButtonLink>
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
      <Sprout size={35} strokeWidth={1.2} />
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
