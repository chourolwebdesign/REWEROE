import type { Metadata } from "next";
import { FlyerUpload } from "@/components/cockpit/flyer-upload";
import { FlyerWeekList, type WeekRow } from "@/components/cockpit/flyer-week-list";
import { requireEditor } from "@/lib/cockpit/auth";
import { uploadWeekChoices } from "@/lib/prospekt/week";

export const metadata: Metadata = { title: "Prospekt" };

export default async function ProspektPage() {
  const { supabase } = await requireEditor();
  const weeks = uploadWeekChoices(new Date());
  const { data } = await supabase
    .from("flyers")
    .select("id,week_start,page_count,source_name")
    .eq("status", "published")
    .in("week_start", weeks.map((w) => w.weekStart));
  const rows: WeekRow[] = weeks.map((w) => {
    const f = data?.find((d) => d.week_start === w.weekStart);
    return { weekStart: w.weekStart, kw: w.kw, range: w.range, flyer: f ? { id: f.id, pageCount: f.page_count, sourceName: f.source_name } : null };
  });
  return (
    <>
      <p className="text-eyebrow text-red">Wochenprospekt</p>
      <h1 className="mt-2 text-h2">Prospekt hochladen.</h1>
      <p className="mt-3 max-w-[52ch] text-lede text-muted">
        Den nächsten Prospekt bekommst du meist freitags. Lade ihn hoch, sobald er da ist – die Website zeigt ihn ab Samstag als „Nächste Woche“.
      </p>
      <div className="mt-8">
        <FlyerUpload />
      </div>
      <h2 className="mt-12 text-h3">Wochen</h2>
      <div className="mt-4">
        <FlyerWeekList rows={rows} />
      </div>
    </>
  );
}
