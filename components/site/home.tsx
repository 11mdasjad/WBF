"use client";
import {
  ArrowUpRight,
  ArrowRight,
  Heart,
  MapPin,
  MoveUpRight,
  Check,
  Sprout,
  BookOpen,
  Users,
  ShieldCheck,
} from "lucide-react";
import { niceDate } from "@/lib/content";
import { useSite } from "./context";
import {
  ButtonLink,
  SectionTitle,
  ProgramGrid,
  StoryCards,
  CTABand,
} from "./shared";
export function Home() {
  const { content, organization: o } = useSite();
  const programs = content.filter((x) => x.kind === "program"),
    posts = content.filter((x) => x.kind === "post");
  return (
    <>
      <section className="home-hero">
        <img
          className="hero-photo"
          src={o.heroImage}
          alt="Schoolchildren smiling together — illustrative photograph"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="container hero-inner">
          <div className="hero-copy">
            <p className="eyebrow">
              <span className="small-line" /> PEOPLE. PURPOSE. POSSIBILITY.
            </p>
            <h1>
              {o.heroTitle.split("\n").map((line: string, i: number) => (
                <span key={i}>{line}</span>
              ))}
            </h1>
            <p>{o.heroText}</p>
            <div className="hero-buttons">
              <ButtonLink href="/donate/">Make a difference</ButtonLink>
              <a className="hero-secondary" href="/become-a-volunteer/">
                Become a volunteer <ArrowUpRight size={19} />
              </a>
            </div>
            <div className="hero-caption">
              <span className="leaf-seal">
                <Sprout size={22} />
              </span>
              <p>
                Small acts. Lasting change.
                <small>Community is where it begins.</small>
              </p>
            </div>
          </div>
          <a href="/our-work/" className="hero-image-label">
            <span>BETTER, TOGETHER</span>
            <p>
              Every possibility starts
              <br />
              with a little belief.
            </p>
            <span className="hero-round">
              <ArrowUpRight size={22} />
            </span>
          </a>
        </div>
        <span className="hero-photo-credit">
          Illustrative photography · Church of the King / Unsplash
        </span>
      </section>
      <section className="foundation-strip">
        <div className="container">
          <div className="strip-intro">
            <Sprout size={30} strokeWidth={1.3} />
            <span>
              A shared purpose.
              <br />
              <strong>A lasting commitment.</strong>
            </span>
          </div>
          <div>
            <strong>2015</strong>
            <span>Foundation registration year*</span>
          </div>
          <div>
            <strong>8</strong>
            <span>Connected focus areas</span>
          </div>
          <div>
            <strong>People first.</strong>
            <span>At the heart of everything</span>
          </div>
          <a href="/about/">
            Get to know WBF <ArrowUpRight size={19} />
          </a>
        </div>
      </section>
      <section className="section container intro-section">
        <div className="intro-images">
          <img
            src="/images/women.jpg"
            alt="Woman in a vibrant sari — illustrative photograph"
            loading="lazy"
          />
          <div className="intro-inset">
            <img
              src="/images/education.jpg"
              alt="Children learning together — illustrative photograph"
              loading="lazy"
            />
          </div>
          <div className="image-note">
            <span>Growing stronger.</span>
            <em>Together.</em>
          </div>
        </div>
        <div className="intro-copy">
          <p className="eyebrow">WHO WE ARE</p>
          <h2>
            Change begins
            <br />
            with <em>all of us.</em>
          </h2>
          <p className="lead">
            We believe everyone deserves the chance to build a life of dignity
            and possibility.
          </p>
          <p>
            At Well Being Foundation, we work alongside communities to turn that
            belief into everyday action. From learning and well-being to skills
            and livelihoods, our work connects people with opportunities to
            thrive.
          </p>
          <div className="intro-principles">
            <span>
              <Check size={16} /> Community-led action
            </span>
            <span>
              <Check size={16} /> Inclusive opportunity
            </span>
            <span>
              <Check size={16} /> Sustainable progress
            </span>
          </div>
          <ButtonLink href="/about/" secondary>
            Discover our story
          </ButtonLink>
        </div>
      </section>
      <section className="section focus-section">
        <div className="container">
          <SectionTitle
            label="WHERE WE FOCUS"
            title="Many paths. One shared purpose."
            description="Eight connected areas of work. One belief in a better future for every community."
            link="Explore our work"
            href="/our-work/"
          />
          <ProgramGrid items={programs} />
        </div>
      </section>
      <section className="approach-feature">
        <div className="approach-visual">
          <img
            src="/images/community.jpg"
            alt="Community gathering — illustrative photograph"
            loading="lazy"
          />
          <span>WITH COMMUNITIES. FOR COMMUNITIES.</span>
        </div>
        <div className="approach-copy">
          <p className="eyebrow">HOW CHANGE HAPPENS</p>
          <h2>
            Listen closely.
            <br />
            Work together.
            <br />
            <em>Grow, sustainably.</em>
          </h2>
          <p>
            Meaningful change starts by understanding what matters to people. We
            listen, collaborate, and build practical solutions that communities
            can make their own.
          </p>
          <ButtonLink href="/our-approach/" light>
            Our approach
          </ButtonLink>
        </div>
      </section>
      <section className="section container">
        <SectionTitle
          label="VOICES & UPDATES"
          title="Stories of possibility."
          description="Ideas, initiatives, and updates from the foundation."
          link="All news & stories"
          href="/blog/"
        />
        <StoryCards items={posts.slice(0, 3)} />
      </section>
      <section className="section container tight-top">
        <SectionTitle
          label="COME TOGETHER"
          title="Make time for community."
          link="Explore all events"
          href="/events/"
        />
        <div className="home-events">
          {content
            .filter(
              (x) =>
                x.kind === "event" &&
                new Date(x.data.end).getTime() > Date.now(),
            )
            .slice(0, 2)
            .map((e) => (
              <a href={"/events/" + e.slug + "/"} key={e.id}>
                <div className="date-tile">
                  <strong>{new Date(e.data.start).getDate()}</strong>
                  <span>
                    {new Date(e.data.start).toLocaleDateString("en-IN", {
                      month: "short",
                    })}
                  </span>
                </div>
                <div>
                  <h3>{e.title}</h3>
                  <p>
                    {e.data.location} · Until {niceDate(e.data.end)}
                  </p>
                </div>
                <ArrowUpRight size={19} />
              </a>
            ))}
        </div>
      </section>
      <section className="involvement-section container">
        <div>
          <p className="eyebrow">YOUR PLACE IN THE STORY</p>
          <h2>
            Good things happen
            <br />
            when we come together.
          </h2>
          <p>
            There’s more than one way to make a difference.
            <br />
            Find the one that feels right for you.
          </p>
          <a className="text-link" href="/our-team/">
            Meet the people behind the work <ArrowUpRight size={16} />
          </a>
        </div>
        <div className="involvement-links">
          {[
            [
              "01",
              "Give your time",
              "Volunteer with our community",
              "/become-a-volunteer/",
            ],
            [
              "02",
              "Share your expertise",
              "Explore internships and careers",
              "/careers/",
            ],
            [
              "03",
              "Build a partnership",
              "Create meaningful change together",
              "/csr-partnerships/",
            ],
          ].map(([n, title, text, href]) => (
            <a href={href} key={n}>
              <span>{n}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
              <ArrowUpRight size={23} />
            </a>
          ))}
        </div>
      </section>
      <CTABand />
    </>
  );
}
