"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Trash2, Truck, Store } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/lib/store/cart";
import { usePrefs } from "@/lib/store/prefs";
import { SmartImage } from "@/components/ui/smart-image";
import { QuantityStepper } from "./quantity-stepper";
import { Cta } from "@/components/brand/cta";
import { formatPrice, formatWeight } from "@/lib/format";
import { cn } from "@/lib/utils";

export interface DeliveryCfg { deliveryFee: number; freeFrom: number; minOrder: number; pickup: boolean }
const COUPONS: Record<string, number> = { WILLKOMMEN10: 0.1, FRISCHE5: 0.05 };

export function useCheckoutTotals(cfg: DeliveryCfg) {
  const lines = useCart((s) => s.lines);
  const mode = usePrefs((s) => (s as unknown as { mode?: string }).mode) ?? null;
  void mode;
  return { lines, ...cartTotals(lines), cfg };
}

export function CartPage({ cfg }: { cfg: DeliveryCfg }) {
  const t = useTranslations("cart");
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
  const applyCoupon = () => { const pct = COUPONS[code.trim().toUpperCase()]; if (pct) { setCoupon({ code: code.trim().toUpperCase(), pct }); setCouponErr(""); } else setCouponErr(t("couponInvalid")); };

  if (lines.length === 0) {
    return <div className="rounded-[16px] border border-dashed border-line p-16 text-center"><p className="serif text-3xl">{t("empty")}</p><Cta href="/kategorien" className="mt-8">{t("emptyCta")}</Cta></div>;
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div>
        <ul className="divide-y divide-line rounded-[16px] border border-line bg-card">
          {lines.map((l) => (
            <li key={l.slug} className="flex gap-4 p-4 md:p-5">
              <Link href={`/produkt/${l.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-[10px] bg-surface-2"><SmartImage src={l.image} alt={l.name} fill sizes="96px" className="object-cover" /></Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><Link href={`/produkt/${l.slug}`} className="font-medium hover:underline underline-offset-4">{l.name}</Link><p className="mono text-[11px] uppercase tracking-wider text-ink-muted">{l.unitLabel} · {formatWeight(l.weightGrams, locale)}{l.pfand ? ` · Pfand ${formatPrice(l.pfand, locale)}` : ""}</p></div>
                  <button type="button" onClick={() => remove(l.slug)} aria-label={`${l.name} entfernen`} className="rounded-full p-1.5 text-ink-muted hover:bg-forest/5 hover:text-price"><Trash2 className="h-4 w-4" /></button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <QuantityStepper value={l.qty} onChange={(n) => setQty(l.slug, n)} size="sm" />
                  <span className="mono text-lg font-medium text-price">{formatPrice(l.qty * l.price, locale)}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/kategorien" className="mono mt-4 inline-block text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">← {t("continue")}</Link>
      </div>

      <aside className="h-fit space-y-4 lg:sticky lg:top-24">
        <div className="grid grid-cols-2 gap-2">
          {(["delivery", "pickup"] as const).map((m) => (
            <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={mode === m} className={cn("flex items-center gap-2 rounded-[10px] border px-4 py-3 text-left text-sm transition-colors", mode === m ? "border-forest bg-forest text-cream" : "border-line hover:bg-forest/5")}>
              {m === "delivery" ? <Truck className="h-4 w-4" /> : <Store className="h-4 w-4" />}{t(m === "delivery" ? "modeDelivery" : "modePickup")}
            </button>
          ))}
        </div>
        <div className="rounded-[16px] border border-line bg-card p-6">
          <dl className="mono space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">{t("items", { n: count })}</dt><dd>{formatPrice(subtotal, locale)}</dd></div>
            {coupon && <div className="flex justify-between text-emerald"><dt>{t("couponOk", { amount: formatPrice(discount, locale) })}</dt><dd>−{formatPrice(discount, locale)}</dd></div>}
            <div className="flex justify-between"><dt className="text-ink-muted">{t("pfandLine")}</dt><dd className="text-emerald">{formatPrice(pfand, locale)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">{t("weightLine")}</dt><dd>{formatWeight(weightGrams, locale)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">{mode === "pickup" ? t("pickup") : t("delivery")}</dt><dd>{shipping === 0 ? t("deliveryFree") : formatPrice(shipping, locale)}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-lg font-medium"><dt>{t("total")} <span className="text-[10px] font-normal text-ink-muted">{t("vat")}</span></dt><dd className="text-price">{formatPrice(total, locale)}</dd></div>
          </dl>
          {mode === "delivery" && <p className="mono mt-3 text-[11px] uppercase tracking-wider text-ink-muted">{subtotal >= cfg.freeFrom ? t("freeReached") : t("freeFromHint", { amount: formatPrice(cfg.freeFrom - subtotal, locale) })}</p>}
          <div className="mt-5 flex gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder={t("coupon")} className="mono h-10 flex-1 rounded-[8px] border border-line bg-surface px-3 text-sm uppercase outline-none focus:border-gold" aria-label={t("coupon")} />
            <button type="button" onClick={applyCoupon} className="mono rounded-[8px] border border-line px-3 text-[11px] uppercase tracking-wider hover:bg-forest hover:text-cream">{t("couponApply")}</button>
          </div>
          <p className="mono mt-1 min-h-4 text-[11px] text-price">{couponErr}</p>
          <Cta href="/checkout" className="mt-3 w-full">{t("checkout")}</Cta>
          {subtotal < cfg.minOrder && <p className="mono mt-2 text-center text-[11px] uppercase tracking-wider text-ink-muted">{t("minOrder", { amount: formatPrice(cfg.minOrder, locale) })}</p>}
        </div>
      </aside>
    </div>
  );
}
