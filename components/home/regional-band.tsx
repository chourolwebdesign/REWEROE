import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { media } from "@/lib/media";

/**
 * „Aus deiner Region“ – redaktionelles Band: dunkle Textseite neben echtem Bild von der Anlieferung.
 * Belegte Aussage (rewe.de): Das gelbe Schild mit dem Traktor kennzeichnet Produkte von Erzeugern aus der Region.
 */
export function RegionalBand({ className }: { className?: string }) {
  return (
    <section aria-labelledby="region-titel" className={className}>
      <div className="grid overflow-hidden rounded-[var(--radius-stage)] bg-ink text-white lg:grid-cols-[1.05fr_1fr]">
        <div className="relative flex flex-col justify-center p-8 md:p-12 lg:p-16">
          <span aria-hidden className="pointer-events-none absolute -top-24 -left-20 size-80 rounded-full bg-red/30 blur-3xl" />
          <div className="relative">
            <p className="text-eyebrow text-red-bright">Aus deiner Region</p>
            <h2 id="region-titel" className="mt-4 text-h2">
              Frisch aus der Nachbarschaft.
            </h2>
            <p className="mt-5 max-w-[46ch] text-lede text-white/75">
              Das gelbe Schild mit dem Traktor zeigt dir im Markt Produkte von Erzeugern aus der Region.
            </p>
            <div className="cta-row mt-8">
              <ButtonLink href="/markt" variant="white" size="lg">
                Unser Markt
              </ButtonLink>
              <ButtonLink href="/angebote" variant="glass" size="lg">
                Angebote der Woche
              </ButtonLink>
            </div>
          </div>
        </div>

        <div className="relative min-h-[20rem] lg:min-h-[34rem]">
          <Image
            src={media["regional-lieferung"].src}
            alt={media["regional-lieferung"].alt}
            fill
            sizes="(min-width: 64rem) 50vw, 100vw"
            quality={85}
            className="object-cover"
          />
          <span aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent lg:bg-gradient-to-r lg:from-black/45 lg:via-transparent lg:to-transparent" />
          <span className="absolute bottom-5 left-5 rounded-2xl bg-white/95 p-3 shadow-[var(--shadow-soft)]">
            <Image
              src={media["logo-aus-deiner-region"].src}
              alt={media["logo-aus-deiner-region"].alt}
              sizes="180px"
              className="h-auto w-36 md:w-40"
            />
          </span>
        </div>
      </div>
    </section>
  );
}
