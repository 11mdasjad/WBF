"use client";
import { useState } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  Download,
  MapPin,
  CalendarDays,
  Clock,
  Search,
  Leaf,
  Sprout,
  HeartHandshake,
  ShieldCheck,
  BookOpen,
  HeartPulse,
  Users,
  Mail,
  Play,
  CheckCircle2,
  FileText,
  X,
} from "lucide-react";
import { useSite } from "./context";
import {
  PageHero,
  SectionTitle,
  ProgramGrid,
  StoryCards,
  ButtonLink,
  CTABand,
  Empty,
  ContactDetails,
  Notice,
} from "./shared";
import { ContactForm } from "../forms/contact";
import { ApplicationForm } from "../forms/application";
import { niceDate, contentPath, type Entry, routeTitles } from "@/lib/content";
export function About() {
  const { organization: o } = useSite();
  return (
    <>
      <section className="our-story-hero" aria-labelledby="our-story-title">
        <div className="our-story-visual" aria-hidden="true">
          <img
            src="/images/community.jpg"
            alt="Children gathered for a group activity — illustrative photograph"
            loading="lazy"
          />
        </div>
        <div className="our-story-panel" aria-hidden="true" />
        <div className="container our-story-content">
          <nav className="our-story-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Our Story</span>
          </nav>
          <p className="our-story-eyebrow">
            OUR STORY <span />
          </p>
          <h1 id="our-story-title">
            People at the heart
            <br />
            <em>of change.</em>
          </h1>

          <p className="our-story-description">
            A shared belief in dignity. A commitment to work alongside
            communities.
          </p>
        </div>
      </section>
      <section className="about-purpose-section">
        <div className="container intro-section about-purpose-grid">
          <div className="intro-copy">
            <p className="eyebrow">
              ROOTED IN PURPOSE <span />
            </p>
            <h2>
              Opportunity grows
              <br />
              when we grow <em>together.</em>
            </h2>
            <p className="lead">{o.about}</p>
            <p>
              Our work brings education, health, livelihoods, rights, and the
              environment into one connected view of well-being. People and
              their priorities remain at the centre.
            </p>
            <p className="field-help">
              {o.registration}{" "}
              <a
                href="https://wbfngo.org/about/"
                target="_blank"
                rel="noreferrer"
              >
                View source ↗
              </a>
            </p>
            <ButtonLink href="/profile/">
              Read our organization profile
            </ButtonLink>
          </div>
          <div className="about-purpose-art">
            <img
              src="/images/women-skill-training.jpeg"
              alt="Women practising sewing at a WBF skills session"
              loading="lazy"
            />
          </div>
        </div>
      </section>
      <section className="values-band about-purpose-values">
        <div className="container values-grid">
          {[
            [Leaf, "Our mission", o.mission],
            [BookOpen, "Our vision", o.vision],
            [
              HeartHandshake,
              "Our values",
              "Dignity, inclusion, participation, collaboration and care for our shared future.",
            ],
          ].map(([Icon, title, text]: any) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section
        className="about-journey-section"
        aria-labelledby="about-journey-heading"
      >
        <div className="container">
          <div className="about-journey-heading">
            <p className="eyebrow">
              LOOKING BACK. MOVING FORWARD. <span />
            </p>
            <h2 id="about-journey-heading">
              A foundation built
              <br />
              on <em>participation.</em>
            </h2>
          </div>
          <ol className="about-journey-milestones">
            {[
              {
                date: "2015",
                title: "A formal beginning",
                text: "The foundation publishes its registration date as 1 June 2015.",
                Icon: BookOpen,
              },
              {
                date: "Today",
                title: "Connected areas of work",
                text: "Eight focus areas connect learning, well-being and sustainable development.",
                Icon: Sprout,
              },
              {
                date: "Together",
                title: "The next chapter",
                text: "Volunteers, communities and partners help shape what comes next.",
                Icon: Users,
              },
            ].map(({ date, title, text, Icon }) => (
              <li key={date}>
                <span className="journey-dot" aria-hidden="true" />
                <p className="journey-date">{date}</p>

                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section
        className="about-journey-invitation"
        aria-labelledby="journey-invitation-title"
      >
        <div className="container">
          <div className="journey-invitation-copy">
            <p className="eyebrow">
              A LITTLE OF YOUR TIME. A WORLD OF POSSIBILITY.
            </p>
            <h2 id="journey-invitation-title">
              Be part of someone’s tomorrow.
            </h2>
            <p>
              Bring your skills, your compassion, and your belief in a better
              future.
            </p>
          </div>
          <ButtonLink href="/become-a-volunteer/">
            Join our community
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
export function Work() {
  const { content } = useSite();
  return (
    <>
      <section className="work-hero" aria-labelledby="work-hero-title">
        <img
          className="work-hero-photo"
          src="/images/education.jpg"
          alt="Students writing in their notebooks in a classroom — illustrative photograph"
          fetchPriority="high"
        />
        <div className="work-hero-shade" aria-hidden="true" />

        <div className="container work-hero-content">
          <nav className="work-hero-breadcrumb" aria-label="Breadcrumb">
            <a href="/">Home</a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Our Work</span>
          </nav>
          <p className="work-hero-eyebrow">
            OUR WORK <span />
          </p>
          <h1 id="work-hero-title">
            Many ways to make
            <br />a <em>difference.</em>
          </h1>
          <p className="work-hero-description">
            Eight connected focus areas. Practical action. People at the centre.
          </p>
          <ul className="work-hero-pillars" aria-label="Our work at a glance">
            {[
              {
                Icon: BookOpen,
                title: "Education",
                detail: "Brighter futures",
              },
              {
                Icon: HeartPulse,
                title: "Health",
                detail: "Stronger communities",
              },
              {
                Icon: Sprout,
                title: "Livelihood",
                detail: "Sustainable change",
              },
            ].map(({ Icon, title, detail }) => (
              <li key={title}>
                <span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
              </li>
            ))}
          </ul>
          <a className="work-hero-button" href="#work-focus-areas">
            Explore Our Work <ArrowRight size={22} aria-hidden="true" />
          </a>
        </div>
      </section>
      <section
        className="section work-focus-areas"
        id="work-focus-areas"
        aria-labelledby="work-focus-title"
      >
        <div className="work-focus-heading">
          <div className="work-focus-intro">
            <p className="eyebrow">OUR FOCUS AREAS</p>
            <h2 id="work-focus-title">
              A more complete picture
              <br />
              of <em>well-being.</em>
            </h2>
            <p className="work-focus-description">
              Learning, health, rights, culture and the environment all shape a
              community’s future.
            </p>
          </div>
        </div>
        <ProgramGrid
          items={content.filter((x) => x.kind === "program")}
          split
        />
      </section>
      <CTABand />
    </>
  );
}
export function Approach() {
  return (
    <>
      <PageHero
        eyebrow="OUR APPROACH"
        title="With people. For lasting change."
        description="Listen first. Build together. Learn as we go."
        image="/images/community.jpg"
      />
      <section className="section container approach-layout">
        <div>
          <p className="eyebrow">COMMUNITY COMES FIRST</p>
          <h2>
            Good work begins
            <br />
            with a good
            <br />
            <em>conversation.</em>
          </h2>
          <p>
            Local priorities shape meaningful action. WBF’s published approach
            connects participation, collaboration and sustainable development.
          </p>
          <img
            src="/images/volunteering.jpg"
            alt="Hands joined in collaboration — illustrative photograph"
          />
        </div>
        <div className="approach-steps">
          {[
            [
              "Listen",
              "Understand people’s priorities through conversation and local knowledge.",
            ],
            [
              "Co-create",
              "Bring communities, volunteers and partners into planning practical responses.",
            ],
            [
              "Act",
              "Connect skills and resources to community activities with care and dignity.",
            ],
            [
              "Learn & strengthen",
              "Review progress, listen to feedback and use what we learn to improve the work.",
            ],
          ].map(([title, text], i) => (
            <div key={title}>
              <span>0{i + 1}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <CTABand />
    </>
  );
}
export function Impact() {
  const { content } = useSite();
  const metrics = content.filter((x) => x.kind === "metric"),
    reports = content.filter((x) => x.kind === "report");
  return (
    <>
      <PageHero
        eyebrow="OUR IMPACT"
        title="People. Progress. Possibility."
        description="Looking at the work through the communities it serves, and the evidence behind it."
        image="/images/environment.jpg"
      />
      <section className="section container">
        <SectionTitle
          label="ACCOUNTABILITY MATTERS"
          title="Meaningful change deserves a clear picture."
          description="We share published updates and make space for transparent reporting."
        />
        {metrics.length ? (
          <div className="metric-grid">
            {metrics.map((m) => (
              <div key={m.id}>
                <strong>{m.data.value}</strong>
                <h3>{m.title}</h3>
                <p>{m.data.period}</p>
                <a href={m.source} target="_blank" rel="noreferrer">
                  View data source ↗
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="impact-note">
            <ShieldCheck size={38} strokeWidth={1.2} />
            <div>
              <h3>Evidence before numbers.</h3>
              <p>
                The reference website’s headline figures are inconsistent. We’re
                reserving this space for dated, sourced impact measures approved
                by the foundation.
              </p>
            </div>
            <a className="text-link" href="/contact/">
              Request information <ArrowUpRight size={16} />
            </a>
          </div>
        )}
      </section>
      <section className="section container tight-top">
        <SectionTitle
          label="FROM THE FOUNDATION"
          title="Updates from the work."
        />
        <StoryCards
          items={content.filter((x) => x.kind === "post").slice(0, 3)}
        />
      </section>
      <section className="section resources-background">
        <div className="container">
          <SectionTitle
            label="OPEN & ACCOUNTABLE"
            title="Reports & publications."
            link="All resources"
            href="/resources/"
          />
          {reports.length ? (
            <DocumentList items={reports} />
          ) : (
            <Empty
              title="Reports will be published here"
              text="No annual or financial reports were available in the reference’s report listings at the time of review."
              href="/contact/"
              label="Request a report"
            />
          )}
        </div>
      </section>
    </>
  );
}
export function Team() {
  const { content } = useSite();
  const [group, setGroup] = useState("All");
  const people = content.filter((x) => x.kind === "team"),
    groups = ["All", ...new Set(people.map((x) => x.data.group || "Team"))];
  return (
    <>
      <PageHero
        eyebrow="OUR PEOPLE"
        title="Purpose brings us together."
        description="Meet the people listed by the foundation, working together for a more inclusive future."
        image="/images/volunteering.jpg"
      />
      <section className="section container">
        <div className="filter-tabs">
          {groups.map((g) => (
            <button
              className={g === group ? "active" : ""}
              onClick={() => setGroup(g)}
              key={g}
            >
              {g}
            </button>
          ))}
        </div>
        <div className="team-grid">
          {people
            .filter(
              (p) => group === "All" || (p.data.group || "Team") === group,
            )
            .map((p) => (
              <article className="team-card" key={p.id}>
                {p.image ? (
                  <img src={p.image} alt={p.title} />
                ) : (
                  <div className="team-monogram">
                    <span>
                      {p.title
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                )}
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.summary}</p>
                  {p.body && <p>{p.body}</p>}
                  {p.data.url && (
                    <a href={p.data.url} target="_blank" rel="noreferrer">
                      View profile ↗
                    </a>
                  )}
                </div>
              </article>
            ))}
        </div>
        <p className="field-help">
          Names and roles reflect the{" "}
          <a
            href="https://wbfngo.org/our-team/"
            target="_blank"
            rel="noreferrer"
          >
            public WBF team page
          </a>
          . Portraits are withheld where reuse permission is unavailable.
        </p>
      </section>
      <CTABand />
    </>
  );
}
export function Involved({ internships = false }: { internships?: boolean }) {
  return (
    <>
      <PageHero
        eyebrow={internships ? "INTERNSHIPS" : "GET INVOLVED"}
        title={
          internships
            ? "Learn with purpose. Grow through action."
            : "There’s a place for you here."
        }
        description="Bring your time, your skills, and your belief in a better tomorrow."
        image="/images/volunteering.jpg"
      />
      <section className="section container">
        <div className="opportunity-grid">
          {[
            [
              HeartHandshake,
              "Volunteer",
              "Offer your time and skills to community-focused work.",
              "/become-a-volunteer/",
            ],
            [
              BookOpen,
              "Internships",
              "Learn through practical experience and shared purpose.",
              "/internships/apply/",
            ],
            [
              Users,
              "Careers",
              "Build a career connected to people and possibility.",
              "/careers/",
            ],
            [
              Leaf,
              "Partner with us",
              "Explore a thoughtful collaboration with your organization.",
              "/csr-partnerships/",
            ],
          ].map(([Icon, title, text, href]: any) => (
            <a className="opportunity-card" href={href} key={title}>
              <Icon size={32} strokeWidth={1.3} />
              <h2>{title}</h2>
              <p>{text}</p>
              <span className="text-link">
                Explore opportunities <ArrowUpRight size={18} />
              </span>
            </a>
          ))}
        </div>
      </section>
      <CTABand />
    </>
  );
}
export function Contact({ partnership = false }: { partnership?: boolean }) {
  return (
    <>
      <PageHero
        eyebrow={partnership ? "PARTNER WITH US" : "CONTACT US"}
        title={
          partnership
            ? "Shared purpose. Greater possibility."
            : "Good things start with a conversation."
        }
        description={
          partnership
            ? "Let’s explore a collaboration rooted in community priorities."
            : "Questions, ideas, or a willingness to help. We’re here to listen."
        }
        compact
      />
      <section className="section container contact-layout">
        <div>
          <h2>
            {partnership ? "Build something meaningful." : "Come say hello."}
          </h2>
          {partnership && (
            <p>
              Tell us about your organization, your areas of interest, and how
              you’d like to contribute. The team can discuss a suitable approach
              with you.
            </p>
          )}
          <ContactDetails />
          <a
            href="https://www.google.com/maps/search/?api=1&query=White+House+Business+Tower+Khizrabad+New+Delhi"
            className="map-link"
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={24} />
            <span>
              Find our New Delhi office<small>Open in Google Maps</small>
            </span>
            <ArrowUpRight size={20} />
          </a>
        </div>
        <ContactForm
          partnership={partnership}
          subject={partnership ? "Partnership inquiry" : ""}
        />
      </section>
    </>
  );
}
export function Listings({ kind }: { kind: string }) {
  const { content } = useSite();
  const [q, setQ] = useState(""),
    [filter, setFilter] = useState(kind === "event" ? "Upcoming" : "All"),
    [page, setPage] = useState(1);
  const items = content.filter((x) => x.kind === kind);
  const cats =
    kind === "event"
      ? ["Upcoming", "Past", "All"]
      : ["All", ...new Set(items.map((x) => x.category).filter(Boolean))];
  const filtered = items
    .filter((x) =>
      (x.title + " " + x.summary).toLowerCase().includes(q.toLowerCase()),
    )
    .filter((x) =>
      kind === "event"
        ? filter === "All" ||
          (filter === "Upcoming"
            ? new Date(x.data.end).getTime() >= Date.now()
            : new Date(x.data.end).getTime() < Date.now())
        : filter === "All" || x.category === filter,
    )
    .sort((a, b) =>
      kind === "event"
        ? new Date(a.data.start).getTime() - new Date(b.data.start).getTime()
        : 0,
    );
  const paged = filtered.slice((page - 1) * 6, page * 6);
  return (
    <>
      <PageHero
        eyebrow={
          kind === "event"
            ? "COME TOGETHER"
            : kind === "job"
              ? "WORK WITH PURPOSE"
              : "NEWS & STORIES"
        }
        title={
          kind === "event"
            ? "Make a little time for community."
            : kind === "job"
              ? "Meaningful work starts with you."
              : "Stories worth sharing."
        }
        description={
          kind === "job"
            ? "Explore roles published by WBF. Confirm current availability with the team."
            : "Ideas, activities and updates that bring our shared purpose to life."
        }
        image={kind === "event" ? "/images/community.jpg" : undefined}
        compact={kind !== "event"}
      />
      <section className="section container">
        <div className="listing-toolbar">
          <div className="filter-tabs">
            {cats.map((c) => (
              <button
                key={c}
                className={filter === c ? "active" : ""}
                onClick={() => {
                  setFilter(c);
                  setPage(1);
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <label className="search-field">
            <Search size={18} />
            <input
              aria-label="Search listings"
              placeholder="Search…"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
            />
          </label>
        </div>
        {paged.length ? (
          kind === "post" ? (
            <StoryCards items={paged} />
          ) : (
            <div className="event-list">
              {paged.map((p) => (
                <article className="event-card" key={p.id}>
                  {kind === "event" ? (
                    <div className="date-tile">
                      <strong>{new Date(p.data.start).getDate()}</strong>
                      <span>
                        {new Date(p.data.start).toLocaleDateString("en-IN", {
                          month: "short",
                        })}
                      </span>
                    </div>
                  ) : (
                    <div className="job-icon">
                      <BookOpen size={25} />
                    </div>
                  )}
                  <div className="event-info">
                    <p className="eyebrow">{p.category}</p>
                    <h3>
                      <a href={contentPath(p)}>{p.title}</a>
                    </h3>
                    <p>{p.summary}</p>
                    <div className="event-meta">
                      <span>
                        <MapPin size={14} />
                        {p.data.location || "Contact for details"}
                      </span>
                      {kind === "event" ? (
                        <span>
                          <Clock size={14} />
                          {niceDate(p.data.start)} – {niceDate(p.data.end)}
                        </span>
                      ) : (
                        <span>{p.data.employmentType}</span>
                      )}
                    </div>
                  </div>
                  <ButtonLink href={contentPath(p)} secondary>
                    {kind === "job" ? "View role" : "View event"}
                  </ButtonLink>
                </article>
              ))}
            </div>
          )
        ) : (
          <Empty
            title="No matches yet"
            text="Try a different search or check back for new updates."
          />
        )}
        {filtered.length > 6 && (
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(filtered.length / 6)}
            </span>
            <button
              disabled={page * 6 >= filtered.length}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        )}
      </section>
    </>
  );
}
export function Detail({ item }: { item: Entry }) {
  const { content } = useSite();
  const [apply, setApply] = useState(false),
    [share, setShare] = useState("");
  const event = item.kind === "event",
    job = item.kind === "job",
    program = item.kind === "program";
  return (
    <>
      <PageHero
        eyebrow={item.category || item.kind}
        title={item.title}
        description={item.summary}
        image={item.image || undefined}
      />
      <section className="section container detail-layout">
        <article className="prose">
          <p className="eyebrow">
            {program
              ? "OUR FOCUS"
              : event
                ? "EVENT DETAILS"
                : job
                  ? "OPPORTUNITY"
                  : niceDate(item.published_at)}
          </p>
          {item.body.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {event && (
            <div className="event-facts">
              <p>
                <CalendarDays size={19} />
                <span>
                  {niceDate(item.data.start)} – {niceDate(item.data.end)}
                </span>
              </p>
              <p>
                <Clock size={19} />
                <span>
                  {new Date(item.data.start).toLocaleTimeString("en-IN", {
                    hour: "numeric",
                    minute: "2-digit",
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  IST
                </span>
              </p>
              <p>
                <MapPin size={19} />
                {item.data.location}
              </p>
            </div>
          )}
          {item.source && (
            <a
              className="text-link"
              href={item.source}
              target="_blank"
              rel="noreferrer"
            >
              View the foundation’s source <ArrowUpRight size={16} />
            </a>
          )}
          {!program && (
            <button
              className="button secondary share-button"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(location.href);
                  setShare("Link copied");
                } catch {
                  setShare("Copy this page’s address from your browser.");
                }
              }}
            >
              {share || "Copy page link"}
            </button>
          )}
        </article>
        <aside className="detail-aside">
          <HeartHandshake size={32} strokeWidth={1.2} />
          <h3>
            {event
              ? "Be part of the day."
              : job
                ? "Bring your experience."
                : "Be part of the change."}
          </h3>
          <p>
            {event
              ? "Register your interest. The team will confirm attendance details."
              : job
                ? "Share your interests and availability with the team."
                : "Your time and care can help turn possibility into progress."}
          </p>
          {event || job ? (
            <button
              className="button"
              onClick={() => setApply(!apply)}
              disabled={event && new Date(item.data.end).getTime() < Date.now()}
            >
              {event && new Date(item.data.end).getTime() < Date.now()
                ? "Registration closed"
                : apply
                  ? "Close application"
                  : "Apply / register interest"}
              <ArrowUpRight size={16} />
            </button>
          ) : (
            <ButtonLink href="/become-a-volunteer/">Get involved</ButtonLink>
          )}
        </aside>
      </section>
      {apply && (
        <section className="section container tight-top">
          <ApplicationForm kind={event ? "event" : "job"} opportunity={item} />
        </section>
      )}
      {program && (
        <section className="section container tight-top">
          <SectionTitle
            label="CONNECTED WORK"
            title="Explore another focus area."
          />
          <ProgramGrid
            items={content
              .filter((x) => x.kind === "program" && x.id !== item.id)
              .slice(0, 4)}
          />
        </section>
      )}
      <CTABand />
    </>
  );
}
export function DocumentList({ items }: { items: Entry[] }) {
  return (
    <div className="document-grid">
      {items.map((d) => (
        <a
          href={d.data.url || d.source}
          target="_blank"
          rel="noreferrer"
          key={d.id}
          className="document-card"
        >
          <FileText size={30} strokeWidth={1.1} />
          <div>
            <h3>{d.title}</h3>
            <p>{d.summary}</p>
            <small>
              {d.data.fileType || "Document"} · Opens source document
            </small>
          </div>
          <Download size={19} />
        </a>
      ))}
    </div>
  );
}
const resourceLinks = [
  ["Organization profile", "The foundation in one place.", "/profile/"],
  ["Reports", "Program and annual reporting.", "/reports/"],
  ["Financials", "Financial publications.", "/financials/"],
  [
    "Registrations & licenses",
    "Documents published by the foundation.",
    "/license/",
  ],
  ["Policies", "Governance and website policies.", "/policies/"],
  [
    "Tax information",
    "Source certificates and donor information.",
    "/tax-exemptions/",
  ],
  ["Photos", "A visual introduction to our purpose.", "/photos/"],
  ["Videos", "Stories in motion.", "/videos/"],
];
export function Resources({ page }: { page: string }) {
  const { content, organization: o } = useSite();
  let docs = content.filter(
    (x) => x.kind === "document" || x.kind === "report",
  );
  if (page === "profile") docs = docs.filter((x) => x.category === "Profile");
  if (page === "license")
    docs = docs.filter((x) => x.category === "Registration");
  if (page === "reports" || page === "financials")
    docs = docs.filter(
      (x) =>
        x.kind === "report" &&
        (page !== "financials" || x.category === "Financial"),
    );
  if (page === "tax-exemptions")
    docs = docs.filter((x) => /12A|80G/.test(x.title));
  if (page === "profile")
    return (
      <div className="organization-profile-page">
        <section className="profile-banner" aria-labelledby="profile-title">
          <img
            className="profile-banner-art"
            src="/images/volunteering.jpg"
            alt="People bringing their hands together — illustrative photograph"
            loading="lazy"
          />
          <div className="container">
            <nav className="profile-breadcrumb" aria-label="Breadcrumb">
              <a href="/">Home</a>
              <span>/</span>
              <a href="/resources/">Resources &amp; Transparency</a>
              <span>/</span>
              <span aria-current="page">Organization Profile</span>
            </nav>
            <p className="eyebrow">RESOURCES &amp; TRANSPARENCY</p>
            <h1 id="profile-title">
              Organization
              <br />
              Profile
            </h1>
            <p className="profile-banner-description">
              A clearer view of the foundation, its work, and its publicly
              available information.
            </p>
          </div>
        </section>
        <section
          className="profile-overview container"
          aria-labelledby="profile-overview-title"
        >
          <div className="profile-overview-grid">
            <div className="profile-overview-copy">
              <p className="eyebrow">ABOUT US</p>
              <h2 id="profile-overview-title">Well Being Foundation</h2>
              <p className="profile-about">{o.about}</p>
              <p className="profile-registration">{o.registration}</p>
              <ContactDetails />
            </div>
            <img
              className="profile-community-portrait"
              src="/images/women-skill-training.jpeg"
              alt="Women working at sewing machines in a WBF training session"
              loading="lazy"
            />
          </div>
          <div className="profile-publications">
            {docs.length ? (
              docs.map((d) => (
                <article className="profile-publication" key={d.id}>
                  <FileText size={40} strokeWidth={1.3} aria-hidden="true" />
                  <div>
                    <h3>{d.title}</h3>
                    <p>{d.summary}</p>
                    <small>
                      {d.data.fileType || "PDF"} · Opens source document
                    </small>
                  </div>
                  <a
                    className="button"
                    href={d.data.url || d.source}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Download size={19} /> Download PDF
                  </a>
                </article>
              ))
            ) : (
              <Empty
                title="No publications available yet"
                href="/contact/"
                label="Request information"
              />
            )}
          </div>
        </section>
        <section
          className="profile-purpose"
          aria-labelledby="profile-purpose-title"
        >
          <div className="container">
            <p className="eyebrow">OUR PURPOSE</p>
            <h2 id="profile-purpose-title">
              People, communities
              <br />
              and <em>a better tomorrow.</em>
            </h2>
            <p>
              We continue to work towards a more inclusive, equitable and
              sustainable future for all.
            </p>
            <ButtonLink href="/our-work/">Learn more about our work</ButtonLink>
          </div>
        </section>
      </div>
    );
  return (
    <>
      <PageHero
        eyebrow="RESOURCES & TRANSPARENCY"
        title={routeTitles[page] || "Resources"}
        description="A clearer view of the foundation, its work, and its publicly available information."
        compact
      />
      <section className="section container">
        {page === "resources" || page === "content" ? (
          <div className="resource-links">
            {resourceLinks.map(([title, text, href]) => (
              <a href={href} key={href}>
                <FileText size={26} strokeWidth={1.3} />
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowUpRight size={18} />
              </a>
            ))}
          </div>
        ) : (
          <>
            {page === "profile" && (
              <div className="profile-intro">
                <h2>Well Being Foundation</h2>
                <p className="lead">{o.about}</p>
                <p>{o.registration}</p>
                <ContactDetails />
              </div>
            )}
            {page === "tax-exemptions" && (
              <Notice>
                The foundation publishes the certificates linked below. Current
                eligibility and any benefit for a specific contribution must be
                confirmed with the organization. This preview makes no tax
                benefit claims.
              </Notice>
            )}
            {page === "policies" ? (
              <>
                <Notice>
                  The source governance document links were unavailable during
                  review. Website notices and source policy links are available
                  below.
                </Notice>
                <div className="resource-links">
                  {[
                    ["Privacy", "/privacy/"],
                    ["Terms", "/terms/"],
                    ["Refunds", "/refund/"],
                    ["Cookies", "/cookies/"],
                  ].map(([title, href]) => (
                    <a href={href} key={href}>
                      <h3>{title}</h3>
                      <ArrowUpRight size={20} />
                    </a>
                  ))}
                </div>
              </>
            ) : docs.length ? (
              <DocumentList items={docs} />
            ) : (
              <Empty
                title="No publications available yet"
                text="Documents will appear here once the foundation has published them."
                href="/contact/"
                label="Request information"
              />
            )}
          </>
        )}
      </section>
    </>
  );
}
export function Gallery({ video = false }: { video?: boolean }) {
  const { content } = useSite();
  const [active, setActive] = useState<Entry | null>(null);
  const published = content.filter(
    (x) => x.kind === (video ? "video" : "gallery"),
  );
  const items = published.length
    ? published
    : video
      ? []
      : [
          ["education", "Learning together"],
          ["women", "Possibility and dignity"],
          ["community", "Community connection"],
          ["environment", "Our shared environment"],
          ["hero", "A brighter tomorrow"],
          ["volunteering", "Stronger together"],
        ].map(
          ([slug, title]) =>
            ({
              id: slug,
              title,
              image: "/images/" + slug + ".jpg",
              summary:
                "Illustrative stock photography. Not a documented WBF activity.",
              data: {},
            }) as Entry,
        );
  return (
    <>
      <PageHero
        eyebrow={video ? "VIDEOS" : "PHOTO GALLERY"}
        title={
          video ? "Stories in motion." : "A world of possibility, in pictures."
        }
        description={
          video
            ? "Published films and stories from approved sources."
            : "A visual introduction to learning, community and shared purpose."
        }
        compact
      />
      <section className="section container">
        {items.length ? (
          <div className="gallery-grid">
            {items.map((p) => (
              <button onClick={() => setActive(p)} key={p.id}>
                <img
                  src={p.image || "/images/community.jpg"}
                  alt={p.title}
                  loading="lazy"
                />
                <span>
                  {video && <Play size={18} />} {p.title}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <Empty
            title="Films will appear here"
            text="No approved video embeds have been published yet."
          />
        )}
      </section>
      {active && (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={active.title}
          onClick={() => setActive(null)}
        >
          <div className="gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              autoFocus
              onClick={() => setActive(null)}
              aria-label="Close image"
            >
              <X />
            </button>
            <img
              src={active.image || "/images/community.jpg"}
              alt={active.title}
            />
            <h3>{active.title}</h3>
            <p>{active.summary}</p>
            {video && active.data.url && (
              <a
                className="button"
                href={active.data.url}
                target="_blank"
                rel="noreferrer"
              >
                Watch at source <ArrowUpRight size={17} />
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
export function Utility({ page }: { page: string }) {
  const [cleared, setCleared] = useState(false);
  const { content } = useSite();
  const cms = content.find((x) => x.kind === "page" && x.slug === page);
  const faqs = [
    [
      "How can I volunteer?",
      "Create an account, verify your email, and complete the four-step volunteer application. You can track its progress in your account.",
    ],
    [
      "Can I make a donation here?",
      "This preview supports Razorpay test checkout only when merchant test credentials are configured. Live payments are disabled.",
    ],
    [
      "Where can I find my application?",
      "Sign in and open My Account. Your application reference, current status and updates are listed there.",
    ],
    [
      "How do I access reports?",
      "Visit Resources and Reports. Publications appear only when they are available. You can contact the foundation to request further information.",
    ],
    [
      "Are these photographs WBF beneficiaries?",
      "The initial photographs are licensed stock images used to illustrate the site’s themes. They are not presented as documented WBF activities.",
    ],
  ];
  return (
    <>
      <PageHero
        eyebrow="HELP & INFORMATION"
        title={routeTitles[page] || "Information"}
        compact
      />
      <section className="section container narrow">
        {cms ? (
          <article className="prose">
            {cms.body.split("\n\n").map((x, i) => (
              <p key={i}>{x}</p>
            ))}
          </article>
        ) : page === "faq" || page === "faq-2" ? (
          <div className="faq-list">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        ) : page === "cookies" ? (
          <article className="prose">
            <h2>Essential storage only.</h2>
            <p>
              This build uses an essential session cookie for sign-in.
              Application drafts are stored in the current browser tab; your
              shopping cart is stored on this device. No analytics or
              advertising cookies are installed by this application.
            </p>
            <p>
              External links and checkout providers have their own privacy
              practices.
            </p>
            <button
              className="button secondary"
              onClick={() => {
                Object.keys(sessionStorage)
                  .filter((k) => k.startsWith("wbf-"))
                  .forEach((k) => sessionStorage.removeItem(k));
                localStorage.removeItem("wbf-cart");
                setCleared(true);
              }}
            >
              Clear saved drafts and cart
            </button>
            {cleared && (
              <Notice>
                Saved application drafts and the cart have been cleared from
                this browser.
              </Notice>
            )}
          </article>
        ) : page === "accessibility" ? (
          <article className="prose">
            <h2>Designed for participation.</h2>
            <p>
              The site includes keyboard navigation, labelled form controls,
              visible focus states, responsive layouts and reduced-motion
              support. We welcome feedback on barriers you encounter.
            </p>
            <ButtonLink href="/contact/">
              Report an accessibility issue
            </ButtonLink>
          </article>
        ) : (
          <article className="prose">
            <Notice>
              This preview notice describes the implemented website. Formal
              organization policies require review and publication by the
              foundation.
            </Notice>
            {page.includes("privacy") ? (
              <>
                <h2>Your information</h2>
                <p>
                  Accounts store your name, email, optional phone number and a
                  password hash. Applications, contact messages, donation
                  records and store inquiries are saved so authorized staff can
                  review and respond to them.
                </p>
                <h2>Control and access</h2>
                <p>
                  Members can view their own records. Administrative access is
                  limited by server-enforced permissions. Payment card details
                  are not stored by this application.
                </p>
                <h2>Questions and requests</h2>
                <p>
                  Contact the site operator to request access, correction or
                  deletion. A production retention schedule must be approved
                  before public launch.
                </p>
              </>
            ) : page.includes("refund") || page === "donation-policy" ? (
              <>
                <h2>Donation information</h2>
                <p>
                  Live payments are disabled. When configured, checkout uses
                  Razorpay test mode. No paid receipt is issued until a captured
                  payment is verified on the server.
                </p>
                <h2>Refund requests</h2>
                <p>
                  Contact the organization with the transaction reference to
                  discuss an actual refund. This preview does not promise refund
                  eligibility, timelines or tax treatment.
                </p>
              </>
            ) : (
              <>
                <h2>Using this website</h2>
                <p>
                  Provide accurate account and application information. Keep
                  your sign-in details private and use the site respectfully.
                  Submitted applications and inquiries require review and do not
                  guarantee participation or fulfillment.
                </p>
                <h2>Content and transactions</h2>
                <p>
                  Reference information reflects the publicly available WBF site
                  at the time of the audit. Confirm event dates, vacancies and
                  product availability with the team. This preview does not
                  accept live payments.
                </p>
              </>
            )}
            <a
              className="text-link"
              href={
                "https://wbfngo.org/" +
                (page.includes("privacy")
                  ? "privacy"
                  : page.includes("refund")
                    ? "refund"
                    : "terms") +
                "/"
              }
              target="_blank"
              rel="noreferrer"
            >
              Read the foundation’s published policy <ArrowUpRight size={16} />
            </a>
          </article>
        )}
      </section>
    </>
  );
}
export function SearchPage({ initialQuery = "" }: { initialQuery?: string }) {
  const { content } = useSite();
  const [q, setQ] = useState(initialQuery);
  const matches = q.trim()
    ? content
        .filter((x) =>
          (x.title + " " + x.summary + " " + x.category)
            .toLowerCase()
            .includes(q.toLowerCase()),
        )
        .slice(0, 30)
    : [];
  return (
    <>
      <PageHero
        title="What would you like to discover?"
        eyebrow="SEARCH WBF"
        compact
      />
      <section className="section container narrow">
        <label className="search-field large">
          <Search size={22} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search programs, stories, events…"
            aria-label="Search all website content"
          />
        </label>
        {q && (
          <p className="muted">
            {matches.length} result{matches.length !== 1 ? "s" : ""}
          </p>
        )}
        <div className="search-results">
          {matches.map((p) => (
            <a
              href={
                p.kind === "product"
                  ? "/product/?slug=" + p.slug
                  : p.kind === "document"
                    ? p.data.url
                    : p.kind === "team"
                      ? "/our-team/"
                      : contentPath(p)
              }
              key={p.id}
            >
              <span className="eyebrow">{p.kind}</span>
              <h3>{p.title}</h3>
              <p>{p.summary}</p>
              <ArrowUpRight size={18} />
            </a>
          ))}
        </div>
        {q && !matches.length && (
          <Empty
            title="No matches found"
            text="Try a broader search, such as education or community."
          />
        )}
      </section>
    </>
  );
}
