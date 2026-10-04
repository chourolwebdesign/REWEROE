import { cn } from "@/lib/utils";

/** Belegte Angaben des Markts – nur Aussagen, die auch auf der Seite belegt sind. */
const ITEMS = [
  "Mo – Sa · 7 – 22 Uhr",
  "Thudichumstraße 18–22",
  "Bäckerei im Markt",
  "Sushi im Markt",
  "Aus deiner Region",
  "REWE Bio",
  "Instagram @rewealialamyaar",
];

/**
 * Markenband unter dem Story-Hero: eine ruhig laufende Zeile mit den belegten Angaben des Markts.
 * Reine Zier – pausiert beim Zeigen und steht bei `prefers-reduced-motion` still.
 */
export function MarqueeBand({ className }: { className?: string }) {
  const item =
    "flex items-center gap-8 text-[0.8125rem] font-semibold tracking-[0.2em] whitespace-nowrap text-white/80 uppercase";

  return (
    <div className={cn("on-dark marquee-viewport relative overflow-hidden border-y border-white/10 bg-night py-5 text-white", className)}>
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-night to-transparent md:w-28" />
      <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-night to-transparent md:w-28" />
      <div className="marquee-track flex w-max">
        {[0, 1].map((group) => (
          <ul key={group} aria-hidden={group === 1 || undefined} className="flex items-center gap-8 pr-8">
            {ITEMS.map((label) => (
              <li key={label} className={item}>
                {label}
                <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-red-bright" />
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
}