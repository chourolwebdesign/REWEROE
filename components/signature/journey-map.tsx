"use client";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

/* Stylised outline of Germany (lat, lng), clockwise from Flensburg. */
const OUTLINE: [number, number][] = [
  [54.9, 9.4], [54.8, 9.9], [54.4, 10.2], [54.4, 11.1], [53.9, 11.5], [54.2, 12.1], [54.4, 13.0], [54.6, 13.4], [54.1, 13.8], [53.9, 14.2],
  [53.4, 14.4], [52.9, 14.1], [52.4, 14.6], [51.9, 14.7], [51.5, 15.0], [51.0, 14.9], [50.9, 14.3], [50.8, 13.5], [50.5, 12.4], [50.3, 12.2],
  [49.9, 12.5], [49.4, 12.9], [49.0, 13.5], [48.6, 13.8], [48.3, 13.0], [47.9, 12.9], [47.6, 12.3], [47.5, 11.4], [47.3, 10.9], [47.6, 10.2],
  [47.6, 9.6], [47.7, 8.6], [47.6, 7.6], [48.2, 7.6], [48.9, 8.2], [49.2, 6.7], [49.5, 6.4], [50.1, 6.1], [50.4, 6.3], [50.8, 6.0],
  [51.1, 5.9], [51.8, 6.0], [52.2, 7.0], [52.5, 6.7], [53.0, 7.2], [53.4, 7.0], [53.7, 7.2], [53.9, 8.2], [53.5, 8.5], [53.9, 8.9],
  [54.3, 8.6], [54.9, 8.6],
];
const W = 600, H = 790, LNG0 = 5.5, LAT0 = 55.2, KX = 61.8, KY = 98;
const project = ([lat, lng]: [number, number]) => ({ x: (lng - LNG0) * KX, y: (LAT0 - lat) * KY });
const inside = (p: [number, number]) => p[0] > 47.2 && p[0] < 55.2 && p[1] > 5.5 && p[1] < 15.2;

export interface JourneyProps {
  from: [number, number]; to: [number, number]; fromLabel: string; toLabel: string; distanceKm: number; story: string; international?: boolean; local?: boolean; className?: string;
}

/** Signature feature: farm-to-shelf journey on a minimal SVG map of Germany with a drawn route. */
export function JourneyMap({ from, to, fromLabel, toLabel, distanceKm, story, international, local, className }: JourneyProps) {
  const t = useTranslations("product");
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "10000px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const outline = OUTLINE.map(project).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const B = project(to);
  const A = inside(from) ? project(from) : { x: 40, y: H - 60 }; // international: enter from bottom-left edge
  const mid = { x: (A.x + B.x) / 2 + (B.y - A.y) * 0.18, y: (A.y + B.y) / 2 - (B.x - A.x) * 0.18 };
  const d = local ? "" : `M ${A.x} ${A.y} Q ${mid.x} ${mid.y} ${B.x} ${B.y}`;
  // Zoom to the route: close producers get a regional crop of the outline, far ones the whole country.
  const dist = Math.hypot(A.x - B.x, A.y - B.y);
  const span = local ? 320 : Math.min(W, Math.max(300, dist * 2.4));
  const vw = span, vh = span * (H / W);
  const cx = Math.min(Math.max((A.x + B.x) / 2, vw / 2), W - vw / 2), cy = Math.min(Math.max((A.y + B.y) / 2, vh / 2), H - vh / 2);
  const viewBox = span >= W ? `0 0 ${W} ${H}` : `${(cx - vw / 2).toFixed(0)} ${(cy - vh / 2).toFixed(0)} ${vw.toFixed(0)} ${vh.toFixed(0)}`;
  const k = span / W; // scale factor for stroke/marker sizes so they stay visually constant

  return (
    <div ref={ref} className={cn("grid gap-8 rounded-[16px] border border-line bg-card p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-8", className)}>
      <svg viewBox={viewBox} role="img" aria-label={`${fromLabel} → ${toLabel}, ${distanceKm} km`} className="mx-auto h-auto w-full max-w-[360px]">
        <polygon points={outline} className="fill-forest/[0.06] stroke-forest/30 dark:fill-cream/[0.04] dark:stroke-cream/30" strokeWidth={1.5 * k} strokeLinejoin="round" />
        {!local && (
          <>
            <path d={d} fill="none" className="stroke-gold/30" strokeWidth={6 * k} strokeLinecap="round" strokeDasharray={international ? "2 10" : undefined} />
            <motion.path d={d} fill="none" className="stroke-rewe" strokeWidth={3 * k} strokeLinecap="round" strokeDasharray={international ? "6 8" : undefined}
              initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: inView || reduce ? 1 : 0 }} transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }} />
            <g transform={`translate(${A.x} ${A.y})`}>
              <circle r={9 * k} className="fill-gold" /><circle r={9 * k} className="pulse-dot fill-gold/60" />
            </g>
          </>
        )}
        <g transform={`translate(${B.x} ${B.y})`}>
          <circle r={11 * k} className="fill-rewe" /><circle r={11 * k} className="pulse-dot fill-rewe/60" />
          <text y={-18 * k} textAnchor="middle" fontSize={13 * k} className="mono fill-forest font-medium tracking-wider uppercase dark:fill-cream">{toLabel}</text>
        </g>
        {!local && <text x={A.x} y={A.y + 26 * k} fontSize={12 * k} textAnchor={A.x < B.x ? "end" : "start"} className="mono fill-forest uppercase tracking-wider dark:fill-cream">{fromLabel}</text>}
      </svg>
      <div className="flex flex-col justify-center">
        <p className="eyebrow">{t("journeyEyebrow")}</p>
        <h2 className="mt-3 text-[clamp(1.5rem,2vw,2rem)] text-forest dark:text-cream">{t("journeyTitle")}</h2>
        <dl className="mono mt-6 grid grid-cols-3 gap-4 border-y border-line py-4 text-[11px] uppercase tracking-wider">
          <div><dt className="text-ink-muted">{t("journeyFrom")}</dt><dd className="mt-1 text-sm normal-case tracking-normal">{fromLabel}</dd></div>
          <div><dt className="text-ink-muted">{t("journeyTo")}</dt><dd className="mt-1 text-sm normal-case tracking-normal">{toLabel}</dd></div>
          <div><dt className="text-ink-muted">km</dt><dd className="mt-1 text-sm text-rewe">{local ? "0" : distanceKm.toLocaleString("de-DE")}</dd></div>
        </dl>
        <p className="mt-5 text-ink-muted">{story}</p>
        <p className="mono mt-4 text-[11px] uppercase tracking-wider text-ink-muted">{local ? t("journeyLocal") : international ? t("journeyInternational") : t("journeyText")}</p>
      </div>
    </div>
  );
}
