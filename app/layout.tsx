import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { LegStatusProvider } from "@/components/layout/LegStatusProvider";
import { MetaPixel } from "@/components/layout/MetaPixel";
import { Ticker } from "@/components/layout/Ticker";
import { getLegs, getSite } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";
import { computeStatuses } from "@/lib/status";
import "./globals.css";

const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-barlow-condensed",
  display: "swap",
});
const sans = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Re-generate pages hourly on Vercel so build-time leg statuses stay fresh.
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const site = getSite();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${site.name} — ${site.fullName}`, template: `%s | ${site.name}` },
    description: site.description,
    applicationName: site.name,
    openGraph: { siteName: site.name, locale: "en_PH", type: "website" },
    twitter: { card: "summary_large_image" },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = { themeColor: "#0B1F4B", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const site = getSite();
  const legs = getLegs().map((l) => ({ slug: l.slug, round: l.round, dates: l.dates, statusOverride: l.statusOverride, name: l.name, province: l.province }));
  return (
    <html lang="en-PH" className={`${display.variable} ${sans.variable}`}>
      <body className="min-h-dvh">
        <a href="#main" className="sr-only z-[100] bg-gold px-4 py-2 font-bold text-navy focus:not-sr-only focus:fixed focus:left-2 focus:top-2">
          Skip to content
        </a>
        <LegStatusProvider legs={legs} initial={computeStatuses(legs)}>
          <Header nav={site.nav} logo={site.logo} logoAlt={site.logoAlt} social={site.social} fullName={site.fullName} />
          <Ticker />
          <main id="main">{children}</main>
        </LegStatusProvider>
        <Footer />
        <MetaPixel />
      </body>
    </html>
  );
}
