import { buildCalendar } from "@/lib/ics";
import { marketEvents } from "@/lib/market-calendar";

/** Abonnierbarer Markt-Kalender (Apple, Google, Outlook). Statisch erzeugt, alle 6 Stunden neu. */
export const dynamic = "force-static";
export const revalidate = 21600;

export function GET() {
  const body = buildCalendar({
    name: "REWE Rödelheim",
    description: "Neuer Prospekt jede Woche, Feiertage und Sonderöffnungszeiten von REWE in der Thudichumstraße, Frankfurt-Rödelheim.",
    events: marketEvents(),
  });
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="rewe-roedelheim.ics"',
    },
  });
}
