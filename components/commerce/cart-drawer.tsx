"use client";
import { useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Trash2, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { useCart, cartTotals } from "@/lib/store/cart";
import { useUi } from "@/lib/store/ui";
import { formatPrice, formatWeight } from "@/lib/format";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SmartImage } from "@/components/ui/smart-image";
import { QuantityStepper } from "./quantity-stepper";
import { Cta } from "@/components/brand/cta";

/** Cart sheet (§4.26): paper, radius 0, hairline lines; Pfand reads ink-muted (never green); one primary CTA. */
export function CartDrawer() {
  const t = useTranslations("cart");
  const tc = useTranslations("common");
  const tn = useTranslations("nav");
  const locale = useLocale();
  const { cartOpen, setCartOpen } = useUi();
  const lines = useCart((s) => s.lines);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const { count, subtotal, pfand, weightGrams, total } = cartTotals(lines);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetContent side="right" showCloseButton={false} className="flex flex-col gap-0 rounded-none border-l border-line bg-paper p-0 text-ink data-[side=right]:w-full data-[side=right]:sm:max-w-md">
        <SheetHeader className="flex-row items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="eyebrow">{t("eyebrow")}</p>
            <SheetTitle className="display mt-1 text-2xl font-extrabold text-ink">
              {t("title")} <span className="num text-sm font-medium text-ink-muted">· {t("items", { n: count })}</span>
            </SheetTitle>
          </div>
          <button type="button" onClick={() => setCartOpen(false)} aria-label={tn("close")} className="-mr-2 -mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[2px] text-ink transition-colors duration-[var(--dur-ui)] hover:bg-surface-2">
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6">
          {lines.length === 0 ? (
            <div className="py-16 text-center">
              <p className="display text-2xl text-ink">{t("empty")}</p>
              <Cta href="/kategorien" variant="secondary" className="mt-6" size="sm">{t("emptyCta")}</Cta>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((l) => (
                <li key={l.slug} className="flex gap-4 py-4">
                  <Link href={`/produkt/${l.slug}`} onClick={() => setCartOpen(false)} className="frame relative h-16 w-16 shrink-0 overflow-hidden bg-surface">
                    <SmartImage src={l.image} alt={l.name} fill sizes="64px" className="object-cover" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-medium text-ink">{l.name}</p>
                    <p className="num mt-0.5 text-[12px] text-ink-muted">{l.unitLabel}{l.pfand ? ` · ${tc("pfand")} ${formatPrice(l.pfand, locale)}` : ""}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <QuantityStepper size="sm" value={l.qty} onChange={(n) => setQty(l.slug, n)} />
                      <span className="price price-sm text-ink">{formatPrice(l.qty * l.price, locale)}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => remove(l.slug)} aria-label={`${tc("remove")}: ${l.name}`} className="-mr-3 inline-flex h-11 w-11 shrink-0 items-center justify-center self-start text-ink-muted transition-colors duration-[var(--dur-ui)] hover:text-error">
                    <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-line bg-surface px-6 py-5">
            <dl className="num space-y-1.5 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">{t("subtotal")}</dt><dd className="text-ink">{formatPrice(subtotal, locale)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">{t("pfandLine")}</dt><dd className="text-ink-muted">{formatPrice(pfand, locale)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">{t("weightLine")}</dt><dd className="text-ink">{formatWeight(weightGrams, locale)}</dd></div>
              <div className="mt-3 flex justify-between border-t-2 border-line-strong pt-3 text-[20px] font-bold text-ink"><dt>{t("total")}</dt><dd>{formatPrice(total, locale)}</dd></div>
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

/** `:root[data-pdp-bar]` is toggled by `BuyBox` (§4.39) while the PDP's own bottom bar is on screen. */
const subscribePdpBar = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-pdp-bar"] });
  return () => mo.disconnect();
};
const usePdpBarVisible = () => useSyncExternalStore(subscribePdpBar, () => document.documentElement.hasAttribute("data-pdp-bar"), () => false);

/** Routes that render the cart themselves — there the bar would only cover totals, the Weiter/Bestellen row and the footer legal line. */
const CART_ROUTES = /^\/(warenkorb|checkout)(\/|$)/;

/**
 * Sticky mobile summary (< md): anthracite block with the one red chip „Zur Kasse". Yields to the PDP bottom bar, stays
 * off /warenkorb and /checkout, and reserves its own height below the footer (anthracite spacer) while mounted.
 */
export function MobileCartBar() {
  const t = useTranslations("cart");
  const locale = useLocale();
  const pathname = usePathname();
  const pdpBar = usePdpBarVisible();
  const lines = useCart((s) => s.lines);
  const setCartOpen = useUi((s) => s.setCartOpen);
  const { count, total } = cartTotals(lines);
  if (count === 0 || pdpBar || CART_ROUTES.test(pathname)) return null;
  return (
    <>
      <div aria-hidden className="h-20 bg-block md:hidden" />
      <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
        <button type="button" onClick={() => setCartOpen(true)} className="on-block flex h-14 w-full items-center justify-between rounded-[2px] px-5 shadow-pop">
          <span className="data text-block-muted">{t("items", { n: count })}</span>
          <span className="price price-sm text-block-ink">{formatPrice(total, locale)}</span>
          <span className="inline-flex h-9 items-center rounded-[2px] bg-red px-3 text-xs font-semibold text-white">{t("checkout")}</span>
        </button>
      </div>
    </>
  );
}
