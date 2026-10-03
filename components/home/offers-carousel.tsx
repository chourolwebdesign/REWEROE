"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/commerce/product-card";
import type { CardProduct } from "@/lib/view-models";

export function OffersCarousel({ items }: { items: CardProduct[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={ref} className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-2 md:mx-0 md:px-0">
        {items.map((p) => (
          <div key={p.slug} className="w-[72vw] shrink-0 snap-start sm:w-[300px]">
            <ProductCard p={p} showCountdown />
          </div>
        ))}
      </div>
      <div className="mt-2 hidden justify-end gap-2 md:flex">
        <button type="button" onClick={() => scroll(-1)} aria-label="Zurück" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:bg-forest hover:text-cream"><ChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => scroll(1)} aria-label="Weiter" className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line transition-colors hover:bg-forest hover:text-cream"><ChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}
