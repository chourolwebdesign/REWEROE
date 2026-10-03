import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { Badge as BadgeKind } from "@/lib/content/types";

const styles: Record<BadgeKind, string> = {
  bio: "bg-rewe text-forest",
  regional: "bg-forest text-cream",
  neu: "bg-gold text-forest",
  vegan: "bg-emerald text-cream",
  glutenfrei: "bg-cream-2 text-forest border border-line",
  angebot: "bg-price text-white",
};

export function Badges({ badges, discount, className, size = "sm" }: { badges: BadgeKind[]; discount?: number | null; className?: string; size?: "sm" | "md" }) {
  const t = useTranslations("common.badges");
  if (!badges.length && !discount) return null;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {discount ? (
        <span className={cn("mono rounded-[3px] font-medium uppercase tracking-wider", styles.angebot, size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs")}>
          -{discount}%
        </span>
      ) : null}
      {badges.map((b) => (
        <span key={b} className={cn("mono rounded-[3px] font-medium uppercase tracking-wider", styles[b], size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-1 text-xs")}>
          {t(b)}
        </span>
      ))}
    </div>
  );
}
