import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/** Stars (§4.13): filled ink, empty track `line-input` (visible at 4.54:1), 13 px; count in `num` 12 px. PDP + quick view only. */
export function Rating({ value, count, className, showCount = true }: { value: number; count?: number; className?: string; showCount?: boolean }) {
  const t = useTranslations("common");
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} role="img" aria-label={t("rating", { rating: value })}>
      <span className="relative inline-block h-3.5 w-[74px] leading-none" aria-hidden>
        <span className="absolute inset-0 text-[13px] tracking-[1px] text-line-input">★★★★★</span>
        <span className="absolute inset-0 overflow-hidden text-[13px] tracking-[1px] text-ink" style={{ width: `${pct}%` }}>★★★★★</span>
      </span>
      <span className="num text-[12px] text-ink-muted">{value.toFixed(1)}{showCount && count != null ? ` (${count})` : ""}</span>
    </span>
  );
}
