import Link from "next/link";
import { REWE_PATH } from "@/lib/brand";
import { cn } from "@/lib/utils";

/** Roter REWE-Block mit weißer Wortmarke (Seitenverhältnis 2,5 : 1). */
export function LogoMark({ height = 32, className, framed = false }: { height?: number; className?: string; framed?: boolean }) {
  return (
    <svg viewBox="0 0 250 100" width={height * 2.5} height={height} aria-hidden="true" focusable="false" className={cn("block shrink-0", className)}>
      <rect width="250" height="100" fill="#CC071E" />
      {/* Auf rotem Grund: weißer Rand, damit der REWE-Block nicht im Hintergrund verschwindet */}
      {framed && <rect x="4" y="4" width="242" height="92" fill="none" stroke="#FFFFFF" strokeWidth="8" />}
      <g transform="translate(20 -55.02) scale(8.75)">
        <path d={REWE_PATH} fill="#FFFFFF" />
      </g>
    </svg>
  );
}

/** Logo + Marktzeile. `tone="light"` für dunklen Grund (Story-Hero, Footer). */
export function Logo({ tone = "dark", className, height = 34, framed = false }: { tone?: "dark" | "light"; className?: string; height?: number; framed?: boolean }) {
  return (
    <Link href="/" aria-label="REWE Rödelheim – zur Startseite" className={cn("group inline-flex min-h-11 items-center gap-3", className)}>
      <LogoMark height={height} framed={framed} />
      <span className={cn("leading-tight", tone === "light" ? "text-white" : "text-ink")}>
        <span className="block font-display text-[1.125rem] font-bold tracking-[-0.01em]">Rödelheim</span>
        {/* auf Rot volles Weiß: 12 px brauchen 4,5 : 1 (white/70 lag auf dem Hero-Rot bei 3,3 : 1) */}
        <span className={cn("block text-[0.75rem] font-medium", tone === "light" ? "text-white" : "text-muted")}>Ali Alamyaar oHG</span>
      </span>
    </Link>
  );
}
