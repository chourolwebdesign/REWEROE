import { MobileBar } from "@/components/layout/mobile-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { ServiceWorker } from "@/components/pwa/service-worker";
import { ldScript, storeJsonLd } from "@/lib/jsonld";

/** Stündlich neu bauen: Prospektwoche, Feiertage im JSON-LD und Jahreszahl bleiben aktuell. */
export const revalidate = 3600;

/** Rahmen aller öffentlichen Seiten. Das Cockpit (app/cockpit) hat einen eigenen. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <MobileBar />
      <RevealObserver />
      <ServiceWorker />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(storeJsonLd())} />
    </>
  );
}
