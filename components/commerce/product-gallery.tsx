"use client";
import { useState } from "react";
import { m, AnimatePresence } from "framer-motion";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import type { ImgVM } from "@/lib/blur";

export function ProductGallery({ images }: { images: ImgVM[] }) {
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState<{ x: number; y: number } | null>(null);
  const cur = images[i];
  return (
    <div className="grid gap-3 md:grid-cols-[72px_1fr]">
      <ul className="order-2 flex gap-2 md:order-1 md:flex-col" aria-label="Galerie">
        {images.map((img, idx) => (
          <li key={idx}>
            <button type="button" onClick={() => setI(idx)} aria-pressed={i === idx} aria-label={`Bild ${idx + 1}`} className={cn("relative block aspect-[4/5] w-[60px] overflow-hidden rounded-[8px] border-2 transition-colors md:w-full", i === idx ? "border-gold" : "border-transparent hover:border-line")}>
              <SmartImage src={img.src} alt="" blur={img.blur} fill sizes="80px" className="object-cover" />
            </button>
          </li>
        ))}
      </ul>
      <div
        className="group relative order-1 aspect-[4/5] overflow-hidden rounded-[14px] bg-surface-2 md:order-2"
        onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
        onMouseLeave={() => setZoom(null)}
      >
        <AnimatePresence mode="wait">
          <m.div key={cur.src} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
            <SmartImage
              src={cur.src} alt={cur.alt} blur={cur.blur} fill priority sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 ease-out"
              style={zoom ? { transform: "scale(1.6)", transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined}
            />
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
