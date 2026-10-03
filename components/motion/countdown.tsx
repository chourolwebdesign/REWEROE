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

export function Countdown({ until, className, compact }: { until: string; className?: string; compact?: boolean }) {
  const t = useTranslations("countdown");
  const mounted = useMounted();
  const tick = useTick(1000);
  void tick;
  const left = mounted ? diff(until) : undefined;

  if (left === undefined) return <span className={cn("mono text-xs", className)} aria-hidden>··:··:··</span>;
  if (left === null) return <span className={cn("mono text-xs uppercase tracking-widest text-ink-muted", className)}>{t("over")}</span>;

  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = compact
    ? [left.d > 0 ? `${left.d}${t("days")}` : null, `${pad(left.h)}:${pad(left.m)}:${pad(left.s)}`].filter(Boolean)
    : [
        left.d > 0 ? [left.d, t("days")] : null,
        [pad(left.h), t("hours")],
        [pad(left.m), t("minutes")],
        [pad(left.s), t("seconds")],
      ].filter(Boolean);

  return (
    <span className={cn("mono inline-flex items-baseline gap-2 tabular-nums", className)} aria-live="off">
      {compact
        ? parts.join(" ")
        : (parts as [string | number, string][]).map(([v, l], i) => (
            <span key={i} className="inline-flex items-baseline gap-0.5">
              <span className="text-base font-medium">{v}</span>
              <span className="text-[10px] uppercase tracking-wider text-ink-muted">{l}</span>
            </span>
          ))}
    </span>
  );
}
