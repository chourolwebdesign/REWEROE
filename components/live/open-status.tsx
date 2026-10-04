"use client";

import { openStatus } from "@/lib/hours";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";

const STYLES = {
  light: "bg-white text-ink ring-1 ring-inset ring-line",
  soft: "bg-soft text-ink",
  dark: "bg-white/12 text-white ring-1 ring-inset ring-white/20 backdrop-blur-md",
} as const;

/**
 * Live-Öffnungsstatus („Jetzt geöffnet · bis 22 Uhr“). Ohne JS bzw. vor der Hydration steht die Wochenzeit da.
 * `short` zeigt nur „Geöffnet“ / „Geschlossen“ (Header).
 */
export function OpenStatus({ tone = "light", short = false, className }: { tone?: keyof typeof STYLES; short?: boolean; className?: string }) {
  const now = useNow();
  const status = now ? openStatus(now) : null;
  const open = status?.open ?? null;
  const dot = open === null ? "text-muted" : open ? (tone === "dark" ? "text-open-bright" : "text-open") : tone === "dark" ? "text-red-bright" : "text-red";
  const raw = status ? (short ? status.short : status.text) : short ? "Mo – Sa 7 – 22 Uhr" : "Montag – Samstag 7 – 22 Uhr";
  // „7 Uhr“ nie über zwei Zeilen trennen
  const text = raw.replace(/ Uhr/g, "\u00a0Uhr");

  return (
    // w-fit: in Spalten-Layouts nicht auf volle Breite ziehen
    <span className={cn("inline-flex min-h-10 w-fit items-center gap-2.5 rounded-[1.25rem] px-4 py-2 text-[0.9375rem] leading-snug font-semibold", STYLES[tone], className)}>
      <span className={cn("live-dot", dot)} data-open={open === true ? "true" : undefined} aria-hidden />
      {/* zweizeilig (schmale Karten) ausgeglichen: „Geschlossen · öffnet / morgen um 7 Uhr“ */}
      <span className="[text-wrap:balance]">{text}</span>
      {status?.today.label && !short && <span className="sr-only">({status.today.label})</span>}
    </span>
  );
}
