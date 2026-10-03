import { useLocale } from "next-intl";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

/** The little deposit chip no premium grocer shows — ours does. */
export function PfandChip({ amount, className }: { amount: number; className?: string }) {
  const locale = useLocale();
  return (
    <span className={cn("mono inline-flex items-center gap-1 rounded-[3px] border border-emerald/40 bg-emerald/10 px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-emerald", className)} title="Pfand">
      <svg width="10" height="12" viewBox="0 0 10 12" aria-hidden className="fill-current"><path d="M3.5 0h3v2.2c1.3.6 2 1.8 2 3.2V11a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1V5.4c0-1.4.7-2.6 2-3.2V0z"/></svg>
      Pfand {formatPrice(amount, locale)}
    </span>
  );
}
