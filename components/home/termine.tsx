import { formatDayMonth, WEEKDAYS_SHORT, weekdayOf } from "@/lib/hours";
import type { Termin } from "@/lib/inhalte/rules";

/** Kommende Termine im Markt (aus dem Cockpit). */
export function TermineList({ events }: { events: readonly Termin[] }) {
  return (
    <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
      {events.map((t) => (
        <li key={t.id} className="reveal flex gap-5 rounded-[1.75rem] bg-soft p-6">
          <p className="grid size-18 shrink-0 place-content-center rounded-2xl bg-white text-center">
            <span className="text-[0.8125rem] font-semibold text-red">{WEEKDAYS_SHORT[weekdayOf(t.date)]}</span>
            <span className="font-display text-[1.5rem] leading-none font-extrabold">{formatDayMonth(t.date)}</span>
          </p>
          <div>
            <h3 className="text-h3">{t.title}</h3>
            {t.time && <p className="mt-1 font-semibold">{t.time}</p>}
            {t.text && <p className="mt-2 text-muted">{t.text}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
