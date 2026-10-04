import Image from "next/image";
import { Croissant, Fish } from "lucide-react";
import { markt } from "@/content/markt";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";

const ICONS = { baeckerei: Croissant, sushi: Fish } as const;

/**
 * „Bei uns im Markt“: belegte Services (rewe.de) und die REWE-Marken für Regionales und Bio.
 * Die Markentexte beschreiben nur, was die Zeichen bedeuten – keine Aussagen über Sortimentsanteile.
 */
export function Highlights({ className }: { className?: string }) {
  const brandCard = "relative overflow-hidden rounded-[1.75rem] bg-soft";
  return (
    <div className={cn("grid gap-3 md:grid-cols-2 md:gap-4 lg:grid-cols-12", className)}>
      {/* Aus deiner Region */}
      <article className={cn(brandCard, "reveal min-h-[26rem] text-white md:row-span-2 lg:col-span-6 lg:min-h-[36rem]")}>
        <Image src={media["regional-bauer"].src} alt={media["regional-bauer"].alt} fill sizes="(min-width: 64rem) 50vw, 100vw" quality={70} className="object-cover" />
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
          <Image src={media["logo-aus-deiner-region"].src} alt={media["logo-aus-deiner-region"].alt} sizes="180px" className="h-auto w-40 md:w-44" />
          <h3 className="mt-5 text-h3">Frisch aus der Nachbarschaft</h3>
          <p className="mt-2 max-w-[40ch] text-white/85">Das gelbe Schild mit dem Traktor zeigt dir im Markt Produkte von Erzeugern aus der Region.</p>
        </div>
      </article>

      {/* REWE Regional */}
      <article className={cn(brandCard, "reveal grid grid-rows-[12rem_auto] lg:col-span-3")}>
        <div className="relative">
          <Image src={media["regional-label"].src} alt={media["regional-label"].alt} fill sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 50vw, 100vw" quality={70} className="object-cover" />
        </div>
        <div className="p-6">
          <h3 className="text-h3">REWE Regional</h3>
          <p className="mt-2 text-muted">Die REWE-Eigenmarke für Produkte aus deiner Region.</p>
        </div>
      </article>

      {/* REWE Bio */}
      <article className={cn(brandCard, "reveal grid grid-rows-[12rem_auto] lg:col-span-3")}>
        <div className="relative">
          <Image src={media["bio-produkte"].src} alt={media["bio-produkte"].alt} fill sizes="(min-width: 64rem) 25vw, (min-width: 48rem) 50vw, 100vw" quality={70} className="object-cover" />
          <span className="absolute top-4 left-4 rounded-xl bg-white p-2 shadow-[var(--shadow-soft)]">
            <Image src={media["logo-rewe-bio"].src} alt={media["logo-rewe-bio"].alt} sizes="120px" className="h-auto w-24" />
          </span>
        </div>
        <div className="p-6">
          <h3 className="text-h3">REWE Bio</h3>
          <p className="mt-2 text-muted">Die Bio-Eigenmarke von REWE, zertifiziert nach der EU-Öko-Verordnung.</p>
        </div>
      </article>

      {/* Services laut REWE-Marktseite */}
      {markt.services.map((s) => {
        const Icon = ICONS[s.id as keyof typeof ICONS] ?? Croissant;
        return (
          <article key={s.id} className="reveal flex flex-col justify-between gap-10 rounded-[1.75rem] bg-ink p-6 text-white lg:col-span-3">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/10">
              <Icon className="size-7 text-red-bright" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="text-[0.875rem] font-semibold text-white/60">Im Markt</p>
              <h3 className="mt-1 text-h3">{s.name}</h3>
              <p className="mt-2 text-white/75">{s.text}</p>
            </div>
          </article>
        );
      })}
    </div>
  );
}
