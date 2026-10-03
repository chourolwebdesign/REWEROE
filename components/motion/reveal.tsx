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

/** Section entrance: 24px up + blur(8→0) + fade, 800ms, custom expo ease. Honors reduced m. */
export function Reveal({ children, className, delay = 0, y = 24, once = true }: Props) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={cn(className)}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "10000px 0px -8% 0px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </m.div>
  );
}

export function Stagger({ children, className, gap = 0.08 }: { children: React.ReactNode; className?: string; gap?: number }) {
  const reduce = useReducedMotion();
  return (
    <m.div
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "10000px 0px -8% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </m.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <m.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24, filter: "blur(8px)" },
        show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
      }}
    >
      {children}
    </m.div>
  );
}
