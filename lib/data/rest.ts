import "server-only";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase/config";

/**
 * JSON aus der Supabase-REST-API lesen – bewusst nicht über `fetch`: Next legt fetch-Antworten unter `revalidate` in seinen
 * Daten-Cache, der Builds überlebte und schon gelöschte Prospekte lieferte. So liest jeder Build und jede Neuerzeugung
 * (stündliches ISR, revalidatePath aus dem Cockpit) den aktuellen Stand; die Seiten bleiben trotzdem statisch.
 * Bricht ab, wenn der Server 10 s lang nichts schickt oder die Antwort nach `deadlineMs` nicht vollständig ist – auch wenn die
 * Verbindung nach den Headern abreißt. `http:` nur für Tests mit einem lokalen Server.
 */
export function getJson<T>(url: string, what: string, { deadlineMs = 15_000 } = {}): Promise<T> {
  const request = url.startsWith("http:") ? httpRequest : httpsRequest;
  return new Promise((resolve, reject) => {
    const fail = (e: Error) => {
      clearTimeout(deadline);
      reject(e);
    };
    const req = request(url, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, timeout: 10_000 }, (res) => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", (chunk) => (body += chunk));
      res.on("error", (e) => fail(new Error(`Supabase (${what}): Verbindung abgebrochen (${e.message})`, { cause: e })));
      res.on("end", () => {
        clearTimeout(deadline);
        if (!res.complete) return reject(new Error(`Supabase (${what}): Antwort unvollständig`));
        if ((res.statusCode ?? 500) >= 400) return reject(new Error(`Supabase (${what}) antwortet mit ${res.statusCode}`));
        try {
          resolve(JSON.parse(body) as T);
        } catch (e) {
          reject(e);
        }
      });
    });
    const deadline = setTimeout(() => req.destroy(new Error(`Supabase (${what}) antwortet nicht`)), deadlineMs);
    req.on("timeout", () => req.destroy(new Error(`Supabase (${what}) antwortet nicht`)));
    req.on("error", (e) => fail(new Error(`Supabase (${what}): ${e.message}`, { cause: e })));
    req.end();
  });
}
