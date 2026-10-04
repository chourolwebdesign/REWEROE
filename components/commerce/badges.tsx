import { useLocale, useTranslations } from "next-intl";
import { Tractor } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDiscount } from "@/lib/format";
import type { Badge as BadgeKind } from "@/lib/content/types";

/**
 * Badge colours (§4.10). Every fill is a token; the ONE `dark:` exception in app code is the Bio badge: its solid
 * green field (#0E6B34) is 2.85:1 against dark paper, and no token flips it — so in dark it becomes the tinted
 * outline (`bg-bio-tint text-bio-text border-bio-text/40`), exactly what the spec table asks for.
 * Regional keeps static ink (`text-[#141414]`) on the yellow shelf-sign field in both schemes (12.49:1).
 */
const styles: Record<BadgeKind, string> = {
  angebot: "bg-red text-white",
  knaller: "border border-red-text bg-paper text-red-text",
  bio: "bg-bio text-white dark:border dark:border-bio-text/40 dark:bg-bio-tint dark:text-bio-text",
  regional: "bg-regional text-[#141414]",
  vegan: "bg-bio-tint text-bio-text",
  neu: "bg-ink text-paper",
  glutenfrei: "border border-line-input bg-paper text-ink-muted",
  bonus: "bg-petrol text-bonus-yellow",
};

/** Display order after the discount badge (§4.10). */
const ORDER: BadgeKind[] = ["angebot", "knaller", "bio", "regional", "vegan", "neu", "glutenfrei", "bonus"];

const geometry = {
  sm: "inline-flex h-5 items-center gap-1 rounded-[2px] px-1.5 font-sans text-[11px] font-bold leading-none tracking-[.04em] whitespace-nowrap",
  md: "inline-flex h-6 items-center gap-1 rounded-[2px] px-2 font-sans text-[12px] font-bold leading-none tracking-[.04em] whitespace-nowrap",
} as const;

interface Props {
  badges: BadgeKind[];
  /** Campaign percent → rendered first as „−20 %" (U+2212) via `formatDiscount`. */
  discount?: number | null;
  className?: string;
  size?: "sm" | "md";
  /** Maximum chips rendered (the discount counts as one). Cards keep 3 (§4.10); pass `Infinity` on the PDP. */
  max?: number;
}

export function Badges({ badges, discount, className, size = "sm", max = 3 }: Props) {
  const t = useTranslations("common.badges");
  const locale = useLocale();
  const ordered = ORDER.filter((b) => badges.includes(b));
  if (!ordered.length && !discount) return null;
  const visible = ordered.slice(0, Math.max(0, max - (discount ? 1 : 0)));
  return (
    <div className={cn("flex flex-wrap gap-1.5 overflow-hidden", className)}>
      {discount ? (
        <span className={cn(geometry[size], styles.angebot)}>{formatDiscount(discount, locale)}</span>
      ) : null}
      {visible.map((b) => (
        <span key={b} className={cn(geometry[size], styles[b])}>
          {b === "regional" && size === "md" ? <Tractor className="h-3 w-3 shrink-0" strokeWidth={2.25} aria-hidden /> : null}
          {t(b)}
        </span>
      ))}
    </div>
  );
}
