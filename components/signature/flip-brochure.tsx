"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductCard } from "@/components/commerce/product-card";
import { Badges } from "@/components/commerce/badges";
import { PriceTag } from "@/components/commerce/price-tag";
import { AddToCart } from "@/components/commerce/add-to-cart";
import { Cta } from "@/components/brand/cta";
import { Countdown } from "@/components/motion/countdown";
import { SmartImage } from "@/components/ui/smart-image";
import { formatBasePrice, formatDateShort, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toCartItem, type CardProduct } from "@/lib/view-models";

export type BrochureItem = CardProduct & { campaignTitle: string; category: string };
export interface BrochurePage { n: number; items: BrochureItem[] }

const CHIP = "inline-flex h-11 items-center rounded-[2px] border px-3 text-[13px] font-medium transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)]";
const CHIP_ON = "border-ink bg-ink text-paper";
const CHIP_OFF = "border-line text-ink hover:bg-surface-2";
const PAGER = "inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-line-strong text-ink transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)] hover:bg-ink hover:text-paper disabled:border-line disabled:text-ink-muted disabled:hover:bg-transparent disabled:hover:text-ink-muted";
const pad = (n: number) => String(n).padStart(2, "0");

/** Hero deal (§4.15): first active campaign on the first brochure page — poster price, full countdown, ink add-to-cart. */
function HeroDeal({ item, className }: { item: BrochureItem; className?: string }) {
  const t = useTranslations("offers");
  const tc = useTranslations("common");
  const locale = useLocale();
  return (
    <article className={cn("grid gap-6 border border-line bg-card p-5 sm:grid-cols-2 md:p-6", className)}>
      <Link href={`/produkt/${item.slug}`} className="frame relative block aspect-[4/5] overflow-hidden bg-surface sm:aspect-auto sm:h-full sm:min-h-[420px]" aria-label={item.name}>
        <SmartImage src={item.image.src} alt={item.image.alt} blur={item.image.blur} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 30vw" className="object-cover" />
      </Link>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badges badges={["knaller", ...item.badges]} discount={item.discount} size="md" max={4} />
        </div>
        <div>
          <p className="eyebrow">{t("heroEyebrow")} · {item.campaignTitle}</p>
          <h3 className="display mt-3 text-[clamp(1.5rem,2.4vw,2.25rem)] leading-[1.05] text-ink">
            <Link href={`/produkt/${item.slug}`} className="decoration-red decoration-2 underline-offset-[6px] hover:underline">{item.name}</Link>
          </h3>
          <p className="mt-2 text-sm text-ink-muted">{item.subtitle} · <span className="num">{item.unitLabel}</span></p>
        </div>
        <PriceTag size="poster" price={item.price} oldPrice={item.oldPrice} basePrice={item.basePrice} pfand={item.pfand || undefined} />
        {item.validUntil && (
          <div className="rule pt-4">
            <p className="price-meta">{t("valid", { date: formatDateShort(item.validUntil, locale) })}</p>
            <p className="eyebrow mt-3 mb-2">{t("ends")}</p>
            <Countdown until={item.validUntil} />
          </div>
        )}
        <AddToCart item={toCartItem(item)} variant="full" />
        <p className="price-meta">{tc("householdNote")}</p>
      </div>
    </article>
  );
}

/**
 * Signature feature (§4.41): the weekly leaflet as a white sheet on a `surface` band — filter chips, folio,
 * 45° page flip (fade under reduced motion), ←/→ keys, 44 px square pager, list view, legal line.
 */
export function FlipBrochure({ pages, categories, hero }: { pages: BrochurePage[]; categories: { slug: string; name: string }[]; hero?: BrochureItem | null }) {
  const t = useTranslations("offers");
  const tc = useTranslations("common");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [cat, setCat] = useState("all");
  const [view, setView] = useState<"pages" | "list">("pages");

  const filteredPages = pages.map((p) => ({ ...p, items: p.items.filter((i) => cat === "all" || i.category === cat) })).filter((p) => p.items.length);
  const total = filteredPages.length;
  const safeIdx = Math.min(idx, Math.max(0, total - 1));
  const page = filteredPages[safeIdx];
  const go = (d: 1 | -1) => { setDir(d); setIdx((i) => Math.max(0, Math.min(total - 1, i + d))); };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
  };
  const allItems = filteredPages.flatMap((p) => p.items);
  const soonest = allItems.map((i) => i.validUntil).filter((v): v is string => Boolean(v)).sort()[0];
  const showHero = Boolean(hero) && cat === "all" && safeIdx === 0 && view === "pages";
  const tiles = page ? page.items.filter((i) => !(showHero && hero && i.slug === hero.slug)) : [];
  const validUntil = page?.items.map((i) => i.validUntil).filter((v): v is string => Boolean(v)).sort().at(-1);

  return (
    <>
      <div className="container-x">
        <div className="flex flex-wrap items-center gap-2 pb-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("filterLabel")}>
            {[{ slug: "all", name: t("filterAll") }, ...categories].map((c) => (
              <button key={c.slug} type="button" onClick={() => { setCat(c.slug); setIdx(0); }} aria-pressed={cat === c.slug} className={cn(CHIP, cat === c.slug ? CHIP_ON : CHIP_OFF)}>{c.name}</button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-x-5 gap-y-3">
            {soonest && <span className="inline-flex items-center gap-2"><span className="eyebrow">{t("endsSoon")}</span><Countdown until={soonest} compact className="data-lg text-red-text" /></span>}
            <Cta variant="secondary" size="sm" arrow={false} type="button" aria-pressed={view === "list"} onClick={() => setView((v) => (v === "pages" ? "list" : "pages"))}>
              {view === "list" ? t("pageView") : t("listView")}
            </Cta>
          </div>
        </div>
      </div>

      <section className="bg-surface py-12 md:py-16">
        <div className="container-x">
          {allItems.length === 0 ? (
            <p className="py-16 text-center text-ink-muted">{t("empty")}</p>
          ) : view === "list" ? (
            <div className="on-paper border border-line-strong p-4 md:p-6">
              <div className="overflow-x-auto">
                <table className="num w-full min-w-[760px] text-sm">
                  <thead>
                    <tr className="text-left">
                      <th scope="col" className="eyebrow pb-3 pr-4">{t("table.name")}</th>
                      <th scope="col" className="eyebrow pb-3 pr-4">{t("table.content")}</th>
                      <th scope="col" className="eyebrow pb-3 pr-4">{t("table.basePrice")}</th>
                      <th scope="col" className="eyebrow pb-3 pr-4">{t("table.price")}</th>
                      <th scope="col" className="eyebrow pb-3 pr-4">{t("table.instead")}</th>
                      <th scope="col" className="eyebrow pb-3 pr-4">{t("table.pfand")}</th>
                      <th scope="col" className="eyebrow pb-3 pr-4">{t("table.valid")}</th>
                      <th scope="col" className="pb-3"><span className="sr-only">{tc("addToCart")}</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line border-t border-line-strong">
                    {allItems.map((p) => (
                      <tr key={p.slug}>
                        <th scope="row" className="py-3 pr-4 text-left font-medium text-ink">
                          <Link href={`/produkt/${p.slug}`} className="underline-offset-4 hover:underline">{p.name}</Link>
                          <span className="block text-[12px] font-normal text-ink-muted">{p.campaignTitle}</span>
                        </th>
                        <td className="py-3 pr-4 text-ink-muted">{p.unitLabel}</td>
                        <td className="py-3 pr-4 text-ink-muted">{formatBasePrice(p.basePrice.amount, p.basePrice.per, locale)}</td>
                        <td className="py-3 pr-4"><span className={cn("price price-sm", p.oldPrice && p.oldPrice > p.price && "price-offer")}>{formatPrice(p.price, locale)}</span></td>
                        <td className="py-3 pr-4">{p.oldPrice && p.oldPrice > p.price ? <s className="price-old">{formatPrice(p.oldPrice, locale)}</s> : <span className="text-ink-muted">—</span>}</td>
                        <td className="py-3 pr-4 text-ink-muted">{p.pfand > 0 ? formatPrice(p.pfand, locale) : "—"}</td>
                        <td className="py-3 pr-4 text-ink-muted">{p.validUntil ? formatDateShort(p.validUntil, locale) : "—"}</td>
                        <td className="py-3 text-right"><AddToCart item={toCartItem(p)} variant="pill" /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="price-meta rule mt-6 pt-4">{tc("householdNote")}</p>
            </div>
          ) : page ? (
            <div className="flip-scene outline-none" tabIndex={0} onKeyDown={onKey} role="region" aria-label={t("title")}>
              <AnimatePresence mode="wait" initial={false}>
                <m.div
                  key={`${cat}-${page.n}`}
                  className="flip-page on-paper border border-line-strong p-6 md:p-10"
                  initial={reduce ? { opacity: 0 } : { rotateY: dir * 45, opacity: 0, transformOrigin: dir > 0 ? "left center" : "right center" }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={reduce ? { opacity: 0 } : { rotateY: dir * -45, opacity: 0, transformOrigin: dir > 0 ? "right center" : "left center" }}
                  transition={{ duration: reduce ? 0.2 : 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="rule-b mb-6 flex items-end justify-between gap-4 pb-4">
                    <p className="display text-[2rem] leading-none tabular-nums text-ink" aria-label={t("page", { n: safeIdx + 1, total })}>
                      <span className="text-red-text">{pad(safeIdx + 1)}</span> <span className="text-ink-muted">/ {pad(total)}</span>
                    </p>
                    {validUntil && <p className="num text-[12px] text-ink-muted">{t("valid", { date: formatDateShort(validUntil, locale) })}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-12 md:gap-6">
                    {showHero && hero && <HeroDeal item={hero} className="col-span-2 md:col-span-12 lg:col-span-6 lg:row-span-2" />}
                    {tiles.map((p) => (
                      <div key={p.slug} className="col-span-1 flex flex-col md:col-span-4 lg:col-span-3">
                        <p className="eyebrow mb-2 truncate">{p.campaignTitle}</p>
                        <ProductCard p={p} showCountdown className="flex-1" />
                      </div>
                    ))}
                  </div>
                  <p className="price-meta rule mt-8 pt-4">{tc("householdNote")}</p>
                </m.div>
              </AnimatePresence>
              <div className="mt-6 flex items-center justify-center gap-3">
                <button type="button" onClick={() => go(-1)} disabled={safeIdx === 0} aria-label={t("prev")} className={PAGER}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
                <span className="num min-w-[4.5rem] text-center text-sm text-ink" aria-live="polite">{safeIdx + 1} / {total}</span>
                <button type="button" onClick={() => go(1)} disabled={safeIdx >= total - 1} aria-label={t("next")} className={PAGER}><ChevronRight className="h-4 w-4" aria-hidden /></button>
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
