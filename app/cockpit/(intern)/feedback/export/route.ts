import { requireEditor } from "@/lib/cockpit/auth";
import { FEEDBACK_FIELDS, toCsv, type FeedbackRow } from "@/lib/feedback/inbox";
import { allPages } from "@/lib/feedback/pages";
import { berlinNow } from "@/lib/hours";

/** Alle Rückmeldungen als CSV (Excel), nur für Editoren. */
export async function GET() {
  const { supabase } = await requireEditor();
  let rows: FeedbackRow[];
  try {
    // seitenweise: PostgREST liefert je Abfrage höchstens 1000 Zeilen; id als zweiter Schlüssel hält die Reihenfolge stabil
    rows = await allPages<FeedbackRow>((from, to) =>
      supabase.from("feedback").select(FEEDBACK_FIELDS).order("created_at", { ascending: false }).order("id").range(from, to),
    );
  } catch {
    return new Response("Export fehlgeschlagen", { status: 500 });
  }
  return new Response(toCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="feedback-${berlinNow(new Date()).date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
