"use client";
import { useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber } from "@/lib/format";
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
/** Labels are typeset at this many CSS px regardless of the viewBox crop (SVG text otherwise shrinks with the zoom). */
const LABEL_PX = 12;
/** Origin and destination closer than this (user units) get offset labels so „Rödelheim" cannot sit on „Obsthof Keller". */
const CLOSE_UNITS = 30;

export interface JourneyProps {
  from: [number, number]; to: [number, number]; fromLabel: string; toLabel: string; distanceKm: number; story: string; international?: boolean; local?: boolean; className?: string;
}

/**
 * Signature feature (§4.32): farm-to-shelf journey on a minimal SVG map of Germany with a drawn route.
 * Ink outline, hairline under-route, signal-red drawn route (1.6 s — documented data-visualisation exception), static origin dot, pulsing destination.
 * Label size is derived from the rendered box (ResizeObserver) so short regional routes keep ≥ 12 px type; below md the map is capped at 260 px.
 */
export function JourneyMap({ from, to, fromLabel, toLabel, distanceKm, story, international, local, className }: JourneyProps) {
  const t = useTranslations("product");
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, margin: "10000px 0px -15% 0px" });
  const reduce = useReducedMotion();
  const [box, setBox] = useState({ w: 320, h: 420 });
  useEffect(() => {
    const el = svgRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0]?.contentRect;
      if (r && r.width > 0 && r.height > 0) setBox({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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
  const km = local ? "0" : formatNumber(distanceKm, locale);
  // CSS px per user unit under `xMidYMid meet` → user-unit font size that paints at LABEL_PX.
  const pxPerUnit = Math.min(box.w / vw, box.h / vh);
  const fs = LABEL_PX / pxPerUnit;
  // Short routes: push the labels apart — origin away from the destination (above-left when it lies north, below-left otherwise), destination the other way (right).
  const close = !local && dist < CLOSE_UNITS;
  const originNorth = A.y <= B.y;
  const fromPos = close
    ? { x: A.x - 12 * k, y: originNorth ? A.y - 14 * k : A.y + 26 * k, anchor: "end" as const }
    : { x: A.x, y: A.y + 26 * k, anchor: (A.x < B.x ? "end" : "start") as "end" | "start" };
  const toPos = close
    ? { x: 16 * k, y: originNorth ? 26 * k : -14 * k, anchor: "start" as const }
    : { x: 0, y: -18 * k, anchor: "middle" as const };

  return (
    <div ref={ref} className={cn("grid gap-8 border border-line bg-card p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:p-8", className)}>
      <svg ref={svgRef} viewBox={viewBox} role="img" aria-label={`${fromLabel} → ${toLabel}, ${km} km`} className="mx-auto h-auto max-h-[260px] w-full max-w-[360px] overflow-visible md:max-h-none">
        <polygon points={outline} className="fill-ink/[.04] stroke-ink/30" strokeWidth={1.5 * k} strokeLinejoin="round" />
        {!local && (
          <>
            <path d={d} fill="none" className="stroke-line" strokeWidth={6 * k} strokeLinecap="round" strokeDasharray={international ? "2 10" : undefined} />
            <m.path
              d={d} fill="none" className="stroke-red-text" strokeWidth={3 * k} strokeLinecap="round" strokeDasharray={international ? "6 8" : undefined}
              initial={{ pathLength: 0 }} animate={{ pathLength: inView || reduce ? 1 : 0 }} transition={{ duration: reduce ? 0 : 1.6, ease: [0.22, 1, 0.36, 1] }}
            />
            <g transform={`translate(${A.x} ${A.y})`}><circle r={8 * k} className="fill-ink" /></g>
          </>
        )}
        <g transform={`translate(${B.x} ${B.y})`}>
          <circle r={11 * k} className="fill-red-text" />
          {/* Always rendered (server and client must match); CSS hides the pulse for reduced motion. */}
          <circle r={11 * k} className="pulse-dot fill-red-text/50 motion-reduce:hidden" />
          <text x={toPos.x} y={toPos.y} textAnchor={toPos.anchor} fontSize={fs} className="fill-ink font-sans font-semibold">{toLabel}</text>
        </g>
        {!local && <text x={fromPos.x} y={fromPos.y} fontSize={fs} textAnchor={fromPos.anchor} className="fill-ink font-sans font-semibold">{fromLabel}</text>}
      </svg>
      <div className="flex flex-col justify-center">
        <p className="eyebrow">{t("journeyEyebrow")}</p>
        <h2 className="display mt-3 text-[clamp(1.5rem,2vw,2rem)] text-ink">{t("journeyTitle")}</h2>
        <dl className="mt-6 grid grid-cols-3 divide-x divide-line border-y border-line py-4">
          <div className="px-4 first:pl-0"><dt className="eyebrow">{t("journeyFrom")}</dt><dd className="num mt-1.5 text-sm text-ink">{fromLabel}</dd></div>
          <div className="px-4"><dt className="eyebrow">{t("journeyTo")}</dt><dd className="num mt-1.5 text-sm text-ink">{toLabel}</dd></div>
          <div className="px-4"><dt className="eyebrow">km</dt><dd className="num mt-1.5 text-sm text-red-text">{km}</dd></div>
        </dl>
        <p className="mt-5 text-ink-muted">{story}</p>
        <p className="mt-4 text-[12px] text-ink-muted">{local ? t("journeyLocal") : international ? t("journeyInternational") : t("journeyText")}</p>
      </div>
    </div>
  );
}
