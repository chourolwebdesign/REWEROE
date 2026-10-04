"use client";
import { useRef } from "react";
import { m, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Goal progress (Nachhaltigkeit): 4 px `surface-2` track, red fill (no gradient, radius 0), tabular label in ink. */
export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "10000px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const v = Math.min(100, Math.max(0, value));
  return (
    <div ref={ref} className={cn("flex items-center gap-4", className)}>
      <div className="h-1 flex-1 overflow-hidden bg-surface-2" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <m.div className="h-full bg-red" initial={{ width: reduce ? `${v}%` : 0 }} animate={{ width: inView ? `${v}%` : 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <span className="num w-12 text-right text-sm text-ink">{v} %</span>
    </div>
  );
}
