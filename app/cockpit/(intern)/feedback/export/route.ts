import { requireEditor } from "@/lib/cockpit/auth";
import { FEEDBACK_FIELDS, toCsv, type FeedbackRow } from "@/lib/feedback/inbox";
import { berlinNow } from "@/lib/hours";

/** Alle Rückmeldungen als CSV (Excel), nur für Editoren. */
export async function GET() {
  const { supabase } = await requireEditor();
  const { data, error } = await supabase.from("feedback").select(FEEDBACK_FIELDS).order("created_at", { ascending: false }).limit(10000);
  if (error) return new Response("Export fehlgeschlagen", { status: 500 });
  return new Response(toCsv((data ?? []) as FeedbackRow[]), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback-${berlinNow(new Date()).date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
