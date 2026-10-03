import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export function Rating({ value, count, className, showCount = true }: { value: number; count?: number; className?: string; showCount?: boolean }) {
  const t = useTranslations("common");
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-label={t("rating", { rating: value })}>
      <span className="relative inline-block h-3.5 w-[74px] leading-none" aria-hidden>
        <span className="absolute inset-0 text-[13px] tracking-[1px] text-line">★★★★★</span>
        <span className="absolute inset-0 overflow-hidden text-[13px] tracking-[1px] text-gold" style={{ width: `${pct}%` }}>★★★★★</span>
      </span>
      <span className="mono text-[11px] text-ink-muted">{value.toFixed(1)}{showCount && count != null ? ` (${count})` : ""}</span>
    </span>
  );
}
