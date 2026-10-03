import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

interface Props {
  price: number;
  oldPrice?: number | null;
  basePrice?: { per: string; amount: number };
  pfand?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PriceTag({ price, oldPrice, basePrice, pfand, size = "md", className }: Props) {
  const locale = useLocale();
  const t = useTranslations("common");
  const main = size === "lg" ? "text-4xl" : size === "md" ? "text-2xl" : "text-lg";
  return (
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-baseline gap-2">
        <span className={cn("mono font-medium leading-none text-price", main)}>{formatPrice(price, locale)}</span>
        {oldPrice && oldPrice > price ? (
          <span className="mono text-sm text-ink-muted line-through">{formatPrice(oldPrice, locale)}</span>
        ) : null}
      </div>
      {basePrice ? (
        <span className="mono mt-1 text-[11px] tracking-wide text-ink-muted">
          {t("basePrice", { price: formatPrice(basePrice.amount, locale), per: basePrice.per })}
        </span>
      ) : null}
      {pfand ? (
        <span className="mono mt-0.5 text-[11px] tracking-wide text-emerald">{t("pfandIncl", { amount: formatPrice(pfand, locale) })}</span>
      ) : null}
    </div>
  );
}
