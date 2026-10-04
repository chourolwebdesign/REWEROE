"use client";
import { m, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  once?: boolean;
}

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
const DURATION = 0.6; // --dur-reveal
/** Keyboard focus inside a not-yet-revealed wrapper must never land on invisible content: override framer's inline opacity/transform while focus is within. */
const FOCUS_SAFE = "focus-within:opacity-100! focus-within:[transform:none]!";

/**
 * Section entrance: opacity 0→1, y 16→0, 600 ms, expo ease. Transform/opacity only — no blur.
 * The initial state is identical on server and client (hydration-safe); reduced motion only zeroes the duration,
 * and MotionConfig reducedMotion="user" (providers) drops the transform part.
 */
export function Reveal({ children, className, delay = 0, y = 16, once = true }: Props) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={cn(FOCUS_SAFE, className)}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "10000px 0px -8% 0px" }}
      transition={{ duration: reduce ? 0 : DURATION, ease: EASE, delay: reduce ? 0 : delay }}
    >
      {children}
    </m.div>
  );
}

export function Stagger({ children, className, gap = 0.06 }: { children: React.ReactNode; className?: string; gap?: number }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "10000px 0px -8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: reduce ? 0 : gap } } }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={cn(FOCUS_SAFE, className)}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: { duration: reduce ? 0 : DURATION, ease: EASE } },
      }}
    >
      {children}
    </m.div>
  );
}
