import { publicData } from "@/lib/server/public";
import { routeTitles, contentPath } from "@/lib/content";
import { escapeHtml } from "@/lib/server/security";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const data = await publicData();
  const base = new URL(req.url).origin;
  const excluded = [
    "user",
    "login",
    "register",
    "forgot-password",
    "reset-password",
    "verify-email",
    "search",
    "product",
    "document",
  ];
  const paths = [
    "/",
    ...Object.keys(routeTitles)
      .filter((x) => !excluded.includes(x))
      .map((x) => "/" + x + "/"),
    ...data.content
      .filter((x) => ["program", "post", "event", "job"].includes(x.kind))
      .map(contentPath),
  ];
  return new Response(
    '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' +
      paths
        .map((p) => "<url><loc>" + escapeHtml(base + p) + "</loc></url>")
        .join("") +
      "</urlset>",
    { headers: { "Content-Type": "application/xml" } },
  );
}
