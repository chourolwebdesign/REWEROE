"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import { Checkbox } from "@/components/ui/checkbox";
import { Cta } from "@/components/brand/cta";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { formatPrice } from "@/lib/format";
import { toCartItem, type CardProduct } from "@/lib/view-models";
import { cn } from "@/lib/utils";

export interface IngredientVM { name: string; amount: number; unit: string; product: CardProduct | null }

/**
 * Signature feature (§4.38): every ingredient line can be added — or all of them in one click (the page's one red).
 * „Habe ich schon" skips lines. Prices are ink, never red; the shell is a hairline card.
 */
export function BulkIngredients({ ingredients, servings }: { ingredients: IngredientVM[]; servings: number }) {
  const t = useTranslations("recipes");
  const locale = useLocale();
  const add = useCart((s) => s.add);
  const [have, setHave] = useState<Set<number>>(new Set());
  const [done, setDone] = useState(false);
  const addable = ingredients.map((ing, i) => ({ ing, i })).filter(({ ing, i }) => ing.product && !have.has(i));
  const total = addable.reduce((n, { ing }) => n + (ing.product?.price ?? 0), 0);

  const addAll = () => {
    addable.forEach(({ ing }) => add(toCartItem(ing.product!)));
    setDone(true);
    toast.success(t("addedAll", { n: addable.length }));
    setTimeout(() => setDone(false), 1600);
  };

  return (
    <div className="border border-line bg-card p-6">
      <div>
        <p className="eyebrow">{t("ingredients")}</p>
        <p className="num mt-1.5 text-[12px] text-ink-muted">{t("forServings", { n: servings })}</p>
      </div>
      <Cta variant="primary" arrow={false} type="button" onClick={addAll} disabled={addable.length === 0} className="mt-5 w-full">
        {done ? <Check className="h-4 w-4" aria-hidden /> : <ShoppingBag className="h-4 w-4" aria-hidden />}
        {t("addAll")}
      </Cta>
      <p className="num mt-2 text-xs text-ink-muted" aria-live="polite">{addable.length} · {formatPrice(total, locale)}</p>

      <ul className="mt-6 divide-y divide-line">
        {ingredients.map((ing, i) => {
          const skipped = have.has(i);
          return (
            <li key={i} className={cn("flex items-center gap-3 py-3 transition-opacity duration-[var(--dur-ui)]", skipped && "opacity-45")}>
              <Checkbox id={`have-${i}`} className="rounded-[2px]" checked={skipped} onCheckedChange={(v) => { const s = new Set(have); if (v) s.add(i); else s.delete(i); setHave(s); }} aria-label={t("haveIt")} />
              <label htmlFor={`have-${i}`} className="num w-24 shrink-0 text-sm text-ink">{ing.amount} {ing.unit}</label>
              <span className={cn("flex-1 text-sm text-ink", skipped && "line-through")}>
                {ing.product ? <Link href={`/produkt/${ing.product.slug}`} className="underline-offset-4 hover:underline">{ing.name}</Link> : ing.name}
                {ing.product && <span className="num ml-2 text-[12px] text-ink">{formatPrice(ing.product.price, locale)}</span>}
              </span>
              {ing.product ? (
                <AddToCart item={toCartItem(ing.product)} variant="pill" />
              ) : (
                <span className="text-[12px] text-ink-muted">{t("notInShop")}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-[12px] text-ink-muted">☐ {t("haveIt")}</p>
    </div>
  );
}
