"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingBag, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/store/cart";
import { Checkbox } from "@/components/ui/checkbox";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { formatPrice } from "@/lib/format";
import { toCartItem, type CardProduct } from "@/lib/view-models";
import { cn } from "@/lib/utils";

export interface IngredientVM { name: string; amount: number; unit: string; product: CardProduct | null }

/** Signature feature: every ingredient line can be added — or all of them in one click. "Habe ich schon" skips lines. */
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
    <div className="rounded-[16px] border border-line bg-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">{t("ingredients")}</p>
          <p className="mono mt-1 text-xs text-ink-muted">{t("forServings", { n: servings })}</p>
        </div>
        <button type="button" onClick={addAll} disabled={addable.length === 0} className="group inline-flex items-center gap-2 rounded-[10px] bg-rewe px-5 py-3 text-[15px] font-medium text-forest transition-all duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:bg-rewe-deep active:scale-[0.98] disabled:opacity-40">
          {done ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4 transition-transform group-hover:-rotate-6" />}
          {t("addAll")} <span className="mono text-xs opacity-70">({addable.length} · {formatPrice(total, locale)})</span>
        </button>
      </div>
      <ul className="mt-6 divide-y divide-line">
        {ingredients.map((ing, i) => {
          const skipped = have.has(i);
          return (
            <li key={i} className={cn("flex items-center gap-3 py-3 transition-opacity", skipped && "opacity-45")}>
              <Checkbox id={`have-${i}`} checked={skipped} onCheckedChange={(v) => { const s = new Set(have); if (v) s.add(i); else s.delete(i); setHave(s); }} aria-label={t("haveIt")} />
              <label htmlFor={`have-${i}`} className="mono w-24 shrink-0 text-sm tabular-nums">{ing.amount} {ing.unit}</label>
              <span className={cn("flex-1 text-sm", skipped && "line-through")}>
                {ing.product ? <Link href={`/produkt/${ing.product.slug}`} className="hover:underline underline-offset-4">{ing.name}</Link> : ing.name}
                {ing.product && <span className="mono ml-2 text-[11px] text-price">{formatPrice(ing.product.price, locale)}</span>}
              </span>
              {ing.product ? (
                <AddToCart item={toCartItem(ing.product)} variant="pill" />
              ) : (
                <span className="mono text-[10px] uppercase tracking-wider text-ink-muted">{t("notInShop")}</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mono mt-4 text-[11px] uppercase tracking-wider text-ink-muted">☐ {t("haveIt")}</p>
    </div>
  );
}
