import "server-only";
import { request } from "node:https";
import { cache } from "react";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const FIELDS = "id,week_start,kw,year,valid_from,valid_to,page_count,page_width,page_height,format";

/**
 * JSON per HTTPS lesen – bewusst nicht über `fetch`: Next legt fetch-Antworten unter `revalidate = 3600` in seinen
 * Daten-Cache, der Builds überlebt und schon gelöschte Prospekte lieferte. So liest jeder Build und jede Neuerzeugung
 * (stündliches ISR, revalidatePath aus dem Cockpit) den aktuellen Stand; die Seiten bleiben trotzdem statisch.
 */
function getJson<T>(url: string, headers: Record<string, string>): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = request(url, { headers, timeout: 10_000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if ((res.statusCode ?? 500) >= 400) return reject(new Error(`Supabase (Prospekte) antwortet mit ${res.statusCode}`));
        try {
          resolve(JSON.parse(body) as T);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("timeout", () => req.destroy(new Error("Supabase (Prospekte) antwortet nicht")));
    req.on("error", reject);
    req.end();
  });
}

/**
 * Veröffentlichte Prospekte der letzten Wochen (öffentlich über RLS), je Seitenaufbau nur einmal abgefragt (React cache).
 * Ein Fehler bricht den Build ab statt einer Seite ohne Prospekt; zur Laufzeit bleibt der letzte gute Stand online.
 */
export const publishedFlyers = cache(async (): Promise<FlyerRecord[]> =>
  getJson<FlyerRecord[]>(`${SUPABASE_URL}/rest/v1/flyers?select=${FIELDS}&status=eq.published&order=week_start.desc&limit=6`, {
    apikey: SUPABASE_PUBLISHABLE_KEY,
  }),
);
