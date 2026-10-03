"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, Truck, ShieldCheck } from "lucide-react";
import { m } from "framer-motion";
import { usePrefs } from "@/lib/store/prefs";
import { AddToCart } from "./add-to-cart";
import { QuantityStepper } from "./quantity-stepper";
import { toCartItem, type CardProduct } from "@/lib/view-models";
import { cn } from "@/lib/utils";

export function BuyBox({ p }: { p: CardProduct }) {
  const t = useTranslations("product");
  const [qty, setQty] = useState(1);
  const favorites = usePrefs((s) => s.favorites);
  const toggle = usePrefs((s) => s.toggleFavorite);
  const fav = favorites.includes(p.slug);
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <QuantityStepper value={qty} onChange={setQty} min={1} />
        <div className="flex-1"><AddToCart item={toCartItem(p)} qty={qty} /></div>
        <button type="button" onClick={() => toggle(p.slug)} aria-pressed={fav} aria-label={fav ? t("unfavorite") : t("favorite")} className={cn("inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[10px] border border-line transition-colors hover:bg-forest/5", fav && "border-price/40 bg-price/5")}>
          <m.span animate={fav ? { scale: [1, 1.35, 1] } : { scale: 1 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], times: [0, 0.5, 1] }} className="inline-flex"><Heart className={cn("h-4 w-4", fav && "fill-price text-price")} /></m.span>
        </button>
      </div>
      <ul className="mono space-y-1.5 text-[11px] uppercase tracking-wider text-ink-muted">
        <li className="flex items-center gap-2"><Truck className="h-3.5 w-3.5 text-emerald" /> {t("deliveryInfo")}</li>
        <li className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> {t("freshness")} — <span className="normal-case tracking-normal">{t("freshnessText")}</span></li>
      </ul>
    </div>
  );
}
