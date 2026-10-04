"use client";
import { useTranslations } from "next-intl";
import { useMounted, useTick } from "@/lib/hooks";
import { berlinParts, formatOpenState, openState, type Hours, type HoursStatus } from "@/lib/hours";
import type { Weekday } from "@/lib/content/types";
import { cn } from "@/lib/utils";

const ORDER: Weekday[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/** Groups consecutive days with identical hours: Mo–Sa 07:00–22:00 · So geschlossen. */
export function groupHours(hours: Hours) {
  const groups: { from: Weekday; to: Weekday; days: Weekday[]; hours: [string, string] | null }[] = [];
  for (const d of ORDER) {
    const h = hours[d];
    const last = groups[groups.length - 1];
    if (last && JSON.stringify(last.hours) === JSON.stringify(h)) { last.to = d; last.days.push(d); }
    else groups.push({ from: d, to: d, days: [d], hours: h });
  }
  return groups;
}

/**
 * Footer „Öffnungszeiten" row (§4.4): grouped day ranges, today's range highlighted after mount via `openState()`,
 * plus the live state line. Pending hours → „Öffnungszeiten folgen". Hydration-safe (highlight appears after mount).
 */
export function FooterHours({ hours, hoursStatus }: { hours: Hours; hoursStatus: HoursStatus }) {
  const t = useTranslations("footer");
  const tc = useTranslations("common");
  const mounted = useMounted();
  useTick(60_000);
  const today = mounted ? berlinParts(new Date()).weekday : null;
  const live = mounted && hoursStatus === "published" ? formatOpenState(openState(hours, hoursStatus), tc) : null;
  return (
    <div className="flex justify-between gap-6 py-2.5">
      <dt className="shrink-0 text-block-muted">{t("hours")}</dt>
      <dd className="text-right">
        {hoursStatus === "pending" ? (
          <span className="text-block-muted">{tc("hoursPendingShort")}</span>
        ) : (
          groupHours(hours).map((g) => {
            const isToday = today !== null && g.days.includes(today);
            const days = g.from === g.to ? tc(`days.${g.from}`) : `${tc(`days.${g.from}`)}–${tc(`days.${g.to}`)}`;
            return (
              <span key={g.from} className={cn("num block", isToday ? "font-semibold text-block-ink" : "text-block-muted")}>
                {days} {g.hours ? `${g.hours[0]}–${g.hours[1]}` : t("closedDay")}
              </span>
            );
          })
        )}
        {live && <span className={cn("data-lg mt-1 block", live.tone === "open" ? "text-bio-text" : "text-block-muted")}>{live.text}</span>}
      </dd>
    </div>
  );
}
