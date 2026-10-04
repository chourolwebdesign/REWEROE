"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./product-card";
import { Cta } from "@/components/brand/cta";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CardProduct } from "@/lib/view-models";
import type { L10n } from "@/lib/l10n";
import { tx } from "@/lib/l10n";

interface Cat { slug: string; name: L10n; count: number }
type Sort = "popular" | "priceAsc" | "priceDesc" | "new";
const PAGE = 12;

/** Chip geometry (§4.42): 44 px, radius 2, selected = ink on paper. */
const CHIP = "inline-flex h-11 items-center rounded-[2px] border px-3 text-[13px] font-medium transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)]";
const CHIP_ON = "border-ink bg-ink text-paper";
const CHIP_OFF = "border-line text-ink hover:bg-surface-2";

export function CategoryBrowser({ products, categories, current }: { products: CardProduct[]; categories: Cat[]; current: string }) {
  const t = useTranslations("category");
  const tc = useTranslations("common");
  const locale = useLocale();
  const maxPrice = Math.ceil(Math.max(...products.map((p) => p.price), 1));
  const [price, setPrice] = useState(maxPrice);
  const [diet, setDiet] = useState<string[]>([]);
  const [regional, setRegional] = useState(false);
  const [bio, setBio] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<Sort>("popular");
  const [page, setPage] = useState(1);
  const [sheet, setSheet] = useState(false);

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.price <= price && p.rating >= minRating);
    if (diet.length) list = list.filter((p) => diet.every((d) => p.badges.includes(d as never)));
    if (regional) list = list.filter((p) => p.regional);
    if (bio) list = list.filter((p) => p.badges.includes("bio"));
    const by: Record<Sort, (a: CardProduct, b: CardProduct) => number> = {
      popular: (a, b) => b.reviews - a.reviews,
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      new: (a, b) => Number(b.badges.includes("neu")) - Number(a.badges.includes("neu")),
    };
    return [...list].sort(by[sort]);
  }, [products, price, diet, regional, bio, minRating, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const visible = filtered.slice((page - 1) * PAGE, page * PAGE);
  const chips: { label: string; clear: () => void }[] = [
    ...(price < maxPrice ? [{ label: t("upTo", { price: formatPrice(price, locale) }), clear: () => setPrice(maxPrice) }] : []),
    ...diet.map((d) => ({ label: tc(`badges.${d}`), clear: () => setDiet(diet.filter((x) => x !== d)) })),
    ...(regional ? [{ label: t("regionalOnly"), clear: () => setRegional(false) }] : []),
    ...(bio ? [{ label: t("bioOnly"), clear: () => setBio(false) }] : []),
    ...(minRating ? [{ label: t("ratingMin", { n: minRating }), clear: () => setMinRating(0) }] : []),
  ];
  const resetAll = () => { setPrice(maxPrice); setDiet([]); setRegional(false); setBio(false); setMinRating(0); setPage(1); };

  const sideLink = (active: boolean) =>
    cn("flex min-h-11 items-center justify-between gap-3 px-2 text-sm transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)]", active ? "bg-ink text-paper hover:bg-ink" : "text-ink hover:bg-surface-2");

  const filters = (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3">{t("eyebrow")}</p>
        <ul className="space-y-0.5">
          <li>
            <Link href="/kategorien/alle" className={sideLink(current === "alle")} aria-current={current === "alle" ? "page" : undefined}>
              <span>{tc("all")}</span><span className={cn("num text-xs", current === "alle" ? "text-paper/70" : "text-ink-muted")}>{products.length}</span>
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/kategorien/${c.slug}`} className={sideLink(current === c.slug)} aria-current={current === c.slug ? "page" : undefined}>
                <span>{tx(c.name, locale)}</span><span className={cn("num text-xs", current === c.slug ? "text-paper/70" : "text-ink-muted")}>{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-4">{t("price")}</p>
        <Slider value={[price]} min={0} max={maxPrice} step={0.5} onValueChange={(v) => { setPrice(v[0]); setPage(1); }} aria-label={t("price")} />
        <p className="num mt-3 text-[12px] text-ink-muted">{t("upTo", { price: formatPrice(price, locale) })}</p>
      </div>
      <div>
        <p className="eyebrow mb-2">{t("diet")}</p>
        <ul>
          {(["vegan", "glutenfrei"] as const).map((d) => (
            <li key={d} className="flex min-h-11 items-center gap-3">
              <Checkbox id={`diet-${d}`} className="rounded-[2px]" checked={diet.includes(d)} onCheckedChange={(v) => { setDiet(v ? [...diet, d] : diet.filter((x) => x !== d)); setPage(1); }} />
              <label htmlFor={`diet-${d}`} className="flex-1 text-sm text-ink">{tc(`badges.${d}`)}</label>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-2">{t("origin")}</p>
        <ul>
          <li className="flex min-h-11 items-center gap-3">
            <Checkbox id="f-regional" className="rounded-[2px]" checked={regional} onCheckedChange={(v) => { setRegional(Boolean(v)); setPage(1); }} />
            <label htmlFor="f-regional" className="flex-1 text-sm text-ink">{t("regionalOnly")}</label>
          </li>
          <li className="flex min-h-11 items-center gap-3">
            <Checkbox id="f-bio" className="rounded-[2px]" checked={bio} onCheckedChange={(v) => { setBio(Boolean(v)); setPage(1); }} />
            <label htmlFor="f-bio" className="flex-1 text-sm text-ink">{t("bioOnly")}</label>
          </li>
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-3">{t("rating")}</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label={t("rating")}>
          {[0, 4, 4.5].map((r) => (
            <button key={r} type="button" onClick={() => { setMinRating(r); setPage(1); }} aria-pressed={minRating === r} className={cn(CHIP, "num", minRating === r ? CHIP_ON : CHIP_OFF)}>{r === 0 ? tc("all") : t("ratingMin", { n: r })}</button>
          ))}
        </div>
      </div>
      {chips.length > 0 && <Cta variant="ghost" size="sm" arrow={false} type="button" onClick={resetAll} className="px-0">{t("clear")}</Cta>}
    </div>
  );

  return (
    <div className="container-x grid gap-x-6 gap-y-10 py-12 lg:grid-cols-12">
      <aside className="hidden lg:col-span-3 lg:block"><div className="sticky top-24">{filters}</div></aside>

      <div className="lg:col-span-9">
        <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
          <p className="num text-sm text-ink" aria-live="polite">{t("results", { n: filtered.length })}</p>
          {chips.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {chips.map((c, i) => (
                <li key={i}>
                  <button type="button" onClick={c.clear} className="relative inline-flex h-9 items-center gap-1.5 rounded-[2px] bg-surface-2 px-2.5 text-[12px] font-medium text-ink transition-colors duration-[var(--dur-ui)] before:absolute before:-inset-y-1 before:inset-x-0 before:content-[''] hover:text-red-text">
                    {c.label} <X className="h-3 w-3" aria-hidden /><span className="sr-only">{tc("remove")}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="ml-auto flex items-center gap-2">
            <Cta variant="secondary" size="sm" arrow={false} type="button" onClick={() => setSheet(true)} className="lg:hidden"><SlidersHorizontal className="h-4 w-4" aria-hidden /> {t("filters")}</Cta>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="h-11 w-[200px] rounded-[2px] border-line-input text-sm text-ink" aria-label={t("sort")}><SelectValue /></SelectTrigger>
              <SelectContent className="rounded-[2px] border border-line-strong shadow-pop ring-0">
                <SelectItem value="popular">{t("sortPopular")}</SelectItem>
                <SelectItem value="priceAsc">{t("sortPriceAsc")}</SelectItem>
                <SelectItem value="priceDesc">{t("sortPriceDesc")}</SelectItem>
                <SelectItem value="new">{t("sortNew")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="py-20 text-center text-ink-muted">{t("noMatch")}</p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {visible.map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 4} />)}
          </div>
        )}

        {pages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label={t("pagination")}>
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                aria-current={page === n ? "page" : undefined}
                aria-label={t("page", { n })}
                className={cn("num inline-flex h-11 w-11 items-center justify-center rounded-[2px] border text-sm transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)]", page === n ? CHIP_ON : CHIP_OFF)}
              >
                {n}
              </button>
            ))}
          </nav>
        )}
      </div>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-none border-t border-line-strong bg-paper p-6 text-ink shadow-pop">
          <SheetTitle className="display mb-6 text-2xl text-ink">{t("filters")}</SheetTitle>
          {filters}
          <Cta variant="primary" arrow={false} type="button" onClick={() => setSheet(false)} className="mt-8 w-full">{tc("apply")}</Cta>
        </SheetContent>
      </Sheet>
    </div>
  );
}
