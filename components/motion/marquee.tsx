import { cn } from "@/lib/utils";

interface Props {
  items: string[];
  className?: string;
  /** Accessible name of the list (it is content now, not decoration). */
  label?: string;
}

/**
 * Static data line (§4.6) — no animation. Sentence-case values from `settings.marquee`, separated by a 4×4 px red
 * square (the logo box in miniature); horizontal scroll-snap on small screens, spread across the row on md+.
 */
export function Marquee({ items, className, label }: Props) {
  return (
    <div className={cn("border-y border-line", className)}>
      <div className="container-x">
        <ul className="hide-scrollbar flex snap-x gap-x-10 overflow-x-auto py-3 md:justify-between" aria-label={label}>
          {items.map((it, i) => (
            <li key={i} className="inline-flex shrink-0 snap-start items-center gap-10 text-[13px] font-medium tracking-[0.02em] text-ink">
              <span>{it}</span>
              {i < items.length - 1 && <span className="h-1 w-1 bg-red" aria-hidden />}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
