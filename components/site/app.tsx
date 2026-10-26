"use client";
import { useEffect } from "react";
import { authenticPhoto } from "@/lib/photography";
import { SiteProvider, type SiteData } from "./context";
import { Header, Footer } from "./shell";
import { Home } from "./home";
import {
  About,
  Work,
  Approach,
  Impact,
  Team,
  Involved,
  Contact,
  Listings,
  Detail,
  Resources,
  Gallery,
  Utility,
  SearchPage,
  DocumentList,
} from "./pages";
import { AuthForm } from "../forms/auth";
import { DonateForm } from "../forms/donate";
import { ApplicationForm } from "../forms/application";
import { Account } from "../forms/account";
import { Store } from "./store";
import { Admin } from "../admin/dashboard";
import { PageHero, Empty, CTABand, ButtonLink } from "./shared";
export function Site({
  data,
  path = "/",
  query = {},
}: {
  data: SiteData;
  path?: string;
  query?: Record<string, string>;
}) {
  const parts = path.split("/").filter(Boolean),
    page = parts[0] || "home";
  let screen: React.ReactNode;
  useEffect(() => {
    document.documentElement.dataset.hydrated = "true";
    const listener = (e: KeyboardEvent) => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return;
      if (e.key === "Escape") {
        (
          dialog.querySelector('[aria-label^="Close"]') as HTMLButtonElement
        )?.click();
      }
      if (e.key === "Tab") {
        const all = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex="0"]',
          ),
        );
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => document.removeEventListener("keydown", listener);
  }, []);
  if (page === "admin")
    return (
      <SiteProvider data={data}>
        <Admin section={parts[1] || "overview"} />
      </SiteProvider>
    );
  // Retire former design-reference images without overwriting CMS content.
  data = {
    ...data,
    content: data.content.map((entry) => ({
      ...entry,
      image: entry.image ? authenticPhoto(entry.image) : entry.image,
      data: {
        ...entry.data,
        ...(entry.data.sections
          ? {
              sections: entry.data.sections.map((section: any) => ({
                ...section,
                image: section.image
                  ? authenticPhoto(section.image)
                  : section.image,
              })),
            }
          : {}),
      },
    })),
  };
  const detailKind =
    page === "focus-areas"
      ? "program"
      : page === "blog"
        ? "post"
        : page === "careers"
          ? "job"
          : page === "events"
            ? "event"
            : "";
  const item = data.content.find(
    (x) => x.kind === detailKind && x.slug === (parts[1] || query.slug),
  );
  const custom = data.content.find((x) => x.kind === "page" && x.slug === page);
  if (item) screen = <Detail item={item} />;
  else if (custom)
    screen = (
      <>
        <PageHero
          title={custom.title}
          description={custom.summary}
          image={custom.image || undefined}
        />
        <section className="section container narrow prose">
          {custom.body.split("\n\n").map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
        {(custom.data.sections || [])
          .filter((s: any) => s.visible)
          .map((s: any) => (
            <section key={s.id} className={"section cms-section cms-" + s.type}>
              <div className="container">
                {s.type === "image" && s.image && (
                  <img src={s.image} alt={s.title} loading="lazy" />
                )}
                <div>
                  <h2>{s.title}</h2>
                  {s.body.split("\n\n").map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                  {s.link && (
                    <ButtonLink href={s.link} secondary>
                      {s.linkLabel || "Learn more"}
                    </ButtonLink>
                  )}
                </div>
              </div>
            </section>
          ))}
      </>
    );
  else if (page === "home") screen = <Home />;
  else if (page === "about") screen = <About />;
  else if (page === "our-work" || page === "focus-areas") screen = <Work />;
  else if (page === "our-approach") screen = <Approach />;
  else if (page === "our-impact") screen = <Impact />;
  else if (page === "our-team") screen = <Team />;
  else if (page === "get-involved") screen = <Involved />;
  else if (
    page === "volunteering-internships" ||
    (page === "internships" && !parts[1])
  )
    screen = <Involved internships />;
  else if (
    page === "become-a-volunteer" ||
    (page === "internships" && parts[1] === "apply")
  )
    screen = (
      <>
        <PageHero
          eyebrow={
            page === "internships"
              ? "INTERNSHIP APPLICATION"
              : "BECOME A VOLUNTEER"
          }
          title="A little of you can mean a lot."
          description="Share your time, your skills, and your care. Let’s find where you can make a difference."
          image="/images/volunteering.jpg"
        />
        <section className="section container">
          <ApplicationForm
            kind={page === "internships" ? "internship" : "volunteer"}
          />
        </section>
      </>
    );
  else if (
    [
      "login",
      "register",
      "forgot-password",
      "reset-password",
      "verify-email",
    ].includes(page)
  )
    screen = <AuthForm mode={page} />;
  else if (page === "user") screen = <Account />;
  else if (page === "donate" || page === "donate-now") screen = <DonateForm />;
  else if (page === "contact" || page === "csr-partnerships")
    screen = <Contact partnership={page === "csr-partnerships"} />;
  else if (["blog", "careers", "events"].includes(page))
    screen = <Listings kind={detailKind} />;
  else if (["photos", "gallery", "videos"].includes(page))
    screen = <Gallery video={page === "videos"} />;
  else if (
    [
      "resources",
      "profile",
      "reports",
      "financials",
      "license",
      "policies",
      "tax-exemptions",
      "content",
    ].includes(page)
  )
    screen = <Resources page={page} />;
  else if (page === "store" || page === "product")
    screen = <Store slug={query.slug} />;
  else if (page === "search")
    screen = <SearchPage initialQuery={query.q || ""} />;
  else if (page === "document") {
    const doc = data.content.find(
      (x) =>
        x.kind === "document" &&
        (x.data.url === query.file ||
          x.data.url === "https://wbfngo.org" + query.file),
    );
    screen = (
      <>
        <PageHero title={doc?.title || "Document library"} compact />
        <section className="section container">
          {doc ? (
            <DocumentList items={[doc]} />
          ) : (
            <Empty
              title="Choose a published document"
              text="Only approved source documents can be opened here."
              href="/resources/"
              label="Browse resources"
            />
          )}
        </section>
      </>
    );
  } else screen = <Utility page={page} />;
  return (
    <SiteProvider data={data}>
      <div className="wbf-public-site">
        <Header path={path} />
        <main id="main-content">{screen}</main>
        <Footer />
      </div>
    </SiteProvider>
  );
}
