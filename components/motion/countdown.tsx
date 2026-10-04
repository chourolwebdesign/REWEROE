"use client";
import { useMounted, useTick } from "@/lib/hooks";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

function diff(until: string) {
  const ms = new Date(until).getTime() - Date.now();
  if (ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Share (0–1) of a campaign window already elapsed — drives the 3 px offer progress bar (§4.15). */
export function elapsedShare(validFrom: string, validUntil: string, now: number = Date.now()): number {
  const a = new Date(validFrom).getTime(), b = new Date(validUntil).getTime();
  if (!(b > a)) return 1;
  return Math.min(1, Math.max(0, (now - a) / (b - a)));
}

/** Milliseconds left until `until` (≤ 0 when over). */
export const msLeft = (until: string, now: number = Date.now()) => new Date(until).getTime() - now;

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Countdown as data (§4.15): Geist Mono, tabular, red signal text, 1 s tick, `aria-live="off"`.
 * `compact` → one `data-lg` string ("2T 04:12:08"); full → `data-lg` 20 px numerals with `eyebrow` labels.
 */
export function Countdown({ until, className, compact }: { until: string; className?: string; compact?: boolean }) {
  const t = useTranslations("countdown");
  const mounted = useMounted();
  useTick(1000);
  const left = mounted ? diff(until) : undefined;

  if (left === undefined) return <span className={cn("data-lg text-red-text", className)} aria-hidden>··:··:··</span>;
  if (left === null) return <span className={cn("eyebrow", className)}>{t("over")}</span>;

  if (compact) {
    const text = [left.d > 0 ? `${left.d}${t("days")}` : null, `${pad(left.h)}:${pad(left.m)}:${pad(left.s)}`].filter(Boolean).join(" ");
    return <span className={cn("data-lg inline-flex items-baseline tabular-nums text-red-text", className)} aria-live="off">{text}</span>;
  }

  const parts: [string | number, string][] = [
    ...(left.d > 0 ? ([[left.d, t("days")]] as [string | number, string][]) : []),
    [pad(left.h), t("hours")],
    [pad(left.m), t("minutes")],
    [pad(left.s), t("seconds")],
  ];
  return (
    <span className={cn("inline-flex items-baseline gap-3 tabular-nums", className)} aria-live="off">
      {parts.map(([v, l], i) => (
        <span key={i} className="inline-flex items-baseline gap-1">
          <span className="data-lg text-[20px] text-red-text">{v}</span>
          <span className="eyebrow">{l}</span>
        </span>
      ))}
    </span>
  );
}
