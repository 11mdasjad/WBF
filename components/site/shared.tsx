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
} from "lucide-react";
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
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <a
      href="/"
      className={"brand " + (light ? "light" : "")}
      aria-label="Well Being Foundation home"
    >
      <svg viewBox="0 0 48 58" aria-hidden="true">
        <path
          d="M24 53V19M24 39L10 30M24 31L36 22M24 45L37 37M24 24L15 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
        />
        <path
          d="M24 18C14 11 19 3 24 1c5 7 6 12 0 17ZM15 22C4 23 3 16 4 11c9 0 12 4 11 11ZM37 26c-2-9 2-13 10-13 0 8-3 12-10 13ZM13 36C2 37 0 31 1 25c10 1 14 5 12 11ZM36 42c-2-9 3-14 11-12 0 8-4 12-11 12ZM15 48C5 49 2 43 3 38c9 0 14 3 12 10ZM32 53c0-8 6-11 13-9-2 7-6 10-13 9Z"
          fill="currentColor"
        />
      </svg>
      <span>
        WBF<small>WELL BEING FOUNDATION</small>
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
      {image && <img src={image} alt="Illustrative community photography" />}
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
}) {
  return (
    <div className="program-grid">
      {items.slice(0, limit).map((p, i) => {
        const Icon = iconMap[p.data.icon] || Sprout;
        return (
          <a className="program-card" href={contentPath(p)} key={p.id}>
            <span className="program-number">0{i + 1}</span>
            <div className="program-icon">
              <Icon size={30} strokeWidth={1.3} />
            </div>
            <h3>{p.title}</h3>
            <p>{p.summary}</p>
            <span className="circle-arrow">
              <ArrowUpRight size={18} />
            </span>
          </a>
        );
      })}
    </div>
  );
}
export function StoryCards({ items }: { items: Entry[] }) {
  return (
    <div className="story-grid">
      {items.map((p) => (
        <article className="story-card" key={p.id}>
          <a href={contentPath(p)} className="story-image">
            <img
              src={p.image || "/images/community.jpg"}
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
  return (
    <section className="cta-band">
      <div className="container cta-inner">
        <div className="cta-symbol">
          <HeartHandshake size={56} strokeWidth={1} />
        </div>
        <div>
          <p className="eyebrow">
            A little of your time. A world of possibility.
          </p>
          <h2>Be part of someone’s tomorrow.</h2>
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
