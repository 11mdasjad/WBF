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
  photographic = false,
  split = false,
}: {
  items: Entry[];
  limit?: number;
  photographic?: boolean;
  split?: boolean;
}) {
  return (
    <div className={"program-grid" + (split ? " work-focus-grid" : photographic ? " focus-photo-grid" : "")}>
      {items.slice(0, limit).map((p, i) => {
        const Icon =
          photographic && p.slug === "women-empowerment"
            ? Users
            : iconMap[p.data.icon] || Sprout;
        if (split) {
          // Reuse only the photographic regions of the existing supplied artwork.
          const crops: Record<string, string> = {
            "education-skill": "226 202 166 155",
            "women-empowerment": "600 202 168 155",
            "health-hygiene": "956 202 110 155",
            "legal-aid-human-rights": "1260 202 340 155",
            environment: "230 536 150 154",
            sports: "630 536 150 154",
            "art-culture-heritage": "956 536 130 154",
            "sustainable-development-goals": "1360 536 150 154",
          };
          return (
            <a className="work-focus-card" href={contentPath(p)} key={p.id} aria-label={"Explore " + p.title}>
              <div className="work-focus-copy">
                <div className="work-focus-card-top">
                  <span className="work-focus-icon"><Icon size={30} strokeWidth={1.5} aria-hidden="true" /></span>
                  <span className="work-focus-number">{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.slug === "health-hygiene" ? "Care with dignity for healthier communities." : p.summary}</p>
                <span className="work-focus-arrow" aria-hidden="true"><ArrowUpRight size={22} /></span>
              </div>
              <div className="work-focus-photo" aria-hidden="true">
                {crops[p.slug] ? (
                  <svg viewBox={crops[p.slug]} preserveAspectRatio="xMidYMid slice">
                    <image href="/images/focus-reference.png" width="1731" height="909" />
                  </svg>
                ) : <img src={p.image} alt="" loading="lazy" />}
              </div>
              <svg className="work-focus-card-wave" viewBox="0 0 200 100" preserveAspectRatio="none" aria-hidden="true">
                <path d="M0 100Q18 37 83 28Q143 18 200 0V100Z" fill="currentColor" fillOpacity=".5" />
                <path d="M35 100Q92 50 200 37V100Z" fill="currentColor" fillOpacity=".3" />
              </svg>
            </a>
          );
        }
        if (photographic) {
          const photos: Record<
            string,
            {
              src: string;
              alt: string;
              crop?: string;
              width?: number;
              height?: number;
            }
          > = {
            "education-skill": {
              src: "youth-education.jpeg",
              alt: "Participants learning practical technical skills at a WBF training centre",
            },
            "women-empowerment": {
              src: "../women-skill-training.jpeg",
              alt: "Women practising sewing skills during a WBF training session",
            },
            "health-hygiene": {
              src: "community-healthcare.jpeg",
              alt: "Healthcare professionals assisting a visitor at a WBF free health check-up camp",
            },
            "legal-aid-human-rights": {
              src: "Screenshot-2026-04-27-at-3.08.50-PM.png",
              alt: "Community legal-awareness meeting with the Well Being Foundation",
              crop: "80 197 640 470",
              width: 796,
              height: 1058,
            },
            environment: {
              src: "Screenshot-2026-04-27-at-3.16.07-PM.png",
              alt: "Participants planting a sapling during a WBF tree-plantation drive",
              crop: "48 146 635 313",
              width: 812,
              height: 1048,
            },
            sports: {
              src: "IMG_5870-3-1024x768.jpeg",
              alt: "A coach briefing young participants at a WBF sports session",
            },
            "art-culture-heritage": {
              src: "ways4.jpg",
              alt: "Children showing their drawings at a community art activity",
            },
            "sustainable-development-goals": {
              src: "from-local-to.jpeg",
              alt: "Community outreach supporting women and families",
            },
          };
          const photo = photos[p.slug];
          const summaries: Record<string, string> = {
            "education-skill":
              "Learning that opens doors to brighter opportunities.",
            "women-empowerment":
              "Confidence. Voice. Independence for a stronger tomorrow.",
            "health-hygiene": "Care with dignity for healthier communities.",
            "legal-aid-human-rights":
              "Rights, awareness and support within everyone’s reach.",
            environment: "A healthier, cleaner and more sustainable tomorrow.",
            sports: "Room to play. Space to grow with confidence.",
            "art-culture-heritage": "Keeping creativity and traditions alive.",
            "sustainable-development-goals":
              "Progress, connected communities and lasting change.",
          };
          return (
            <a
              className="program-card focus-photo-card"
              href={contentPath(p)}
              key={p.id}
              data-focus={p.slug}
              aria-label={"Explore " + p.title}
            >
              <div className="focus-card-photo">
                {photo?.crop ? (
                  <svg
                    viewBox={photo.crop}
                    preserveAspectRatio="xMidYMid slice"
                    role="img"
                    aria-label={photo.alt}
                  >
                    <title>{photo.alt}</title>
                    <image
                      href={`/images/focus/${photo.src}`}
                      width={photo.width}
                      height={photo.height}
                    />
                  </svg>
                ) : (
                  <img
                    src={photo ? `/images/focus/${photo.src}` : p.image}
                    alt={photo?.alt || p.title}
                    loading="lazy"
                  />
                )}
              </div>
              <div className="focus-card-copy">
                <span className="program-icon">
                  <Icon size={29} strokeWidth={1.6} />
                </span>
                <span className="program-number">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3>{p.title}</h3>
                <p>{summaries[p.slug] || p.summary}</p>
                <span className="circle-arrow">
                  <ArrowUpRight size={19} />
                </span>
              </div>
            </a>
          );
        }
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
                      ? "/images/womens-graduation.png"
                      : p.image || "/images/community.jpg"
                  }
                  alt={
                    p.slug === "announcing-2026-womens-skill-graduation"
                      ? "Women celebrating graduation with caps and diplomas"
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
  const titleId = useId();
  return (
    <section className="cta-band" aria-labelledby={titleId}>
      <div className="container cta-inner">
        <div className="cta-symbol" aria-hidden="true">
          <HeartHandshake size={68} strokeWidth={1.2} />
        </div>
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
