"use client";
import { m, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return (
    <m.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px origin-left bg-gold"
      style={{ scaleX }}
    />
  );
}
