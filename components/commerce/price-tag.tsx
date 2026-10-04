import { useLocale, useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatBasePrice, formatPrice } from "@/lib/format";

interface Props {
  price: number;
  oldPrice?: number | null;
  basePrice?: { per: string; amount: number };
  pfand?: number;
  size?: "sm" | "md" | "lg" | "poster";
  className?: string;
  align?: "left" | "right";
}

const sizeCls: Record<NonNullable<Props["size"]>, string> = {
  sm: "price price-sm",
  md: "price",
  lg: "price price-lg",
  poster: "price price-poster",
};

/**
 * Legally complete price cell (§4.11): price · „statt" · Grundpreis (always when known) · Pfand.
 * Regular price is ink (`--price`); an offer (oldPrice > price) turns the price red (`price-offer`) — the only red here.
 * Pfand is ink-muted, never green (§0 rule 4).
 */
export function PriceTag({ price, oldPrice, basePrice, pfand, size = "md", className, align = "left" }: Props) {
  const locale = useLocale();
  const t = useTranslations("common");
  const to = useTranslations("offers");
  const offer = oldPrice != null && oldPrice > price;
  const large = size === "lg" || size === "poster";
  const meta = cn("price-meta", large && "text-[13px]");
  const right = align === "right";
  return (
    <div className={cn("flex flex-col gap-1", right && "items-end text-right", className)}>
      <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", right && "justify-end")}>
        <span className={cn(sizeCls[size], offer && "price-offer")}>{formatPrice(price, locale)}</span>
        {offer ? <s className={cn("price-old", size === "poster" && "text-base")}>{to("instead", { price: formatPrice(oldPrice, locale) })}</s> : null}
      </div>
      {basePrice ? <span className={meta}>{formatBasePrice(basePrice.amount, basePrice.per, locale)}</span> : null}
      {pfand ? <span className={meta}>{t("pfandIncl", { amount: formatPrice(pfand, locale) })}</span> : null}
    </div>
  );
}
