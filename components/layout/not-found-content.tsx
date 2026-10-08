import { PageHeader } from "@/components/layout/page-header";
import { ButtonLink } from "@/components/ui/button";

/**
 * Inhalt der 404-Seite: roter Kopf wie die Unterseiten (die Leiste darüber ist transparent, nie weiß auf weiß) und drei Wege weiter.
 * Prospekt-Knöpfe führen auf die eigene Prospektseite – die 404 wird beim Build erzeugt, ein eingefrorener Link wäre später falsch;
 * /angebote verweist ohne Prospekt selbst zu rewe.de.
 */
export const NOT_FOUND_FLYER = { href: "/angebote#prospekt", external: false };

export function NotFoundContent() {
  return (
    <>
      <PageHeader tone="red" mark="404" eyebrow="404" title="Diese Seite gibt es nicht (mehr)." lede="Vielleicht hilft dir eine dieser Seiten weiter:" />
      <section aria-label="Weiter" className="wrap pb-20">
        <div className="cta-row">
          <ButtonLink href="/">Zur Startseite</ButtonLink>
          <ButtonLink href={NOT_FOUND_FLYER.href} variant="soft">
            Prospekt der Woche
          </ButtonLink>
          <ButtonLink href="/kontakt" variant="soft">
            Öffnungszeiten & Anfahrt
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
