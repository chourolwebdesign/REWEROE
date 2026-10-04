import type { Metadata, Viewport } from "next";
import { MobileBar } from "@/components/layout/mobile-bar";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { ServiceWorker } from "@/components/pwa/service-worker";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ldScript, storeJsonLd } from "@/lib/jsonld";
import { INDEXABLE, SITE_URL } from "@/lib/site";
import { display } from "./fonts";
import "./globals.css";

const description =
  "Dein REWE in der Thudichumstraße 18–22 in Frankfurt-Rödelheim: Montag bis Samstag 7 bis 22 Uhr, Prospekt der Woche, Bäckerei und Sushi im Markt.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "REWE Rödelheim – Dein Markt in der Thudichumstraße", template: "%s · REWE Rödelheim" },
  description,
  applicationName: "REWE Rödelheim",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "REWE Rödelheim",
    title: "REWE Rödelheim – Dein Markt in der Thudichumstraße",
    description,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "REWE Rödelheim – Blick in den Markt" }],
  },
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  viewportFit: "cover",
};

/** Stündlich neu bauen: Prospektwoche, Feiertage im JSON-LD und Jahreszahl bleiben aktuell. */
export const revalidate = 3600;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={display.variable} suppressHydrationWarning>
      <body>
        {/* Vor dem ersten Paint: Einblend-Animationen nur mit JS (siehe .reveal in globals.css) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <SiteHeader />
        <main id="inhalt" tabIndex={-1} className="outline-none">
          {children}
        </main>
        <SiteFooter />
        <MobileBar />
        <RevealObserver />
        <ServiceWorker />
        <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(storeJsonLd())} />
      </body>
    </html>
  );
}
