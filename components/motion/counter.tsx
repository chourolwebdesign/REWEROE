"use client";
import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Count-up numeral (documented 1.2 s exception to the 600 ms motion budget — it is data).
 * Always starts at 0 on both server and client (no hydration mismatch); reduced-motion clients jump to `value`
 * in the effect instead of animating.
 */
export function Counter({ value, suffix = "", className, locale = "de", duration = 1200 }: { value: number; suffix?: string; className?: string; locale?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "10000px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    if (reduce) {
      raf = requestAnimationFrame(() => setN(value));
      return () => cancelAnimationFrame(raf);
    }
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  const fmt = new Intl.NumberFormat(locale === "en" ? "en-GB" : "de-DE").format(n);
  return (
    <span ref={ref} className={className}>
      {fmt}
      {suffix}
    </span>
  );
}
