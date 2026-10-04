"use client";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import type { CardProduct } from "@/lib/view-models";

const arrow =
  "inline-flex h-11 w-11 items-center justify-center rounded-[2px] border border-line-strong bg-transparent text-ink transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)] hover:bg-ink hover:text-paper";

/** Horizontal offer rail: snap-scrolling cards (72 vw / 300 px), 44 px square secondary arrows on md+. Countdown always on. */
export function OffersCarousel({ items }: { items: CardProduct[] }) {
  const t = useTranslations("home");
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 pt-1 md:mx-0 md:px-0">
        {items.map((p) => (
          <div key={p.slug} className="w-[72vw] shrink-0 snap-start sm:w-[300px]">
            <ProductCard p={p} showCountdown />
          </div>
        ))}
      </div>
      <div className="mt-4 hidden justify-end gap-2 md:flex">
        <button type="button" onClick={() => scroll(-1)} aria-label={t("offersPrev")} className={arrow}><ChevronLeft className="h-4 w-4" aria-hidden /></button>
        <button type="button" onClick={() => scroll(1)} aria-label={t("offersNext")} className={arrow}><ChevronRight className="h-4 w-4" aria-hidden /></button>
      </div>
    </div>
  );
}
