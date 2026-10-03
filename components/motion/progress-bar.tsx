"use client";
import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "10000px 0px -10% 0px" });
  const reduce = useReducedMotion();
  return (
    <div ref={ref} className={cn("flex items-center gap-4", className)}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-forest/10 dark:bg-cream/10" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
        <motion.div className="h-full rounded-full bg-gradient-to-r from-emerald to-rewe" initial={{ width: reduce ? `${value}%` : 0 }} animate={{ width: inView ? `${value}%` : 0 }} transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }} />
      </div>
      <span className="mono w-12 text-right text-sm tabular-nums">{value} %</span>
    </div>
  );
}
