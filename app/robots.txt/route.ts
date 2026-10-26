export function GET(req: Request) {
  return new Response(
    "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /user/\nDisallow: /api/\nSitemap: " +
      new URL("/sitemap.xml", req.url) +
      "\n",
    { headers: { "Content-Type": "text/plain" } },
  );
}
