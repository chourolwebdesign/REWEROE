"use client";
import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { SlidersHorizontal, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "./product-card";
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

  const filters = (
    <div className="space-y-8">
      <div>
        <p className="eyebrow mb-3">{t("eyebrow")}</p>
        <ul className="space-y-1">
          <li><Link href="/kategorien/alle" className={cn("flex justify-between rounded-md px-2 py-1.5 text-sm hover:bg-forest/5", current === "alle" && "bg-forest text-cream hover:bg-forest")}><span>{tc("all")}</span><span className="mono text-xs opacity-60">{products.length}</span></Link></li>
          {categories.map((c) => (
            <li key={c.slug}><Link href={`/kategorien/${c.slug}`} className={cn("flex justify-between rounded-md px-2 py-1.5 text-sm hover:bg-forest/5", current === c.slug && "bg-forest text-cream hover:bg-forest")}><span>{tx(c.name, locale)}</span><span className="mono text-xs opacity-60">{c.count}</span></Link></li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-3">{t("price")}</p>
        <Slider value={[price]} min={0} max={maxPrice} step={0.5} onValueChange={(v) => { setPrice(v[0]); setPage(1); }} aria-label={t("price")} />
        <p className="mono mt-2 text-xs text-ink-muted">{t("upTo", { price: formatPrice(price, locale) })}</p>
      </div>
      <div>
        <p className="eyebrow mb-3">{t("diet")}</p>
        <ul className="space-y-2">
          {(["vegan", "glutenfrei"] as const).map((d) => (
            <li key={d} className="flex items-center gap-2"><Checkbox id={`diet-${d}`} checked={diet.includes(d)} onCheckedChange={(v) => { setDiet(v ? [...diet, d] : diet.filter((x) => x !== d)); setPage(1); }} /><label htmlFor={`diet-${d}`} className="text-sm">{tc(`badges.${d}`)}</label></li>
          ))}
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-3">{t("origin")}</p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2"><Checkbox id="f-regional" checked={regional} onCheckedChange={(v) => { setRegional(Boolean(v)); setPage(1); }} /><label htmlFor="f-regional" className="text-sm">{t("regionalOnly")}</label></li>
          <li className="flex items-center gap-2"><Checkbox id="f-bio" checked={bio} onCheckedChange={(v) => { setBio(Boolean(v)); setPage(1); }} /><label htmlFor="f-bio" className="text-sm">{t("bioOnly")}</label></li>
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-3">{t("rating")}</p>
        <div className="flex gap-1.5">
          {[0, 4, 4.5].map((r) => (
            <button key={r} type="button" onClick={() => { setMinRating(r); setPage(1); }} className={cn("mono rounded-full border px-3 py-1 text-xs", minRating === r ? "border-forest bg-forest text-cream" : "border-line hover:bg-forest/5")}>{r === 0 ? tc("all") : t("ratingMin", { n: r })}</button>
          ))}
        </div>
      </div>
      {chips.length > 0 && <button type="button" onClick={resetAll} className="mono text-[11px] uppercase tracking-widest underline-offset-4 hover:underline">{t("clear")}</button>}
    </div>
  );

  return (
    <div className="container-x grid gap-10 py-14 lg:grid-cols-[260px_1fr]">
      <aside className="hidden lg:block"><div className="sticky top-24">{filters}</div></aside>

      <div>
        <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
          <p className="mono text-sm" aria-live="polite">{t("results", { n: filtered.length })}</p>
          <div className="flex flex-wrap gap-1.5">
            {chips.map((c, i) => (
              <button key={i} type="button" onClick={c.clear} className="mono inline-flex items-center gap-1 rounded-full bg-forest/5 px-2.5 py-1 text-[11px] hover:bg-forest/10">{c.label} <X className="h-3 w-3" /></button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button type="button" onClick={() => setSheet(true)} className="inline-flex items-center gap-2 rounded-[8px] border border-line px-3 py-2 text-sm lg:hidden"><SlidersHorizontal className="h-4 w-4" /> {t("filters")}</button>
            <Select value={sort} onValueChange={(v) => setSort(v as Sort)}>
              <SelectTrigger className="w-[180px]" aria-label={t("sort")}><SelectValue /></SelectTrigger>
              <SelectContent>
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
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Pagination">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" onClick={() => { setPage(n); window.scrollTo({ top: 0, behavior: "smooth" }); }} aria-current={page === n ? "page" : undefined} className={cn("mono h-10 w-10 rounded-full border text-sm", page === n ? "border-forest bg-forest text-cream" : "border-line hover:bg-forest/5")}>{n}</button>
            ))}
          </nav>
        )}
      </div>

      <Sheet open={sheet} onOpenChange={setSheet}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-[16px] p-6">
          <SheetTitle className="serif mb-6 text-2xl font-medium">{t("filters")}</SheetTitle>
          {filters}
        </SheetContent>
      </Sheet>
    </div>
  );
}
