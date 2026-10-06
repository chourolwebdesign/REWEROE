import Image from "next/image";
import { Croissant, Fish } from "lucide-react";
import { markt } from "@/content/markt";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";

const ICONS = { baeckerei: Croissant, sushi: Fish } as const;

/**
 * „Bei uns im Markt“: die REWE-Marken für Regionales und Bio sowie die belegten Services (rewe.de).
 * Alle Karten haben denselben Aufbau – Bild- oder Symbolfeld oben, Text unten – damit das Raster ruhig bleibt.
 * Vier Spalten erst ab 1280 px; darunter stehen Regional und Bio nebeneinander und die Service-Karte darunter.
 */
export function Highlights({ row = false, className }: { row?: boolean; className?: string }) {
  // `row`: unter 768 px eine waagerechte Reihe zum Wischen (Startseite), jede Karte 84 % breit
  const inRow = row && "max-md:w-[84%] max-md:shrink-0 max-md:snap-start";
  const card = cn("reveal flex flex-col overflow-hidden rounded-[var(--radius-media)] bg-soft", inRow);
  const body = "flex flex-1 flex-col p-6 md:p-7";

  return (
    // Als Reihe scrollt der Bereich waagerecht, enthält aber keine Links: SnapRows macht ihn dann zum fokussierbaren, benannten
    // Bereich (nur solange er scrollt). Karten nicht auf die höchste strecken – sonst bleibt unter Regional und Bio Leerraum.
    <div
      data-snap-row={row || undefined}
      data-snap-region={row ? "Regional, Bio und frisch gebacken" : undefined}
      className={cn(row ? "max-md:snap-row max-md:items-start md:grid md:grid-cols-2 md:gap-4 xl:grid-cols-4" : "grid gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4", className)}
    >
      {/* REWE Regional */}
      <article className={card}>
        <div className="relative aspect-[16/10] bg-soft-2 xl:aspect-[5/4]">
          <Image
            src={media["regional-label"].src}
            alt={media["regional-label"].alt}
            fill
            sizes={row ? "(min-width: 80rem) 320px, (min-width: 48rem) 50vw, 84vw" : "(min-width: 80rem) 320px, (min-width: 40rem) 50vw, 100vw"}
            quality={85}
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
        <div className="relative aspect-[16/10] bg-soft-2 xl:aspect-[5/4]">
          <Image
            src={media["bio-produkte"].src}
            alt={media["bio-produkte"].alt}
            fill
            sizes={row ? "(min-width: 80rem) 320px, (min-width: 48rem) 50vw, 84vw" : "(min-width: 80rem) 320px, (min-width: 40rem) 50vw, 100vw"}
            quality={85}
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

      {/* Services laut REWE-Marktseite – eine Karte statt zweier leerer Bildfelder */}
      <article className={cn("reveal on-dark relative flex flex-col overflow-hidden rounded-[var(--radius-media)] bg-ink p-6 text-white md:p-9", row ? "md:col-span-2" : "sm:col-span-2", inRow)}>
        <span aria-hidden className="pointer-events-none absolute -right-16 -bottom-20 size-72 rounded-full bg-red/30 blur-3xl" />
        <div className="relative">
          <p className="text-eyebrow text-red-bright">Im Markt</p>
          <h3 className="mt-3 font-display text-[clamp(1.75rem,1.3rem+1.6vw,2.5rem)] leading-[1.02] font-extrabold tracking-[-0.03em]">Frisch für dich da.</h3>
        </div>
        <ul className="relative mt-8 grid gap-4 sm:grid-cols-2 md:mt-auto md:pt-10">
          {markt.services.map((s) => {
            const Icon = ICONS[s.id as keyof typeof ICONS] ?? Croissant;
            return (
              <li key={s.id} className="flex items-start gap-4 rounded-2xl bg-white/[0.06] p-4 ring-1 ring-inset ring-white/10 md:p-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-red text-white">
                  <Icon className="size-7" strokeWidth={1.75} aria-hidden />
                </span>
                <div>
                  <p className="font-display text-[1.375rem] leading-tight font-bold">{s.name}</p>
                  <p className="mt-1 text-white/75">{s.text}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </article>
    </div>
  );
}
