/**
 * Inhalte des abonnierbaren Markt-Kalenders: Prospektwochen, Feiertage/Sonderzeiten und Termine.
 * Alles abgeleitet aus belegten Regeln (lib/flyer.ts, lib/hours.ts) und den Sondertagen und Terminen aus dem Cockpit.
 */
import { markt } from "@/content/markt";
import { flyerWeek } from "./flyer";
import { addDays, berlinNow, formatTime, upcomingSpecialDays, weekdayOf } from "./hours";
import type { IcsEvent } from "./ics";
import type { Termin } from "./inhalte/rules";
import type { HoursConfig } from "./types";

const UID = "@rewe-roedelheim";

export function marketEvents(
  now: Date = new Date(),
  { weeks = 26, days = 400, cfg = markt.hours, events = [] }: { weeks?: number; days?: number; cfg?: HoursConfig; events?: readonly Termin[] } = {},
): IcsEvent[] {
  const today = berlinNow(now).date;
  const list: IcsEvent[] = [];

  const first = flyerWeek(now);
  const monday = addDays(first.from, 1 - weekdayOf(first.from));
  for (let k = 0; k < weeks; k++) {
    const week = flyerWeek(new Date(`${addDays(monday, 7 * k)}T10:00:00Z`));
    list.push({
      uid: `prospekt-${week.from}${UID}`,
      date: week.from,
      summary: `REWE Rödelheim: neuer Prospekt (KW ${week.kw})`,
      description: `Die Angebote der Woche, gültig ${week.range}.\n${markt.links.flyer}`,
      url: markt.links.flyer,
    });
  }

  for (const d of upcomingSpecialDays(today, days, cfg)) {
    const summary = !d.hours
      ? `REWE Rödelheim geschlossen – ${d.label}`
      : d.provisional
        ? `REWE Rödelheim: ${d.label} – voraussichtlich bis ${formatTime(d.hours[1])}`
        : `REWE Rödelheim: ${d.label} – ${formatTime(d.hours[0]).replace(" Uhr", "")}–${formatTime(d.hours[1])}`;
    // ein geschlossener Sondertag aus dem Cockpit (z. B. Inventur) ist kein Feiertag
    const fromCockpit = cfg.specialDays.some((s) => s.date === d.date);
    const description = !d.hours
      ? fromCockpit
        ? "Der Markt bleibt an diesem Tag geschlossen."
        : "Gesetzlicher Feiertag in Hessen – der Markt bleibt geschlossen."
      : d.provisional
        ? "Gesetzlicher Ladenschluss in Hessen (§ 3 HLöG). Genaue Zeiten geben wir rechtzeitig bekannt."
        : "Geänderte Öffnungszeiten.";
    list.push({ uid: `tag-${d.date}${UID}`, date: d.date, summary, description });
  }

  for (const t of events.filter((t) => t.date >= today)) {
    list.push({
      uid: `termin-${t.id}${UID}`,
      date: t.date,
      summary: `REWE Rödelheim: ${t.title}`,
      description: [t.time, t.text].filter(Boolean).join("\n"),
    });
  }

  return list.sort((a, b) => a.date.localeCompare(b.date));
}
