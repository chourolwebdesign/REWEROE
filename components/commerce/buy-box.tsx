"use client";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { Heart, Truck, ShieldCheck } from "lucide-react";
import { m, useReducedMotion } from "framer-motion";
import { usePrefs } from "@/lib/store/prefs";
import { Cta } from "@/components/brand/cta";
import { AddToCart } from "./add-to-cart";
import { QuantityStepper } from "./quantity-stepper";
import { formatBasePrice, formatPrice } from "@/lib/format";
import { toCartItem, type CardProduct } from "@/lib/view-models";
import { cn } from "@/lib/utils";

/**
 * PDP buy box (§4.39): stepper + the page's one red CTA + 48 px favourite, „Zur Liste" ghost action, info list.
 * Also owns the mobile bottom bar, which shows only while this box is scrolled out of view (IntersectionObserver).
 */
export function BuyBox({ p }: { p: CardProduct }) {
  const t = useTranslations("product");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [qty, setQty] = useState(1);
  const favorites = usePrefs((s) => s.favorites);
  const toggle = usePrefs((s) => s.toggleFavorite);
  const addListItem = usePrefs((s) => s.addListItem);
  const fav = favorites.includes(p.slug);
  const item = toCartItem(p);

  const ref = useRef<HTMLDivElement>(null);
  const [boxInView, setBoxInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(([entry]) => {
      setBoxInView(entry.isIntersecting);
      // Hook for the chrome: `:root[data-pdp-bar]` is set while the PDP bottom bar is visible, so `MobileCartBar` (§4.26) can yield to it.
      document.documentElement.toggleAttribute("data-pdp-bar", !entry.isIntersecting);
    }, { threshold: 0 });
    io.observe(el);
    return () => { io.disconnect(); document.documentElement.removeAttribute("data-pdp-bar"); };
  }, []);

  const toList = () => {
    addListItem(p.name);
    toast.success(t("addedToList"), { description: p.name });
  };

  return (
    <>
      <div ref={ref} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <QuantityStepper value={qty} onChange={setQty} min={1} input label={t("qty")} />
          <AddToCart item={item} qty={qty} variant="primary" className="flex-1" />
          <button
            type="button"
            onClick={() => toggle(p.slug)}
            aria-pressed={fav}
            aria-label={fav ? t("unfavorite") : t("favorite")}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-[2px] border border-line-strong text-ink transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)] hover:bg-surface-2"
          >
            <m.span animate={fav && !reduce ? { scale: [1, 1.25, 1] } : { scale: 1 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1], times: [0, 0.5, 1] }} className="inline-flex">
              <Heart className={cn("h-5 w-5", fav && "fill-red-text text-red-text")} aria-hidden />
            </m.span>
          </button>
        </div>
        <Cta variant="ghost" size="sm" arrow={false} type="button" onClick={toList} className="self-start px-0">{t("toList")}</Cta>
        <ul className="space-y-2 text-[13px] text-ink-muted">
          <li className="flex items-start gap-2"><Truck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> <span>{t("deliveryInfo")}</span></li>
          <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> <span><span className="font-medium text-ink">{t("freshness")}</span> — {t("freshnessText")}</span></li>
        </ul>
      </div>

      {/* Mobile bottom bar — hidden while the buy box itself is in view */}
      <div
        aria-hidden={boxInView}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 border-t border-line bg-paper px-4 py-3 pb-[max(.75rem,env(safe-area-inset-bottom))] transition-[transform,opacity] duration-[var(--dur-move)] ease-[var(--ease-ui)] lg:hidden",
          boxInView && "pointer-events-none translate-y-full opacity-0",
        )}
      >
        <div className="min-w-0">
          <p className="price price-sm text-ink">{formatPrice(p.price, locale)}</p>
          <p className="price-meta truncate">{formatBasePrice(p.basePrice.amount, p.basePrice.per, locale)}</p>
        </div>
        <AddToCart item={item} qty={qty} variant="primary" className="h-11 w-auto shrink-0 px-5" />
      </div>
    </>
  );
}
