"use client";
import { motion, useReducedMotion } from "framer-motion";

/** Hero-only: letter stagger 60ms. Screen readers get the plain text. */
export function CharReveal({ text, className, delay = 0.2 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  const words = text.split(" ");
  let i = 0;
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((word, wi) => (
        <span key={wi} className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch) => {
            const idx = i++;
            return (
              <motion.span
                key={idx}
                aria-hidden
                className="inline-block"
                initial={{ opacity: 0, y: "0.6em", filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay + idx * 0.06 }}
              >
                {ch}
              </motion.span>
            );
          })}
          {wi < words.length - 1 && <span aria-hidden>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
}
