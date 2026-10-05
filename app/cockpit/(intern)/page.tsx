import type { Metadata } from "next";
import { StatusCard } from "@/components/cockpit/status-card";
import { requireEditor } from "@/lib/cockpit/auth";
import { berlinNow, weekdayOf } from "@/lib/hours";
import { newFeedbackLine } from "@/lib/feedback/inbox";
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
  const wd = weekdayOf(berlinNow(now).date);
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
      </div>
    </>
  );
}
