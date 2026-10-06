import "server-only";
import { request } from "node:https";
import { SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase/config";

/**
 * JSON aus der Supabase-REST-API lesen – bewusst nicht über `fetch`: Next legt fetch-Antworten unter `revalidate` in seinen
 * Daten-Cache, der Builds überlebte und schon gelöschte Prospekte lieferte. So liest jeder Build und jede Neuerzeugung
 * (stündliches ISR, revalidatePath aus dem Cockpit) den aktuellen Stand; die Seiten bleiben trotzdem statisch.
 */
export function getJson<T>(url: string, what: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const req = request(url, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, timeout: 10_000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if ((res.statusCode ?? 500) >= 400) return reject(new Error(`Supabase (${what}) antwortet mit ${res.statusCode}`));
        try {
          resolve(JSON.parse(body) as T);
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on("timeout", () => req.destroy(new Error(`Supabase (${what}) antwortet nicht`)));
    req.on("error", reject);
    req.end();
  });
}
