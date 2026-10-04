"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { ImgVM } from "@/lib/blur";

/** PDP gallery (§4.39): main image 4:5 in a hairline frame on `surface`, 72 px square thumbs, active thumb edged in ink. */
export function ProductGallery({ images }: { images: ImgVM[] }) {
  const t = useTranslations("product");
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const cur = images[i];
  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr]">
      <ul className="order-2 flex gap-2 md:order-1 md:flex-col" aria-label={t("galleryLabel")}>
        {images.map((img, idx) => (
          <li key={idx}>
            <button
              type="button"
              onClick={() => setI(idx)}
              aria-pressed={i === idx}
              aria-label={t("imageN", { n: idx + 1 })}
              className={cn("frame relative block aspect-square w-[72px] overflow-hidden bg-surface transition-colors duration-[var(--dur-ui)] ease-[var(--ease-ui)]", i === idx ? "border-ink" : "hover:border-line-strong")}
            >
              <SmartImage src={img.src} alt="" blur={img.blur} fill sizes="72px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <div
        className="frame group relative order-1 aspect-[4/5] overflow-hidden bg-surface md:order-2"
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait" initial={false}>
          <m.div key={cur.src} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }} className="absolute inset-0">
            <SmartImage
              src={cur.src} alt={cur.alt} blur={cur.blur} fill priority sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-[var(--dur-hover)] ease-[var(--ease-out-expo)]"
              style={zoom && !reduce ? { transform: "scale(1.6)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
