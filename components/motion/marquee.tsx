import { cn } from "@/lib/utils";

export function Marquee({ items, className }: { items: string[]; className?: string }) {
  const row = [...items, ...items];
  return (
    <div className={cn("marquee overflow-hidden border-y border-line/60", className)} aria-hidden>
      <div className="marquee-track flex w-max items-center gap-10 py-3 pr-10">
        {row.map((it, i) => (
          <span key={i} className="mono flex items-center gap-10 text-xs tracking-[0.22em] uppercase">
            <span>{it}</span>
            <span className="h-1 w-1 rounded-full bg-gold" />
          </span>
        ))}
      </div>
    </div>
  );
}
