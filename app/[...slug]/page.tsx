import { notFound } from "next/navigation";
import { Site } from "@/components/site/app";
import { publicData } from "@/lib/server/public";
import { routeTitles } from "@/lib/content";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const kind = (
    {
      "focus-areas": "program",
      blog: "post",
      careers: "job",
      events: "event",
      product: "product",
    } as Record<string, string>
  )[slug[0]];
  const item =
    slug[1] || query.slug
      ? (await publicData()).content.find(
          (x) => x.kind === kind && x.slug === (slug[1] || query.slug),
        )
      : undefined;
  return {
    title: item?.title || routeTitles[slug[0]] || "WBF Community",
    ...(item
      ? {
          description: item.summary,
          openGraph: {
            title: item.title,
            description: item.summary,
            images: item.image ? [item.image] : ["/images/hero.jpg"],
          },
        }
      : {}),
    robots: [
      "admin",
      "user",
      "login",
      "register",
      "reset-password",
      "verify-email",
    ].includes(slug[0])
      ? { index: false, follow: false }
      : undefined,
    alternates: { canonical: "/" + slug.join("/") + "/" },
  };
}
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string>>;
}) {
  const { slug } = await params;
  const query = await searchParams;
  const data = await publicData();
  if (
    slug[0] !== "admin" &&
    !routeTitles[slug[0]] &&
    !data.content.some((x) => x.kind === "page" && x.slug === slug[0])
  )
    notFound();
  if (
    slug.length > 1 &&
    slug[0] !== "admin" &&
    !(slug[0] === "internships" && slug[1] === "apply") &&
    !data.content.some(
      (x) =>
        x.slug === slug[1] &&
        ["program", "event", "post", "job"].includes(x.kind),
    )
  )
    notFound();
  if (
    slug[0] === "admin" &&
    slug[1] &&
    ![
      "content",
      "applications",
      "donations",
      "store",
      "products",
      "users",
      "media",
      "inbox",
      "notifications",
      "settings",
      "audit",
    ].includes(slug[1])
  )
    notFound();
  return <Site data={data} path={"/" + slug.join("/") + "/"} query={query} />;
}
