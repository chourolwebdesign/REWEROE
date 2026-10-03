"use client";
import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";

let hasNavigated = false;

/**
 * Page transition: fade + slight slide on client-side navigations only.
 * The very first paint is never hidden, so server-rendered content (and the LCP element) shows immediately.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const [animateIn] = useState(() => hasNavigated && !reduce);
  useEffect(() => {
    hasNavigated = true;
  }, []);
  return (
    <m.div initial={animateIn ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </m.div>
  );
}
