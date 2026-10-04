import Image from "next/image";
import { Croissant, Fish } from "lucide-react";
import { markt } from "@/content/markt";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";

const ICONS = { baeckerei: Croissant, sushi: Fish } as const;

/**
 * „Bei uns im Markt“: die REWE-Marken für Regionales und Bio sowie die belegten Services (rewe.de).
 * Alle Karten haben dieselben Aufbau – Bild- oder Symbolfeld oben, Text unten – damit das Raster ruhig bleibt.
 */
export function Highlights({ className }: { className?: string }) {
  const card = "reveal flex flex-col overflow-hidden rounded-[var(--radius-media)] bg-soft";
  const body = "flex flex-1 flex-col p-6 md:p-7";

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 md:gap-4 lg:grid-cols-4", className)}>
      {/* REWE Regional */}
      <article className={card}>
        <div className="relative aspect-[5/4] bg-soft-2">
          <Image
            src={media["regional-label"].src}
            alt={media["regional-label"].alt}
            fill
            sizes="(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw"
            quality={72}
            className="object-cover"
          />
        </div>
        <div className={body}>
          <h3 className="text-h3">REWE Regional</h3>
          <p className="mt-2 text-muted">Die REWE-Eigenmarke für Produkte aus deiner Region.</p>
        </div>
      </article>

      {/* REWE Bio */}
      <article className={card}>
        <div className="relative aspect-[5/4] bg-soft-2">
          <Image
            src={media["bio-produkte"].src}
            alt={media["bio-produkte"].alt}
            fill
            sizes="(min-width: 64rem) 25vw, (min-width: 40rem) 50vw, 100vw"
            quality={72}
            className="object-cover"
          />
          <span className="absolute top-4 left-4 rounded-xl bg-white p-2 shadow-[var(--shadow-soft)]">
            <Image src={media["logo-rewe-bio"].src} alt={media["logo-rewe-bio"].alt} sizes="120px" className="h-auto w-20" />
          </span>
        </div>
        <div className={body}>
          <h3 className="text-h3">REWE Bio</h3>
          <p className="mt-2 text-muted">Die Bio-Eigenmarke von REWE, zertifiziert nach der EU-Öko-Verordnung.</p>
        </div>
      </article>

      {/* Services laut REWE-Marktseite */}
      {markt.services.map((s) => {
        const Icon = ICONS[s.id as keyof typeof ICONS] ?? Croissant;
        return (
          <article key={s.id} className={card}>
            <div className="relative grid aspect-[5/4] place-items-center bg-ink">
              <span aria-hidden className="absolute -right-10 -bottom-12 size-40 rounded-full bg-red/25 blur-3xl" />
              <span className="relative grid size-20 place-items-center rounded-3xl bg-white/10 ring-1 ring-inset ring-white/15">
                <Icon className="size-9 text-white" strokeWidth={1.6} aria-hidden />
              </span>
            </div>
            <div className={body}>
              <p className="text-eyebrow text-red">Im Markt</p>
              <h3 className="mt-2 text-h3">{s.name}</h3>
              <p className="mt-2 text-muted">{s.text}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}