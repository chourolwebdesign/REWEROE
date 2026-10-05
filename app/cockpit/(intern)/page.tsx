import type { Metadata } from "next";
import { StatusCard } from "@/components/cockpit/status-card";
import { markt } from "@/content/markt";
import { requireEditor } from "@/lib/cockpit/auth";
import { berlinNow, formatDayMonth, specialDayHours, upcomingSpecialDays, weekdayOf, type DayPlan } from "@/lib/hours";
import { newFeedbackLine } from "@/lib/feedback/inbox";
import { openSuggestions, rowToSpecialDay, type SpecialDayRow } from "@/lib/inhalte/rules";
import { uploadWeekChoices, type UploadWeek } from "@/lib/prospekt/week";

export const metadata: Metadata = { title: "Übersicht" };

export default async function UebersichtPage() {
  const { editor, supabase } = await requireEditor();
  const now = new Date();
  const [thisWeek, nextWeek] = uploadWeekChoices(now);
  const { data } = await supabase.from("flyers").select("week_start,page_count").eq("status", "published").in("week_start", [thisWeek.weekStart, nextWeek.weekStart]);
  const [{ count: fresh }, { count: urgent }] = await Promise.all([
    supabase.from("feedback").select("id", { count: "exact", head: true }).eq("status", "neu"),
    supabase.from("feedback").select("id", { count: "exact", head: true }).eq("status", "neu").lte("rating", 2),
  ]);
  const found = (w: UploadWeek) => data?.find((d) => d.week_start === w.weekStart);
  const today = berlinNow(now).date;
  const wd = weekdayOf(today);
  const { data: dayRows, error: dayError } = await supabase.from("special_days").select("date,label,closed,opens,closes").gte("date", today).order("date");
  if (dayError) throw new Error("Sondertage konnten nicht geladen werden.");
  const hours = { regular: markt.hours.regular, specialDays: (dayRows as SpecialDayRow[]).map(rowToSpecialDay) };
  // gesetzliche Grenztage (Heiligabend, Silvester, Gründonnerstag), deren Zeiten der Markt noch nicht festgelegt hat
  const pendingDays = openSuggestions(hours, today, 45);
  const nextDay = upcomingSpecialDays(today, 45, hours)[0];
  const dayLine = (d: DayPlan) => `${d.label} (${formatDayMonth(d.date)}) · ${specialDayHours(d)}`;
  // Rot, wenn diese Woche fehlt – oder ab Freitag (und sonntags) die nächste; der neue Prospekt kommt meist freitags.
  const alert = !found(thisWeek) || (!found(nextWeek) && (wd >= 5 || wd === 0));
  const line = (w: UploadWeek) => {
    const f = found(w);
    return f ? `KW ${w.kw} ✓ online (${f.page_count} Seiten)` : `KW ${w.kw} fehlt noch`;
  };
  return (
    <>
      <p className="text-eyebrow text-red">Markt-Cockpit</p>
      <h1 className="mt-2 text-h2">Hallo, {editor.name}.</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <StatusCard
          name="prospekt"
          title="Prospekt"
          lines={[line(thisWeek), line(nextWeek)]}
          alert={alert}
          action={{ href: "/cockpit/prospekt", label: found(nextWeek) ? "Prospekte ansehen" : "Prospekt hochladen" }}
        />
        <StatusCard
          name="feedback"
          title="Feedback"
          lines={[newFeedbackLine(fresh ?? 0), ...(urgent ? [`davon ${urgent} mit 1–2 Sternen`] : [])]}
          alert={Boolean(urgent)}
          action={{ href: "/cockpit/feedback", label: "Rückmeldungen ansehen" }}
        />
        <StatusCard
          name="sondertage"
          title="Öffnungszeiten"
          lines={
            pendingDays.length
              ? pendingDays.map((p) => `${p.label} (${formatDayMonth(p.date)}): Zeiten festlegen`)
              : [nextDay ? `Als Nächstes: ${dayLine(nextDay)}` : "Keine Abweichungen in den nächsten 45 Tagen"]
          }
          alert={pendingDays.length > 0}
          action={{ href: "/cockpit/inhalte/sondertage", label: pendingDays.length ? "Zeiten festlegen" : "Sondertage ansehen" }}
        />
      </div>
    </>
  );
}
