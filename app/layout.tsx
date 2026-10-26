import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.WBF_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:5173"),
  ),
  title: {
    default: "Well Being Foundation — Growing Together",
    template: "%s | Well Being Foundation",
  },
  description:
    "A community-centered foundation working across education, health, women’s empowerment and sustainable development.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Well Being Foundation",
    description: "People. Purpose. Possibility.",
    type: "website",
    images: ["/images/hero.jpg"],
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
