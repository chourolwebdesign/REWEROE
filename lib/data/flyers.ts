import "server-only";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const FIELDS = "id,week_start,kw,year,valid_from,valid_to,page_count,page_width,page_height,format";

/**
 * Veröffentlichte Prospekte der letzten Wochen (öffentlich über RLS). Cache-Tag „prospekte“ – das Cockpit
 * erneuert ihn nach dem Veröffentlichen. Ein Fehler bricht den Build ab statt einer Seite ohne Prospekt.
 */
export async function publishedFlyers(): Promise<FlyerRecord[]> {
  const url = `${SUPABASE_URL}/rest/v1/flyers?select=${FIELDS}&status=eq.published&order=week_start.desc&limit=6`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    cache: "force-cache",
    next: { revalidate: 3600, tags: ["prospekte"] },
  });
  if (!res.ok) throw new Error(`Supabase (Prospekte) antwortet mit ${res.status}`);
  return res.json();
}
