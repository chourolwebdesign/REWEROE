"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import { Countdown } from "@/components/motion/countdown";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CardProduct } from "@/lib/view-models";

export interface BrochurePage { n: number; items: (CardProduct & { campaignTitle: string; category: string })[] }

export function FlipBrochure({ pages, categories }: { pages: BrochurePage[]; categories: { slug: string; name: string }[] }) {
  const t = useTranslations("offers");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState(1);
  const [cat, setCat] = useState("all");
  const filteredPages = pages.map((p) => ({ ...p, items: p.items.filter((i) => cat === "all" || i.category === cat) })).filter((p) => p.items.length);
  const page = filteredPages[Math.min(idx, filteredPages.length - 1)];
  const go = (d: 1 | -1) => { setDir(d); setIdx((i) => Math.max(0, Math.min(filteredPages.length - 1, i + d))); };
  const soonest = page?.items.map((i) => i.validUntil).filter(Boolean).sort()[0];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 border-b border-line pb-5">
        {[{ slug: "all", name: t("filterAll") }, ...categories].map((c) => (
          <button key={c.slug} type="button" onClick={() => { setCat(c.slug); setIdx(0); }} aria-pressed={cat === c.slug} className={cn("mono rounded-full border px-3 py-1 text-[11px] uppercase tracking-wider transition-colors", cat === c.slug ? "border-forest bg-forest text-cream dark:border-cream dark:bg-cream dark:text-forest" : "border-line hover:bg-forest/5")}>{c.name}</button>
        ))}
        {soonest && <span className="mono ml-auto inline-flex items-center gap-2 text-[11px] uppercase tracking-wider text-price">{t("endsSoon")}: <Countdown until={soonest} compact /></span>}
      </div>

      {!page ? <p className="py-16 text-center text-ink-muted">—</p> : (
        <div className="flip-scene mt-8">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={`${cat}-${page.n}`}
              className="flip-page rounded-[16px] border border-line bg-card p-5 shadow-card md:p-8"
              initial={reduce ? false : { rotateY: dir * 70, opacity: 0, transformOrigin: dir > 0 ? "left center" : "right center" }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={reduce ? { opacity: 0 } : { rotateY: dir * -70, opacity: 0, transformOrigin: dir > 0 ? "right center" : "left center" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="eyebrow">{t("page", { n: idx + 1, total: filteredPages.length })}</p>
                <p className="mono text-[11px] uppercase tracking-wider text-ink-muted">{page.items[0]?.validUntil ? t("valid", { date: formatDate(page.items[0].validUntil, locale) }) : ""}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                {page.items.map((p) => (
                  <div key={p.slug}>
                    <p className="eyebrow mb-2 truncate">{p.campaignTitle}</p>
                    <ProductCard p={p} showCountdown />
                  </div>
                ))}
              </div>
            </m.div>
          </AnimatePresence>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button type="button" onClick={() => go(-1)} disabled={idx === 0} aria-label={t("prev")} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:bg-forest hover:text-cream disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
            <span className="mono text-sm tabular-nums">{idx + 1} / {filteredPages.length}</span>
            <button type="button" onClick={() => go(1)} disabled={idx >= filteredPages.length - 1} aria-label={t("next")} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:bg-forest hover:text-cream disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
