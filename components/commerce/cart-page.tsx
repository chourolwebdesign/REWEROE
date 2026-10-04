"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, Trash2, Truck, Store } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/lib/store/cart";
import { usePrefs } from "@/lib/store/prefs";
import { SmartImage } from "@/components/ui/smart-image";
import { QuantityStepper } from "./quantity-stepper";
import { Cta } from "@/components/brand/cta";
import { formatPrice, formatWeight } from "@/lib/format";
import { cn } from "@/lib/utils";
import { boxInput, choiceCard, choiceCardOn, FieldError } from "./form-primitives";

export interface DeliveryCfg { deliveryFee: number; freeFrom: number; minOrder: number; pickup: boolean }
const COUPONS: Record<string, number> = { WILLKOMMEN10: 0.1, FRISCHE5: 0.05 };

export function useCheckoutTotals(cfg: DeliveryCfg) {
  const lines = useCart((s) => s.lines);
  const mode = usePrefs((s) => (s as unknown as { mode?: string }).mode) ?? null;
  void mode;
  return { lines, ...cartTotals(lines), cfg };
}

/**
 * Cart page (§7 G4): same vocabulary as the drawer — hairline lines, framed thumbs, `num` totals, Pfand ink-muted,
 * total ink, selected mode card with the 3 px red left rule, box inputs, one primary CTA („Zur Kasse").
 */
export function CartPage({ cfg }: { cfg: DeliveryCfg }) {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const locale = useLocale();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; pct: number } | null>(null);
  const [couponErr, setCouponErr] = useState("");
  const { count, subtotal, pfand, weightGrams } = cartTotals(lines);
  const discount = coupon ? subtotal * coupon.pct : 0;
  const shipping = mode === "pickup" ? 0 : subtotal >= cfg.freeFrom ? 0 : cfg.deliveryFee;
  const total = subtotal - discount + pfand + shipping;
  const applyCoupon = () => {
    const key = code.trim().toUpperCase();
    const pct = COUPONS[key];
    if (pct) { setCoupon({ code: key, pct }); setCouponErr(""); } else setCouponErr(t("couponInvalid"));
  };

  if (lines.length === 0) {
    return (
      <div className="border border-dashed border-line p-16 text-center">
        <p className="display text-3xl text-ink">{t("empty")}</p>
        <Cta href="/kategorien" className="mt-8">{t("emptyCta")}</Cta>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-12">
      <div className="lg:col-span-8">
        <ul className="divide-y divide-line border border-line bg-card">
          {lines.map((l) => (
            <li key={l.slug} className="flex gap-4 p-4 md:p-5">
              <Link href={`/produkt/${l.slug}`} className="frame relative h-28 w-24 shrink-0 overflow-hidden bg-surface">
                <SmartImage src={l.image} alt={l.name} fill sizes="96px" className="object-cover" />
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/produkt/${l.slug}`} className="text-[15px] font-medium text-ink underline-offset-4 hover:underline">{l.name}</Link>
                    <p className="num mt-0.5 text-[12px] text-ink-muted">
                      {l.unitLabel} · {formatWeight(l.weightGrams, locale)}{l.pfand ? ` · ${tc("pfand")} ${formatPrice(l.pfand, locale)}` : ""}
                    </p>
                  </div>
                  <button type="button" onClick={() => remove(l.slug)} aria-label={`${tc("remove")}: ${l.name}`} className="-mr-2 -mt-2 inline-flex h-11 w-11 shrink-0 items-center justify-center text-ink-muted transition-colors duration-[var(--dur-ui)] hover:text-error">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                  <QuantityStepper value={l.qty} onChange={(n) => setQty(l.slug, n)} size="sm" />
                  <span className="price price-sm text-ink">{formatPrice(l.qty * l.price, locale)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/kategorien" className="mt-5 inline-flex min-h-11 items-center gap-2 text-[13px] font-semibold text-ink underline-offset-4 hover:underline">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden /> {t("continue")}
        </Link>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24 lg:col-span-4">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {(["delivery", "pickup"] as const).filter((k) => k === "delivery" || cfg.pickup).map((k) => (
            <button key={k} type="button" onClick={() => setMode(k)} aria-pressed={mode === k} className={cn(choiceCard, mode === k && choiceCardOn)}>
              {k === "delivery" ? <Truck className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden /> : <Store className="h-4 w-4 shrink-0 text-ink-muted" strokeWidth={1.75} aria-hidden />}
              {t(k === "delivery" ? "modeDelivery" : "modePickup")}
            </button>
          ))}
        </div>

        <div className="border border-line bg-card p-6">
          <dl className="num space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">{t("items", { n: count })}</dt><dd className="text-ink">{formatPrice(subtotal, locale)}</dd></div>
            {coupon && <div className="flex justify-between text-ink"><dt>{t("couponOk", { amount: formatPrice(discount, locale) })}</dt><dd>−{formatPrice(discount, locale)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-muted">{t("pfandLine")}</dt><dd className="text-ink-muted">{formatPrice(pfand, locale)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">{t("weightLine")}</dt><dd className="text-ink">{formatWeight(weightGrams, locale)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">{mode === "pickup" ? t("pickup") : t("delivery")}</dt><dd className="text-ink">{shipping === 0 ? t("deliveryFree") : formatPrice(shipping, locale)}</dd></div>
            <div className="mt-3 flex items-baseline justify-between border-t-2 border-line-strong pt-3 text-[20px] font-bold text-ink">
              <dt>{t("total")} <span className="text-[12px] font-normal text-ink-muted">{t("vat")}</span></dt>
              <dd>{formatPrice(total, locale)}</dd>
            </div>
          </dl>
          {mode === "delivery" && (
            <p className="price-meta mt-3">{subtotal >= cfg.freeFrom ? t("freeReached") : t("freeFromHint", { amount: formatPrice(cfg.freeFrom - subtotal, locale) })}</p>
          )}

          <div className="mt-5 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("coupon")} aria-label={t("coupon")} aria-invalid={!!couponErr} autoCapitalize="characters" className={cn(boxInput, "num w-full min-w-0 flex-1 border")} />
            <button type="button" onClick={applyCoupon} className="h-12 shrink-0 rounded-[2px] border border-line-strong px-4 text-[13px] font-semibold text-ink transition-colors duration-[var(--dur-ui)] hover:bg-ink hover:text-paper">{t("couponApply")}</button>
          </div>
          <FieldError msg={couponErr} />

          <Cta href="/checkout" className="mt-3 w-full">{t("checkout")}</Cta>
          {subtotal < cfg.minOrder && <p className="price-meta mt-3 text-center">{t("minOrder", { amount: formatPrice(cfg.minOrder, locale) })}</p>}
        </div>
      </aside>
    </div>
  );
}
