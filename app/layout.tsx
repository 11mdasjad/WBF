import type { Metadata } from "next";
import "./globals.css";
import "./glass.css";
import "./typography.css";
import "./portal.css";
import "./navigation.css";
import "./brand.css";
import "./home-banner.css";
import "./about-banner.css";
import "./location.css";
import "./page-theme.css";
export const metadata: Metadata = {
  metadataBase: new URL("https://wbf-community.dwellmartuae.chatgpt.site"),
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
