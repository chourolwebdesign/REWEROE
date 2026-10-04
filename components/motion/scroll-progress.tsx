"use client";
import { m, useScroll, useSpring } from "framer-motion";

/** The page's one live red hairline: 2 px, fixed above the sticky header. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });
  return (
    <m.div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-red"
      style={{ scaleX }}
    />
  );
}
