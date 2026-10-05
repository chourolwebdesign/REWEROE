"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/cockpit/auth";
import { addDays, berlinNow, weekdayOf } from "@/lib/hours";
import { uploadWeek } from "@/lib/prospekt/week";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
type Supa = Awaited<ReturnType<typeof requireEditor>>["supabase"];

async function removeFlyer(supabase: Supa, id: string) {
  const { data } = await supabase.storage.from("prospekte").list(id, { limit: 200 });
  if (data?.length) await supabase.storage.from("prospekte").remove(data.map((f) => `${id}/${f.name}`));
  await supabase.from("flyers").delete().eq("id", id);
}

/** Alle öffentlichen Seiten neu erzeugen (Prospekt-Knöpfe im Kopf, Startseite, /angebote). */
function refresh() {
  revalidatePath("/", "layout");
}

export async function createDraft(input: { weekStart: string; sourceName: string }): Promise<{ id: string } | { error: string }> {
  const { supabase } = await requireEditor();
  const today = berlinNow(new Date()).date;
  if (!ISO.test(input.weekStart) || new Date(`${input.weekStart}T12:00:00Z`).getUTCDay() !== 1) return { error: "Ungültige Woche." };
  if (input.weekStart < addDays(today, -7) || input.weekStart > addDays(today, 35)) return { error: "Bitte eine Woche in der Nähe von heute wählen." };
  const w = uploadWeek(input.weekStart);
  const { data, error } = await supabase
    .from("flyers")
    .insert({ week_start: w.weekStart, kw: w.kw, year: w.year, valid_from: w.validFrom, valid_to: w.validTo, source_name: input.sourceName.slice(0, 200) })
    .select("id")
    .single();
  return error ? { error: "Der Prospekt konnte nicht angelegt werden." } : { id: data.id };
}

export async function publishDraft(input: { id: string; pageCount: number; pageWidth: number; pageHeight: number; format: "webp" | "jpg" }): Promise<{ ok: true; kw: number } | { error: string }> {
  const { supabase } = await requireEditor();
  const { id, pageCount, pageWidth, pageHeight, format } = input;
  if (!(pageCount >= 1 && pageCount <= 80 && pageWidth >= 100 && pageWidth <= 4000 && pageHeight >= 100 && pageHeight <= 6000) || !["webp", "jpg"].includes(format)) {
    return { error: "Ungültige Angaben zum Prospekt." };
  }
  const { data: draft } = await supabase.from("flyers").select("id,week_start,kw").eq("id", id).maybeSingle();
  if (!draft) return { error: "Der Entwurf ist nicht mehr vorhanden." };

  // Nur veröffentlichen, wenn wirklich alle Seiten und Vorschaubilder angekommen sind.
  const { data: files } = await supabase.storage.from("prospekte").list(id, { limit: 200 });
  const names = new Set((files ?? []).map((f) => f.name));
  for (let n = 1; n <= pageCount; n++) {
    if (!names.has(`${n}.${format}`) || !names.has(`thumb-${n}.${format}`)) return { error: `Seite ${n} fehlt noch – bitte erneut versuchen.` };
  }

  // Der alte Prospekt derselben Woche bleibt online, bis der neue vollständig ist – erst jetzt ersetzen.
  const { data: old } = await supabase.from("flyers").select("id").eq("week_start", draft.week_start).eq("status", "published").neq("id", id);
  for (const o of old ?? []) await removeFlyer(supabase, o.id);
  const { error } = await supabase.from("flyers").update({ page_count: pageCount, page_width: pageWidth, page_height: pageHeight, format, status: "published" }).eq("id", id);
  if (error) return { error: "Veröffentlichen hat nicht geklappt – bitte erneut versuchen." };

  // Aufräumen: Wochen, die länger als vier Wochen vorbei sind, und Entwürfe von gestern und früher.
  const today = berlinNow(new Date()).date;
  const monday = addDays(today, weekdayOf(today) === 0 ? -6 : 1 - weekdayOf(today));
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const { data: stale } = await supabase.from("flyers").select("id").or(`week_start.lt.${addDays(monday, -28)},and(status.eq.draft,created_at.lt."${dayAgo}")`);
  for (const s of stale ?? []) if (s.id !== id) await removeFlyer(supabase, s.id);

  refresh();
  return { ok: true, kw: draft.kw };
}

/** Entwurf verwerfen (Vorschau „Abbrechen“): Bilder und Zeile weg, nichts ändert sich auf der Website. */
export async function discardDraft(id: string): Promise<{ ok: true }> {
  const { supabase } = await requireEditor();
  const { data } = await supabase.from("flyers").select("status").eq("id", id).maybeSingle();
  if (data?.status === "draft") await removeFlyer(supabase, id);
  return { ok: true };
}

export async function deleteFlyer(id: string): Promise<{ ok: true } | { error: string }> {
  const { supabase } = await requireEditor();
  await removeFlyer(supabase, id);
  refresh();
  return { ok: true };
}
