"use client";
import { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

let hasNavigated = false;

/**
 * Page transition: fade + slight slide on client-side navigations only.
 * The very first paint is never hidden, so server-rendered content (and the LCP element) shows immediately.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const animate = useRef(hasNavigated && !reduce);
  useEffect(() => {
    hasNavigated = true;
  }, []);
  return (
    <motion.div initial={animate.current ? { opacity: 0, y: 12 } : false} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}
