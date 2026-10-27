"use client";
import { useState } from "react";
import { ArrowRight, ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { niceDate } from "@/lib/content";
import { useSite } from "./context";
import {
  ButtonLink,
  SectionTitle,
  ProgramGrid,
  StoryCards,
  CTABand,
} from "./shared";

const partners = [
  ["inDrive", "indrive.svg", "https://indrive.com/"],
  ["Medanta", "medanta.svg", "https://www.medanta.org/"],
  [
    "National Skill Development Corporation",
    "nsdc.svg",
    "https://nsdcindia.org/",
  ],
  ["Skill Council for Green Jobs", "scgj.jpg", "https://sscgj.in/"],
  ["Skill India", "skill-india.svg", "https://www.skillindiadigital.gov.in/"],
  [
    "Ministry of Skill Development and Entrepreneurship",
    "government-partners.jpg",
    "https://www.msde.gov.in/",
  ],
];
const pathways = [
  { value: "volunteer", label: "Give my time", href: "/become-a-volunteer/" },
  {
    value: "internship",
    label: "Build experience through an internship",
    href: "/volunteering-internships/",
  },
  {
    value: "partner",
    label: "Partner with the foundation",
    href: "/csr-partnerships/",
  },
  { value: "support", label: "Support the work", href: "/donate/" },
];

export function Home() {
  const { content, organization: o, user } = useSite();
  const [pathway, setPathway] = useState(pathways[0].value);
  const programs = content.filter((x) => x.kind === "program");
  const posts = content.filter((x) => x.kind === "post").slice(0, 3);
  const events = content
    .filter(
      (x) => x.kind === "event" && new Date(x.data.end).getTime() > Date.now(),
    )
    .sort(
      (a, b) =>
        new Date(a.data.start).getTime() - new Date(b.data.start).getTime(),
    )
    .slice(0, 2);
  const selectedPath = pathways.find((x) => x.value === pathway)!;
  const hero = {
    eyebrow: "PEOPLE. PURPOSE. POSSIBILITY.",
    title: o.heroTitle || "Empowering communities.\nFor a brighter tomorrow.",
    text:
      o.heroText ||
      "Together, we create opportunities for people to learn, thrive and build a better future.",
    image: "/images/community-landscape-banner.png",
    width: 1672,
    height: 941,
    alt: "Community gathering beneath a tree overlooking a lake and mountains — illustrative image",
    link: "/our-work/",
    action: "Explore our work",
    note: "Illustrative image",
  };
  return (
    <>
      <section className="portal-hero" aria-label="Welcome to WBF">
        <div className="portal-hero-stage">
          <img
            className="hero-photo portal-hero-photo"
            src={hero.image}
            alt={hero.alt}
            width={hero.width}
            height={hero.height}
            fetchPriority="high"
          />
          <div className="portal-hero-shade" aria-hidden="true" />
          <div className="container portal-hero-inner">
            <div className="portal-hero-copy">
              <p className="eyebrow">{hero.eyebrow}</p>
              <h1>{hero.title}</h1>
              <p className="portal-hero-description">{hero.text}</p>
              <div className="portal-hero-actions">
                <ButtonLink href={hero.link} light>
                  {hero.action}
                </ButtonLink>
                <a
                  className="portal-hero-secondary"
                  href="/become-a-volunteer/"
                >
                  Become a volunteer <ArrowRight size={17} />
                </a>
              </div>
            </div>
            <span className="portal-photo-note">{hero.note}</span>
          </div>
        </div>
      </section>

      <section className="portal-partners" aria-labelledby="partners-title">
        <div className="container">
          <div className="portal-section-heading">
            <p className="eyebrow">TOGETHER, WE GO FURTHER</p>
            <h2 id="partners-title">Our CSR &amp; Government Partners</h2>
          </div>
          <ul className="portal-partner-grid">
            {partners.map(([name, src, url]) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${name} — official website`}
                >
                  {src === "government-partners.jpg" ? (
                    <svg viewBox="0 0 222 60" role="img" aria-label={name}>
                      <title>{name}</title>
                      <image
                        href="/partners/government-partners.jpg"
                        width="900"
                        height="60"
                      />
                    </svg>
                  ) : (
                    <img src={`/partners/${src}`} alt={name} loading="lazy" />
                  )}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className="portal-intro section"
        aria-label="About the foundation"
      >
        <div className="container">
          <article className="portal-intro-card">
            <img
              src="/images/focus/youth-education.jpeg"
              alt="Participants learning practical skills at a WBF training centre"
              loading="lazy"
            />
            <div>
              <p className="eyebrow">WELL BEING FOUNDATION</p>
              <h2>Opportunity begins with people.</h2>
              <p>{o.about}</p>
              <a className="text-link" href="/about/">
                Get to know us <ArrowUpRight size={18} />
              </a>
            </div>
          </article>
          <article className="portal-intro-card portal-intro-reverse">
            <img
              src="/images/focus/from-local-to.jpeg"
              alt="Community outreach with women and families"
              loading="lazy"
            />
            <div>
              <p className="eyebrow">OUR SHARED PURPOSE</p>
              <h2>Working together. Moving forward.</h2>
              <p>{o.mission}</p>
              <a className="text-link" href="/our-approach/">
                How we work <ArrowUpRight size={18} />
              </a>
            </div>
          </article>
        </div>
      </section>

      <section
        className="section container portal-opportunities"
        aria-label="Ways to participate and upcoming events"
      >
        <article className="portal-feature-card">
          <div>
            <p className="eyebrow">YOUR SKILLS CAN MAKE A DIFFERENCE</p>
            <h2>
              A place for you.
              <br />A purpose we share.
            </h2>
            <p>
              Bring your time, experience and ideas. Find a way to contribute to
              your community.
            </p>
            <ButtonLink href="/get-involved/">Find your opportunity</ButtonLink>
          </div>
          <img
            src="/images/volunteering.jpg"
            alt="People bringing their hands together — illustrative photograph"
            loading="lazy"
          />
        </article>
        <aside className="portal-events">
          <div className="portal-events-title">
            <h2>Coming together</h2>
            <a href="/events/" aria-label="Browse all events">
              <ArrowUpRight size={20} />
            </a>
          </div>
          <div className="portal-event-grid">
            {events.length ? (
              events.map((e) => (
                <a
                  key={e.id}
                  href={`/events/${e.slug}/`}
                  className="portal-event-card"
                >
                  <span className="portal-event-label">COMMUNITY EVENT</span>
                  <h3>{e.title}</h3>
                  <p>
                    <CalendarDays size={15} />
                    <time dateTime={e.data.start}>
                      {niceDate(e.data.start)}
                    </time>
                  </p>
                  <p>
                    <MapPin size={15} />
                    {e.data.location}
                  </p>
                  <span className="text-link">
                    View event <ArrowRight size={16} />
                  </span>
                </a>
              ))
            ) : (
              <p>
                New activities will appear here when dates are confirmed.
                Explore past events to see how communities come together.
              </p>
            )}
          </div>
          <a href="/events/" className="portal-all-link">
            Explore all events <ArrowRight size={16} />
          </a>
        </aside>
      </section>

      <section className="section portal-principles">
        <div className="container">
          <div className="portal-section-heading">
            <p className="eyebrow">BUILDING STRONGER COMMUNITIES</p>
            <h2>People at the heart of progress.</h2>
          </div>
          <div className="portal-principle-grid">
            {[
              [
                "01",
                "Community-led",
                "Listen to local priorities and work alongside the people involved.",
              ],
              [
                "02",
                "Opportunity-focused",
                "Connect learning, health and practical skills with everyday possibilities.",
              ],
              [
                "03",
                "Working together",
                "Bring communities, volunteers and partners around a shared purpose.",
              ],
            ].map(([number, title, copy]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{copy}</p>
              </article>
            ))}
          </div>
          <ButtonLink href="/our-approach/">Explore our approach</ButtonLink>
        </div>
      </section>

      <section
        className="portal-discovery section"
        aria-label="Find your next step"
      >
        <div className="container">
          <SectionTitle
            label="FIND YOUR WAY"
            title="Your next step starts here."
            description="Explore a focus area, contribute your time, or find the right opportunity for you."
            link="View careers"
            href="/careers/"
          />
          <div className="portal-discovery-grid">
            <article className="portal-discovery-card">
              <p className="eyebrow">I WANT TO EXPLORE</p>
              <h3>Our work</h3>
              <img
                src="/images/focus/youth-education.jpeg"
                alt="A WBF learning session"
                loading="lazy"
              />
              <p>
                Education, skills, health and five more connected areas of
                community work.
              </p>
              <ButtonLink href="/our-work/">Find a focus area</ButtonLink>
            </article>
            <article className="portal-discovery-card">
              <p className="eyebrow">I WANT TO CONTRIBUTE</p>
              <h3>My time &amp; skills</h3>
              <img
                src="/images/women-skill-training.jpeg"
                alt="Women learning sewing skills together"
                loading="lazy"
              />
              <p>
                Explore volunteering, internships and partnerships with the
                foundation.
              </p>
              <ButtonLink href="/get-involved/">
                Explore opportunities
              </ButtonLink>
            </article>
            <article className="portal-pathfinder">
              <p className="eyebrow">A LITTLE GUIDANCE</p>
              <h3>
                Not sure
                <br />
                where to begin?
              </h3>
              <p>
                Choose what interests you. We’ll point you towards the right
                place.
              </p>
              <label htmlFor="wbf-interest">
                How would you like to take part?
              </label>
              <select
                id="wbf-interest"
                value={pathway}
                onChange={(e) => setPathway(e.target.value)}
              >
                {pathways.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <ButtonLink href={selectedPath.href} light>
                Explore this option
              </ButtonLink>
              <a className="portal-pathfinder-contact" href="/contact/">
                Or speak with our team <ArrowRight size={16} />
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="section container portal-programmes" id="our-purpose">
        <SectionTitle
          label="EIGHT CONNECTED FOCUS AREAS"
          title="Many paths. One shared purpose."
          description="Practical work that connects learning, well-being, rights and the environment."
          link="View all focus areas"
          href="/our-work/"
        />
        <ProgramGrid items={programs} photographic />
      </section>

      <section className="portal-account-band">
        <div className="container">
          <div>
            <p className="eyebrow">STAY CONNECTED TO YOUR JOURNEY</p>
            <h2>
              Your community.
              <br />
              Your next chapter.
            </h2>
            <p>
              Keep track of your applications and contributions, and stay
              connected with the foundation.
            </p>
          </div>
          <div className="portal-account-panel">
            <h3>{user ? "Welcome back." : "Start with a simple step."}</h3>
            <p>
              {user
                ? "Visit your account to follow your applications and updates."
                : "Create your account to start your journey with WBF."}
            </p>
            <ButtonLink href={user ? "/user/" : "/register/"} light>
              {user ? "Open my dashboard" : "Join the WBF community"}
            </ButtonLink>
            {!user && (
              <a href="/login/">
                Already a member? Sign in <ArrowRight size={16} />
              </a>
            )}
          </div>
        </div>
      </section>

      <section className="section container portal-stories">
        <SectionTitle
          label="NEWS & STORIES"
          title="From our community."
          description="Read about the work, activities and people connected with the foundation."
          link="All stories"
          href="/blog/"
        />
        <StoryCards items={posts} editorial />
      </section>
      <CTABand />
    </>
  );
}
