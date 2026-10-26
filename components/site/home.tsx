"use client";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { niceDate } from "@/lib/content";
import { authenticPhoto } from "@/lib/photography";
import { useSite } from "./context";
import { ButtonLink, SectionTitle, ProgramGrid, StoryCards } from "./shared";

export function Home() {
  const { content, organization: o } = useSite();
  const heroPhoto = authenticPhoto(o.heroImage, "/images/hero.jpg");
  const stockHero = heroPhoto === "/images/hero.jpg";
  const programs = content.filter((x) => x.kind === "program");
  const posts = content.filter((x) => x.kind === "post").slice(0, 2);
  const events = content
    .filter(
      (x) => x.kind === "event" && new Date(x.data.end).getTime() > Date.now(),
    )
    .sort(
      (a, b) =>
        new Date(a.data.start).getTime() - new Date(b.data.start).getTime(),
    )
    .slice(0, 3);
  const customTitle =
    o.heroTitle &&
    ![
      "Empowering communities.\nInspiring possibility.",
      "Empowering Communities\nfor a Brighter Tomorrow.",
    ].includes(o.heroTitle);
  return (
    <>
      <section className="real-hero" aria-labelledby="home-banner-title">
        <img
          src={heroPhoto}
          alt={
            stockHero
              ? "Schoolchildren gathered together outdoors — photograph by Church of the King"
              : "Community photograph selected by the foundation"
          }
          width="2400"
          height="1600"
          fetchPriority="high"
        />
        <div className="real-hero-shade" />
        <div className="container real-hero-copy">
          <p className="eyebrow">WELL BEING FOUNDATION</p>
          <h1 id="home-banner-title">
            {customTitle ? (
              o.heroTitle
            ) : (
              <>
                Opportunity begins
                <br />
                with community.
              </>
            )}
          </h1>
          <p>
            {o.heroText ||
              "Working alongside communities to make education, care and opportunity part of everyday life."}
          </p>
          <div className="real-actions">
            <ButtonLink href="/our-work/" light>
              Explore our work
            </ButtonLink>
            <a href="/become-a-volunteer/" className="real-hero-link">
              Get involved <ArrowRight size={18} />
            </a>
          </div>
        </div>
        {stockHero && (
          <span className="real-photo-caption">
            School life, Rameswaram · Illustrative photography
          </span>
        )}
      </section>
      <div className="real-intro-strip">
        <div className="container">
          <p>
            People first.
            <br />
            <strong>Progress, together.</strong>
          </p>
          <a href="#home-focus">
            Eight connected focus areas <ArrowRight size={18} />
          </a>
          <a href="/profile/">
            An open view of our foundation <ArrowRight size={18} />
          </a>
        </div>
      </div>
      <section className="section container real-about" id="our-purpose">
        <figure className="real-photo-frame">
          <img
            src="/images/women-skill-training.jpeg"
            alt="Women working at sewing machines during a WBF skills training session"
            loading="lazy"
          />
          <figcaption>
            Skills, confidence and the opportunity to participate.
          </figcaption>
        </figure>
        <div>
          <p className="eyebrow">WHO WE ARE</p>
          <h2>
            Lasting change starts
            <br />
            with listening.
          </h2>
          <p className="lead">{o.about}</p>
          <p>
            Learning, health, livelihoods and a healthy environment are
            connected. Our work brings these priorities together, with people at
            the centre.
          </p>
          <a href="/about/" className="text-link">
            Meet the foundation <ArrowRight size={18} />
          </a>
        </div>
      </section>
      <section className="real-focus section" id="home-focus">
        <div className="container">
          <SectionTitle
            label="OUR FOCUS"
            title="Practical work. Shared possibilities."
            description="Explore the eight areas that connect our work with communities."
            link="All focus areas"
            href="/our-work/"
          />
          <ProgramGrid items={programs} photographic />
        </div>
      </section>
      <section className="section container real-approach">
        <div>
          <p className="eyebrow">OUR APPROACH</p>
          <h2>
            Built with people.
            <br />
            Grounded in everyday life.
          </h2>
          <p>
            Understand local priorities. Work together on practical responses.
            Keep learning from the people involved.
          </p>
          <ol className="real-steps">
            <li>
              <span>01</span>
              <div>
                <h3>Listen</h3>
                <p>
                  Start with conversations and the knowledge within a community.
                </p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <h3>Work together</h3>
                <p>
                  Connect people, skills and resources around shared priorities.
                </p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <h3>Learn and improve</h3>
                <p>
                  Reflect on the work and build on what communities find useful.
                </p>
              </div>
            </li>
          </ol>
          <a href="/our-approach/" className="text-link">
            How we work <ArrowRight size={18} />
          </a>
        </div>
        <figure className="real-photo-frame">
          <img
            src="/images/focus/from-local-to.jpeg"
            alt="WBF outreach with community members"
            loading="lazy"
          />
          <figcaption>
            Working alongside communities, one conversation at a time.
          </figcaption>
        </figure>
      </section>
      <section className="real-updates section">
        <div className="container">
          <SectionTitle
            label="FROM THE FOUNDATION"
            title="Stories, activities and opportunities."
            link="All stories"
            href="/blog/"
          />
          <div className="real-updates-grid">
            <div>
              {posts.length ? (
                <StoryCards items={posts} />
              ) : (
                <p>New stories will be shared here as they are published.</p>
              )}
            </div>
            <aside className="real-events">
              <div className="real-events-heading">
                <h3>Coming together</h3>
                <a href="/events/" aria-label="View all events">
                  <ArrowUpRight size={21} />
                </a>
              </div>
              {events.length ? (
                events.map((e) => (
                  <a
                    className="real-event"
                    href={`/events/${e.slug}/`}
                    key={e.id}
                  >
                    <time dateTime={e.data.start}>
                      {niceDate(e.data.start)}
                    </time>
                    <h4>{e.title}</h4>
                    <p>{e.data.location}</p>
                    <span>
                      Event details <ArrowRight size={16} />
                    </span>
                  </a>
                ))
              ) : (
                <p>
                  New events will appear here when dates are confirmed. Explore
                  past activities or contact us about getting involved.
                </p>
              )}
              <a href="/events/" className="text-link">
                Explore events <ArrowRight size={17} />
              </a>
            </aside>
          </div>
        </div>
      </section>
      <section
        className="section container real-partners"
        aria-labelledby="partners-title"
      >
        <p className="eyebrow">WORKING TOGETHER</p>
        <h2 id="partners-title">CSR &amp; government partners</h2>
        <ul>
          {[
            ["inDrive", "indrive.svg", "https://indrive.com/"],
            ["Medanta", "medanta.svg", "https://www.medanta.org/"],
            [
              "National Skill Development Corporation",
              "nsdc.svg",
              "https://nsdcindia.org/",
            ],
            ["Skill Council for Green Jobs", "scgj.jpg", "https://sscgj.in/"],
            [
              "Skill India",
              "skill-india.svg",
              "https://www.skillindiadigital.gov.in/",
            ],
            [
              "Ministry of Skill Development and Entrepreneurship",
              "government-partners.jpg",
              "https://www.msde.gov.in/",
            ],
          ].map(([name, image, url]) => (
            <li key={name}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} — official website`}
              >
                {image === "government-partners.jpg" ? (
                  <svg viewBox="0 0 222 60" role="img" aria-label={name}>
                    <image
                      href="/partners/government-partners.jpg"
                      width="900"
                      height="60"
                    />
                  </svg>
                ) : (
                  <img src={`/partners/${image}`} alt={name} loading="lazy" />
                )}
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section className="real-invitation">
        <img
          src="/images/volunteering.jpg"
          alt="A group of people bringing their hands together — illustrative photograph"
          loading="lazy"
        />
        <div className="real-invitation-panel">
          <p className="eyebrow">YOUR TIME. YOUR SKILLS. YOUR CARE.</p>
          <h2>
            There’s a place
            <br />
            for you here.
          </h2>
          <p>
            Volunteer, explore an internship or start a conversation about
            working together.
          </p>
          <div className="real-actions">
            <ButtonLink href="/get-involved/">Find your way to help</ButtonLink>
            <a href="/csr-partnerships/" className="text-link">
              Partner with us <ArrowRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
