import type { Metadata, Viewport } from "next";
import { JsClass } from "@/components/motion/js-class";
import { INDEXABLE, ogImagePath, SITE_NAME, SITE_URL } from "@/lib/site";
import { display } from "./fonts";
import "./globals.css";

const description =
  "Dein REWE in der Thudichumstraße 18–22 in Frankfurt-Rödelheim: Montag bis Samstag 7 bis 22 Uhr, Prospekt der Woche, Bäckerei und Sushi im Markt.";

const homeTitle = "REWE Rödelheim – Dein Markt in der Thudichumstraße";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: homeTitle, template: `%s · ${SITE_NAME}` },
  description,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  // Startseite; Unterseiten setzen eigene Vorschauen über pageMetadata() (lib/site.ts)
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: SITE_NAME,
    url: "/",
    title: homeTitle,
    description,
    images: [{ url: ogImagePath("start"), width: 1200, height: 630, alt: homeTitle }],
  },
  robots: INDEXABLE ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={display.variable} suppressHydrationWarning>
      <body>
        {/* Vor dem ersten Paint: Einblend-Animationen nur mit JS (siehe .reveal in globals.css) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
        <JsClass />
      </body>
    </html>
  );
}
