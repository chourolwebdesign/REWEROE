import { termine } from "@/content/termine";
import { formatDayMonth, WEEKDAYS_SHORT, weekdayOf } from "@/lib/hours";

/** Kommende Termine im Markt. Rendert nichts, solange keine echten Termine eingetragen sind. */
export function TermineList({ today }: { today: string }) {
  const upcoming = termine.filter((t) => t.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  if (!upcoming.length) return null;
  return (
    <ul className="grid gap-3 md:grid-cols-2 md:gap-4">
      {upcoming.map((t) => (
        <li key={t.id} className="reveal flex gap-5 rounded-[1.75rem] bg-soft p-6">
          <p className="grid size-18 shrink-0 place-content-center rounded-2xl bg-white text-center">
            <span className="text-[0.8125rem] font-semibold text-red">{WEEKDAYS_SHORT[weekdayOf(t.date)]}</span>
            <span className="font-display text-[1.5rem] leading-none font-extrabold">{formatDayMonth(t.date)}</span>
          </p>
          <div>
            <h3 className="text-h3">{t.title}</h3>
            {t.time && <p className="mt-1 font-semibold">{t.time}</p>}
            <p className="mt-2 text-muted">{t.text}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export const hasUpcomingTermine = (today: string) => termine.some((t) => t.date >= today);
