import { MobileBar } from "@/components/layout/mobile-bar";
import { HoursProvider } from "@/components/live/hours-provider";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SnapRows } from "@/components/layout/snap-rows";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { ServiceWorker } from "@/components/pwa/service-worker";
import { currentFlyerLink } from "@/lib/data/flyers";
import { hoursConfig } from "@/lib/data/inhalte";
import { ldScript, storeJsonLd } from "@/lib/jsonld";

/** Stündlich neu bauen: Prospektwoche, Feiertage im JSON-LD und Jahreszahl bleiben aktuell. */
export const revalidate = 3600;

/** Rahmen aller öffentlichen Seiten. Das Cockpit (app/cockpit) hat einen eigenen. */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  // „Prospekt“-Knöpfe: zum eigenen Viewer, wenn der Markt einen Prospekt hochgeladen hat, sonst zu rewe.de
  const [flyer, hours] = await Promise.all([currentFlyerLink(), hoursConfig()]);
  return (
    // Sondertage aus dem Cockpit gelten auch für den Live-Status im Browser
    <HoursProvider specialDays={[...hours.specialDays]}>
      <SiteHeader flyer={flyer} />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <MobileBar flyer={flyer} />
      <RevealObserver />
      <SnapRows />
      <ServiceWorker />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(storeJsonLd(new Date(), hours))} />
    </HoursProvider>
  );
}
