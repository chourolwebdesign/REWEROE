/**
 * Inhalte des abonnierbaren Markt-Kalenders: Prospektwochen, Feiertage/Sonderzeiten und Termine.
 * Alles abgeleitet aus belegten Regeln (lib/flyer.ts, lib/hours.ts) und content/termine.ts.
 */
import { markt } from "@/content/markt";
import { termine } from "@/content/termine";
import { flyerWeek } from "./flyer";
import { addDays, berlinNow, formatTime, upcomingSpecialDays, weekdayOf } from "./hours";
import type { IcsEvent } from "./ics";

const UID = "@rewe-roedelheim";

export function marketEvents(now: Date = new Date(), { weeks = 26, days = 400 }: { weeks?: number; days?: number } = {}): IcsEvent[] {
  const today = berlinNow(now).date;
  const events: IcsEvent[] = [];

  const first = flyerWeek(now);
  const monday = addDays(first.from, 1 - weekdayOf(first.from));
  for (let k = 0; k < weeks; k++) {
    const week = flyerWeek(new Date(`${addDays(monday, 7 * k)}T10:00:00Z`));
    events.push({
      uid: `prospekt-${week.from}${UID}`,
      date: week.from,
      summary: `REWE Rödelheim: neuer Prospekt (KW ${week.kw})`,
      description: `Die Angebote der Woche, gültig ${week.range}.\n${markt.links.flyer}`,
      url: markt.links.flyer,
    });
  }

  for (const d of upcomingSpecialDays(today, days)) {
    const summary = !d.hours
      ? `REWE Rödelheim geschlossen – ${d.label}`
      : d.provisional
        ? `REWE Rödelheim: ${d.label} – voraussichtlich bis ${formatTime(d.hours[1])}`
        : `REWE Rödelheim: ${d.label} – ${formatTime(d.hours[0]).replace(" Uhr", "")}–${formatTime(d.hours[1])}`;
    const description = !d.hours
      ? "Gesetzlicher Feiertag in Hessen – der Markt bleibt geschlossen."
      : d.provisional
        ? "Gesetzlicher Ladenschluss in Hessen (§ 3 HLöG). Genaue Zeiten geben wir rechtzeitig bekannt."
        : "Geänderte Öffnungszeiten.";
    events.push({ uid: `tag-${d.date}${UID}`, date: d.date, summary, description });
  }

  for (const t of termine.filter((t) => t.date >= today)) {
    events.push({
      uid: `termin-${t.id}${UID}`,
      date: t.date,
      summary: `REWE Rödelheim: ${t.title}`,
      description: [t.time, t.text].filter(Boolean).join("\n"),
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date));
}
