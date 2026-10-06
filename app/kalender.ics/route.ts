import { eventsFrom, hoursConfig } from "@/lib/data/inhalte";
import { berlinNow } from "@/lib/hours";
import { buildCalendar } from "@/lib/ics";
import { marketEvents } from "@/lib/market-calendar";

/** Abonnierbarer Markt-Kalender (Apple, Google, Outlook). Statisch erzeugt, alle 6 Stunden und nach jedem Speichern im Cockpit neu. */
export const dynamic = "force-static";
export const revalidate = 21600;

export async function GET() {
  const now = new Date();
  const [cfg, events] = await Promise.all([hoursConfig(), eventsFrom(berlinNow(now).date)]);
  const body = buildCalendar({
    name: "REWE Rödelheim",
    description: "Neuer Prospekt jede Woche, Feiertage und Sonderöffnungszeiten von REWE in der Thudichumstraße, Frankfurt-Rödelheim.",
    events: marketEvents(now, { cfg, events }),
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="rewe-roedelheim.ics"',
    },
  });
}
