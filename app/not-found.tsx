import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false },
};

export default function NotFound() {
  // liegt außerhalb von app/(site) – Kopf und Footer deshalb hier selbst. Die Seite wird beim Build erzeugt: Prospekt-Knöpfe führen
  // deshalb auf die eigene Prospektseite (die ohne Prospekt selbst zu rewe.de verweist), nicht auf einen beim Build eingefrorenen Link.
  const flyer = { href: "/angebote#prospekt", external: false };
  return (
    <>
      <SiteHeader flyer={flyer} hero={false} />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        <div className="wrap grid min-h-[70svh] content-center py-20">
          <p className="text-eyebrow flex items-center gap-2.5 text-red">
            <span aria-hidden className="h-px w-6 shrink-0 bg-red/45" />
            404
          </p>
          <h1 className="mt-4 max-w-[16ch] text-h1">Diese Seite gibt es nicht (mehr).</h1>
          <p className="mt-5 max-w-[46ch] text-lede text-muted">Vielleicht hilft dir eine dieser Seiten weiter:</p>
          <div className="cta-row mt-8">
            <ButtonLink href="/">Zur Startseite</ButtonLink>
            <ButtonLink href={flyer.href} variant="soft">
              Prospekt der Woche
            </ButtonLink>
            <ButtonLink href="/kontakt" variant="soft">
              Öffnungszeiten & Anfahrt
            </ButtonLink>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
