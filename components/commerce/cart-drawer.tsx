"use client";
import { useLocale, useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/lib/store/cart";
import { useUi } from "@/lib/store/ui";
import { formatPrice, formatWeight } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SmartImage } from "@/components/ui/smart-image";
import { QuantityStepper } from "./quantity-stepper";
import { Cta } from "@/components/brand/cta";

export function CartDrawer() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const { cartOpen, setCartOpen } = useUi();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const { count, subtotal, pfand, weightGrams, total } = cartTotals(lines);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-line px-6 py-5">
          <p className="eyebrow">{t("eyebrow")}</p>
          <SheetTitle className="serif text-2xl font-medium">{t("title")} <span className="mono text-sm text-ink-muted">· {t("items", { n: count })}</span></SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="serif text-2xl">{t("empty")}</p>
              <Cta href="/kategorien" variant="secondary" className="mt-6" size="sm">{t("emptyCta")}</Cta>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((l) => (
                <li key={l.slug} className="flex gap-4 py-4">
                  <Link href={`/produkt/${l.slug}`} onClick={() => setCartOpen(false)} className="relative h-20 w-16 shrink-0 overflow-hidden rounded-[8px] bg-surface-2">
                    <SmartImage src={l.image} alt={l.name} fill sizes="64px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.name}</p>
                    <p className="mono text-[11px] text-ink-muted">{l.unitLabel}{l.pfand ? ` · Pfand ${formatPrice(l.pfand, locale)}` : ""}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <QuantityStepper size="sm" value={l.qty} onChange={(n) => setQty(l.slug, n)} />
                      <span className="mono text-sm font-medium text-price">{formatPrice(l.qty * l.price, locale)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => remove(l.slug)} aria-label={`${l.name} entfernen`} className="self-start rounded-full p-1.5 text-ink-muted hover:bg-forest/5 hover:text-price"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line bg-surface-2/60 px-6 py-5">
            <dl className="mono space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">{t("subtotal")}</dt><dd>{formatPrice(subtotal, locale)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">{t("pfandLine")}</dt><dd className="text-emerald">{formatPrice(pfand, locale)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">{t("weightLine")}</dt><dd>{formatWeight(weightGrams, locale)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-medium"><dt>{t("total")}</dt><dd className="text-price">{formatPrice(total, locale)}</dd></div>
            </dl>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Cta href="/warenkorb" variant="secondary" arrow={false} size="sm">{t("title")}</Cta>
              <Cta href="/checkout" size="sm">{t("checkout")}</Cta>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export function MobileCartBar() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const lines = useCart((s) => s.lines);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const { count, total } = cartTotals(lines);
  if (count === 0) return null;
  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      <button type="button" onClick={() => setCartOpen(true)} className="glass-dark flex w-full items-center justify-between rounded-[14px] px-5 py-3.5 text-cream shadow-lift">
        <span className="mono text-xs uppercase tracking-widest">{t("items", { n: count })}</span>
        <span className="mono text-base font-medium">{formatPrice(total, locale)}</span>
        <span className="rounded-full bg-rewe px-3 py-1.5 text-xs font-medium text-forest">{t("checkout")}</span>
      </button>
    </div>
  );
}
