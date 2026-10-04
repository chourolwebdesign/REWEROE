import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { markt } from "@/content/markt";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <div className="wrap grid min-h-[70svh] content-center py-20">
      <p className="text-eyebrow flex items-center gap-2.5 text-red">
        <span aria-hidden className="h-px w-6 shrink-0 bg-red/45" />
        404
      </p>
      <h1 className="mt-4 max-w-[16ch] text-h1">Diese Seite gibt es nicht (mehr).</h1>
      <p className="mt-5 max-w-[46ch] text-lede text-muted">Vielleicht hilft dir eine dieser Seiten weiter:</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Zur Startseite</ButtonLink>
        <ButtonLink href={markt.links.flyer} external variant="soft">
          Prospekt der Woche
        </ButtonLink>
        <ButtonLink href="/kontakt" variant="soft">
          Öffnungszeiten & Anfahrt
        </ButtonLink>
      </div>
    </div>
  );
}
