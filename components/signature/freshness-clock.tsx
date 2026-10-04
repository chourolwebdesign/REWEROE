"use client";
import { useEffect, useState } from "react";
import { useMounted, useTick } from "@/lib/hooks";
import { useLocale, useTranslations } from "next-intl";
import { m } from "framer-motion";
import { openState, type Hours, type HoursStatus } from "@/lib/hours";
import { tx, type L10n } from "@/lib/l10n";
import { cn } from "@/lib/utils";

type Slot = { from: number; to: number; message: L10n };

function berlinHour(now: Date) {
  return Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Europe/Berlin" }).format(now)) % 24;
}
export function pickSlot(slots: Slot[], h: number) {
  return slots.find((s) => (s.from < s.to ? h >= s.from && h < s.to : h >= s.from || h < s.to)) ?? slots[0];
}

interface Props {
  slots: Slot[];
  /** Store hours from `getPrimaryStore()` → dot colour (bio = open · ink-muted = closed / pending). */
  hours?: Hours;
  hoursStatus?: HoursStatus;
  className?: string;
  /** `sm` → 36 px chip, label + time only (store teaser caption). Default 44 px with the time-of-day message. */
  size?: "md" | "sm";
  /** No-op: tokens flip inside `.on-block`. Kept for callers. */
  onBlock?: boolean;
  /** Legacy alias of `onBlock` (no-op). */
  inverse?: boolean;
}

/**
 * Frische-Uhr (§4.24): rectangular `data` chip. Live dot 6 px — `bg-bio-text` while the store is open (freshness green
 * is a legitimate REWE green), `bg-ink-muted` otherwise — with a finite `live-pulse` ring (3 cycles, then static).
 * Label „Frische-Uhr · 07:12" in Geist Mono, message Figtree 500 13 px in sentence case; the message changes with the
 * time of day in Rödelheim (`settings.freshnessClock`). Hydration-safe: time-dependent parts render after mount.
 */
export function FreshnessClock({ slots, hours, hoursStatus = "published", className, size = "md", onBlock, inverse }: Props) {
  void onBlock; void inverse;
  const locale = useLocale();
  const t = useTranslations("freshness");
  const mounted = useMounted();
  const [announce, setAnnounce] = useState(false);
  useTick(30_000);
  // The message is empty on SSR and filled on mount; `aria-live` is switched on one frame later so the initial fill is not announced on every page load.
  useEffect(() => {
    if (!mounted) return;
    const id = requestAnimationFrame(() => setAnnounce(true));
    return () => cancelAnimationFrame(id);
  }, [mounted]);
  const now = mounted ? new Date() : null;
  const slot = now ? pickSlot(slots, berlinHour(now)) : null;
  const time = now ? new Intl.DateTimeFormat("de-DE", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Berlin" }).format(now) : "";
  const state = !hours ? null : hoursStatus === "pending" ? openState(hours, "pending") : now ? openState(hours, hoursStatus, now) : null;
  const pending = !state || state.kind === "pending";
  const dot = state?.kind === "open" ? "bg-bio-text" : "bg-ink-muted";
  const message = slot ? tx(slot.message, locale) : "";

  return (
    <div className={cn("inline-flex items-center gap-3 rounded-[2px] border border-line bg-paper px-3 text-ink", size === "sm" ? "min-h-9" : "min-h-11", className)}>
      <span className="relative inline-flex h-1.5 w-1.5 shrink-0" aria-hidden>
        {!pending && <span className={cn("live-pulse absolute inset-0 rounded-full motion-reduce:animate-none", dot)} />}
        <span className={cn("relative inline-flex h-1.5 w-1.5 rounded-full", dot)} />
      </span>
      <span className="data whitespace-nowrap text-ink-muted">
        {t("label")}
        {time && ` · ${time}`}
      </span>
      {size !== "sm" && (
        <span aria-live={announce ? "polite" : undefined} className="text-[13px] font-medium leading-tight text-ink">
          {message && (
            <m.span key={message} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: [0.2, 0, 0, 1] }} className="inline-block">
              {message}
            </m.span>
          )}
        </span>
      )}
    </div>
  );
}
