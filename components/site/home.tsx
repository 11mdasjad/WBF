"use client";
import {
  ArrowUpRight,
  ArrowRight,
  ArrowDown,
  CircleArrowRight,
  HeartHandshake,
  Heart,
  MoveUpRight,
  Check,
  Sprout,
  BookOpen,
  Users,
  ShieldCheck,
  Sun,
  Ear,
  MapPin,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Handshake,
} from "lucide-react";
import { authenticPhoto } from "@/lib/photography";
import { niceDate } from "@/lib/content";
import { useSite } from "./context";
import { ButtonLink, SectionTitle, ProgramGrid, StoryCards } from "./shared";

export function Home() {
  const { content, organization: o } = useSite();
  const programs = content.filter((x) => x.kind === "program"),
    posts = content.filter((x) => x.kind === "post");
  const upcomingEvents = content
    .filter(
      (e) => e.kind === "event" && new Date(e.data.end).getTime() > Date.now(),
    )
    .sort(
      (a, b) =>
        new Date(b.data.start).getTime() - new Date(a.data.start).getTime(),
    )
    .slice(0, 2);
  const useReferenceTitle =
    !o.heroTitle ||
    [
      "Empowering communities.\nInspiring possibility.",
      "Empowering Communities\nfor a Brighter Tomorrow.",
    ].includes(o.heroTitle);
  const heroDescription =
    o.heroText ===
    "Together, we create opportunities for people to learn, thrive, and build a brighter tomorrow."
      ? "Together, we create opportunities for people to learn, thrive, and build a more inclusive and sustainable future."
      : o.heroText;
  return (
    <>
      <section
        className="home-hero editorial-hero"
        aria-labelledby="home-banner-title"
      >
        <div className="banner-visual">
          <img
            className="hero-photo"
            src={authenticPhoto(o.heroImage, "/images/hero.jpg")}
            alt="Community photograph — illustrative photography"
            width={1800}
            height={1200}
            fetchPriority="high"
          />

          <a
            className="banner-scroll"
            href="#our-purpose"
            aria-label="Explore our purpose"
          >
            <ArrowDown size={26} />
          </a>
          <span className="hero-photo-credit">Illustrative image</span>
        </div>

        <div className="banner-inner">
          <div className="banner-copy">
            <p className="banner-eyebrow">
              People <b>·</b> <span>Purpose</span> <b>·</b> Possibility
            </p>
            <h1 id="home-banner-title">
              {useReferenceTitle ? (
                <>
                  <span>Empowering</span>
                  <span>Communities</span>
                  <span>
                    for a <em>Brighter</em>
                  </span>
                  <span className="banner-tomorrow">Tomorrow.</span>
                </>
              ) : (
                o.heroTitle
                  .split("\n")
                  .map((line: string, i: number) => <span key={i}>{line}</span>)
              )}
            </h1>
            <p className="banner-description">{heroDescription}</p>
            <div className="banner-buttons">
              <a href="/donate/" className="banner-primary">
                Make a Difference <ArrowRight size={18} />
              </a>
              <a href="/about/" className="banner-story">
                <CircleArrowRight size={27} strokeWidth={1.5} /> Discover Our
                Story
              </a>
            </div>
            <div className="banner-community">
              <p>
                <strong>Small acts. Lasting change.</strong>
                <span>It starts with people like you.</span>
              </p>
              <a href="/become-a-volunteer/">
                Join Our Journey <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>
      <section
        className="banner-purpose"
        id="our-purpose"
        aria-label="Our shared purpose"
      >
        <div className="banner-purpose-card">
          <div className="banner-fact">
            <BookOpen size={35} strokeWidth={1.3} />
            <p>
              <strong>2015</strong>
              <span>Foundation registered</span>
            </p>
          </div>
          <div className="banner-fact">
            <Users size={35} strokeWidth={1.3} />
            <p>
              <strong>{programs.length}</strong>
              <span>Connected focus areas</span>
            </p>
          </div>
          <div className="banner-fact">
            <HeartHandshake size={35} strokeWidth={1.3} />
            <p>
              <strong>People first.</strong>
              <span>Community-led change</span>
            </p>
          </div>
          <p className="banner-purpose-quote">
            “Real change begins when
            <br />
            people come together.”
          </p>
          <a href="/our-approach/" className="banner-sustainability">
            <Sprout size={28} strokeWidth={1.4} />
            <span>
              Sustainable
              <br />
              Communities
            </span>
            <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
      <section
        className="about-showcase"
        aria-labelledby="about-showcase-title"
      >
        <div className="container about-showcase-grid">
          <div className="about-collage about-classroom-collage">
            <img
              className="about-portrait"
              src="/images/women-skill-training.jpeg"
              alt="Women practising sewing in a WBF training session"
              loading="lazy"
            />
          </div>
          <div className="about-showcase-copy">
            <p className="eyebrow">
              <span /> WHO WE ARE
            </p>
            <h2 id="about-showcase-title">
              Change begins
              <br />
              with <em>all of us.</em>
            </h2>
            <p className="about-lead">
              We believe everyone deserves the chance to build a life of dignity
              and possibility.
            </p>
            <p className="about-description">
              At Well Being Foundation, we work alongside communities to turn
              that belief into everyday action. From learning and well-being to
              skills and livelihoods, our work connects people with
              opportunities to thrive.
            </p>
            <ul className="about-values">
              <li>
                <div>
                  <h3>Community-led action</h3>
                  <p>Solutions shaped with, not for, communities.</p>
                </div>
              </li>
              <li>
                <div>
                  <h3>Inclusive opportunity</h3>
                  <p>Leaving no one behind.</p>
                </div>
              </li>
              <li>
                <div>
                  <h3>Sustainable progress</h3>
                  <p>Building lasting change for future generations.</p>
                </div>
              </li>
            </ul>
            <div className="about-showcase-actions">
              <a className="about-discover" href="/about/">
                Discover our story <ArrowRight size={18} />
              </a>
              <a className="about-journey" href="/our-approach/">
                <CircleArrowRight size={29} strokeWidth={1.5} /> Explore our
                journey
              </a>
            </div>
          </div>
        </div>
      </section>
      <section className="partners-showcase" aria-labelledby="partners-title">
        <div className="container">
          <div className="partners-heading">
            <span className="partners-eyebrow">TOGETHER, WE GO FURTHER</span>
            <h2 id="partners-title">Our CSR &amp; Government Partners</h2>
            <p>Trusted by leading organizations across India</p>
          </div>
          <div className="partners-marquee">
            <div className="partners-track">
              {[0, 1].map((copy) => (
                <ul
                  key={copy}
                  className="partners-grid"
                  aria-label={copy === 0 ? "Our partners" : undefined}
                  aria-hidden={copy === 1 ? true : undefined}
                  inert={copy === 1 ? true : undefined}
                >
                  {[
                    {
                      name: "inDrive",
                      image: "indrive.svg",
                      url: "https://indrive.com/",
                    },
                    {
                      name: "Medanta",
                      image: "medanta.svg",
                      url: "https://www.medanta.org/",
                    },
                    {
                      name: "Ministry of Skill Development and Entrepreneurship",
                      image: "government-partners.jpg",
                      url: "https://www.msde.gov.in/",
                    },
                    {
                      name: "National Skill Development Corporation",
                      image: "nsdc.svg",
                      url: "https://nsdcindia.org/",
                    },
                    {
                      name: "Skill Council for Green Jobs",
                      image: "scgj.jpg",
                      url: "https://sscgj.in/",
                    },
                    {
                      name: "Skill India",
                      image: "skill-india.svg",
                      url: "https://www.skillindiadigital.gov.in/",
                    },
                  ].map((partner) => (
                    <li key={partner.name}>
                      <a
                        href={partner.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${partner.name} — official website (opens in a new tab)`}
                      >
                        {partner.image === "government-partners.jpg" ? (
                          <svg
                            className="partner-ministry-mark"
                            viewBox="0 0 222 60"
                            role="img"
                            aria-label={partner.name}
                          >
                            <title>{partner.name}</title>
                            <image
                              href="/partners/government-partners.jpg"
                              width="900"
                              height="60"
                            />
                          </svg>
                        ) : (
                          <img
                            src={`/partners/${partner.image}`}
                            alt={partner.name}
                            width="220"
                            height="110"
                            loading="lazy"
                          />
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section
        className="section focus-section focus-showcase"
        aria-labelledby="focus-showcase-title"
      >
        <div className="container">
          <div className="focus-showcase-heading">
            <div className="focus-showcase-intro">
              <p className="eyebrow">
                <span /> WHERE WE FOCUS
              </p>
              <h2 id="focus-showcase-title">
                Many paths. One <em>shared purpose.</em>
              </h2>
              <p>
                Eight connected areas of work. One belief in a better future for
                every community.
              </p>
            </div>
            <div className="focus-showcase-actions">
              <a href="/our-work/" className="focus-explore">
                Explore our work{" "}
                <span>
                  <ArrowUpRight size={18} />
                </span>
              </a>
            </div>
          </div>
          <ProgramGrid items={programs} photographic />
        </div>
      </section>
      <section
        className="change-showcase"
        aria-labelledby="change-showcase-title"
      >
        <div className="change-photo">
          <img
            src="/images/focus/from-local-to.jpeg"
            alt="Community outreach with women and families"
            loading="lazy"
          />
        </div>
        <div className="change-content">
          <div className="change-heading">
            <p className="eyebrow">
              HOW CHANGE HAPPENS <span />
            </p>
          </div>
          <div className="change-main">
            <div className="change-copy">
              <h2 id="change-showcase-title">
                Listen closely.
                <br />
                Work together.
                <br />
                <em>Grow, sustainably.</em>
              </h2>
              <p>
                Meaningful change starts by understanding what matters to
                people. We listen, collaborate, and build practical solutions
                that communities can make their own.
              </p>
              <a href="/our-approach/" className="change-approach-link">
                Our approach <ArrowUpRight size={19} />
              </a>
            </div>
            <ol className="change-steps">
              <li>
                <div>
                  <h3>Listen</h3>
                  <p>Understand real needs on the ground.</p>
                </div>
              </li>
              <li>
                <div>
                  <h3>Collaborate</h3>
                  <p>Work with communities and local partners.</p>
                </div>
              </li>
              <li>
                <div>
                  <h3>Create impact</h3>
                  <p>Build sustainable solutions for lasting change.</p>
                </div>
              </li>
            </ol>
          </div>
          <div
            className="change-principles"
            aria-label="Our approach at a glance"
          >
            <div>
              <Users size={28} strokeWidth={1.4} />
              <p>
                <strong>People first</strong>
                <span>Local voices</span>
              </p>
            </div>
            <div>
              <HeartHandshake size={28} strokeWidth={1.4} />
              <p>
                <strong>Shared action</strong>
                <span>Community partnerships</span>
              </p>
            </div>
            <a href="/our-work/">
              <Sprout size={28} strokeWidth={1.4} />
              <p>
                <strong>{programs.length} focus areas</strong>
                <span>Connected change</span>
              </p>
            </a>
          </div>
        </div>
      </section>
      <section className="news-showcase" aria-labelledby="news-showcase-title">
        <div className="container">
          <div className="news-showcase-heading">
            <div>
              <p className="eyebrow">
                VOICES &amp; UPDATES <span />
              </p>
              <h2 id="news-showcase-title">
                Stories of <em>possibility.</em>
              </h2>
              <p>Ideas, initiatives, and updates from the foundation.</p>
            </div>
            <a href="/blog/" className="section-soft-link">
              All news &amp; stories <ArrowRight size={17} />
            </a>
          </div>
          <StoryCards items={posts.slice(0, 3)} editorial />
        </div>
      </section>
      <section
        className="gather-showcase"
        aria-labelledby="gather-showcase-title"
      >
        <div className="container gather-grid">
          <div className="gather-intro">
            <p className="eyebrow">
              COME TOGETHER <span />
            </p>
            <h2 id="gather-showcase-title">
              Make time for <em>community.</em>
            </h2>
            <p>
              Good things happen when we come together. There’s more than one
              way to make a difference. Find the one that feels right for you.
            </p>
            <a href="/our-team/" className="gather-team-link">
              Meet the people behind the work <ArrowRight size={17} />
            </a>
          </div>
          <div className="gather-photo">
            <img
              src="/images/focus/youth-education.jpeg"
              alt="Participants at a community skills session"
              loading="lazy"
            />
          </div>
          <div className="gather-events">
            <div className="gather-events-heading">
              <p className="eyebrow">
                UPCOMING &amp; ONGOING <span />
              </p>
              <a href="/events/" className="section-soft-link">
                Explore all events <ArrowRight size={16} />
              </a>
            </div>
            <div className="gather-event-list">
              {upcomingEvents.map((e) => (
                <a
                  className="gather-event"
                  href={"/events/" + e.slug + "/"}
                  key={e.id}
                  aria-label={e.title + " in " + e.data.location}
                >
                  <time className="gather-date" dateTime={e.data.start}>
                    <strong>
                      {new Date(e.data.start).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        timeZone: "Asia/Kolkata",
                      })}
                    </strong>
                    <span>
                      {new Date(e.data.start).toLocaleDateString("en-IN", {
                        month: "short",
                        timeZone: "Asia/Kolkata",
                      })}
                    </span>
                    <small>
                      {new Date(e.data.start).toLocaleDateString("en-IN", {
                        year: "numeric",
                        timeZone: "Asia/Kolkata",
                      })}
                    </small>
                  </time>
                  <div className="gather-event-copy">
                    <h3>{e.title}</h3>
                    <p>
                      <MapPin size={14} />
                      <span>{e.data.location}</span>
                    </p>
                    <p>
                      <CalendarDays size={14} />
                      <span>Until {niceDate(e.data.end)}</span>
                    </p>
                  </div>
                  <div className="gather-event-photo">
                    <img
                      src={authenticPhoto(e.image)}
                      alt="Illustrative event photograph"
                      loading="lazy"
                    />
                  </div>
                  <span className="gather-event-arrow">
                    <ChevronRight size={19} />
                  </span>
                </a>
              ))}
              {!upcomingEvents.length && (
                <div className="gather-empty">
                  <CalendarDays size={28} />
                  <h3>More ways to come together, soon.</h3>
                  <p>Explore past events and check back for new dates.</p>
                  <a href="/events/">
                    View all events <ArrowRight size={15} />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section
        className="participation-showcase"
        aria-labelledby="participation-title"
      >
        <div className="container participation-grid">
          <div className="participation-copy">
            <p className="eyebrow">
              YOUR PLACE IN THE STORY <span />
            </p>
            <h2 id="participation-title">
              Good things happen
              <br />
              when we come
              <br />
              <em>together.</em>
            </h2>
            <p>
              There’s more than one way to make a difference.
              <br />
              Find the one that feels right for you.
            </p>
            <a href="/our-team/" className="participation-team">
              Meet the people behind the work <ArrowUpRight size={19} />
            </a>
          </div>
          <div className="participation-photo">
            <img
              src="/images/volunteering.jpg"
              alt="People bringing their hands together — illustrative photograph"
              loading="lazy"
            />
          </div>
          <nav
            className="participation-options"
            aria-label="Ways to get involved"
          >
            {[
              {
                number: "01",
                title: "Give your time",
                description: "Volunteer with our community",
                href: "/become-a-volunteer/",
                Icon: HeartHandshake,
              },
              {
                number: "02",
                title: "Share your expertise",
                description: "Explore internships and careers",
                href: "/careers/",
                Icon: GraduationCap,
              },
              {
                number: "03",
                title: "Build a partnership",
                description: "Create meaningful change together",
                href: "/csr-partnerships/",
                Icon: Handshake,
              },
            ].map(({ number, title, description, href, Icon }) => (
              <a href={href} className="participation-option" key={number}>
                <span className="participation-number">{number}</span>

                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
                <span className="participation-arrow">
                  <ArrowUpRight size={20} />
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>
      <section
        className="community-invitation"
        aria-labelledby="community-invitation-title"
      >
        <div className="container invitation-grid">
          <div className="invitation-copy">
            <p className="eyebrow">
              A LITTLE OF YOUR TIME. A WORLD OF POSSIBILITY.
            </p>
            <h2 id="community-invitation-title">
              Be part of someone’s <em>tomorrow.</em>
            </h2>
            <p>
              Bring your skills, your compassion, and your belief in a better
              future.
            </p>
          </div>
          <div className="invitation-action">
            <a href="/become-a-volunteer/">
              Join our community{" "}
              <span>
                <ArrowUpRight size={25} />
              </span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
