"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/cockpit/auth";
import { addDays, berlinNow, weekdayOf } from "@/lib/hours";
import { checkPublishInput, type PublishInput } from "@/lib/prospekt/publish";
import { uploadWeek } from "@/lib/prospekt/week";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
type Supa = Awaited<ReturnType<typeof requireEditor>>["supabase"];

async function removeImages(supabase: Supa, id: string) {
  const { data } = await supabase.storage.from("prospekte").list(id, { limit: 200 });
  if (data?.length) await supabase.storage.from("prospekte").remove(data.map((f) => `${id}/${f.name}`));
}

/** Erst die Zeile, dann die Bilder – so steht nie ein Prospekt ohne Bilder online. false: Zeile nicht gelöscht. */
async function removeFlyer(supabase: Supa, id: string) {
  const { error } = await supabase.from("flyers").delete().eq("id", id);
  if (error) return false;
  await removeImages(supabase, id);
  return true;
}

/** Wochen, die länger als vier Wochen vorbei sind, und Entwürfe von gestern und früher. */
async function cleanup(supabase: Supa, keep: string) {
  const today = berlinNow(new Date()).date;
  const monday = addDays(today, weekdayOf(today) === 0 ? -6 : 1 - weekdayOf(today));
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const { data: stale } = await supabase.from("flyers").select("id").or(`week_start.lt.${addDays(monday, -28)},and(status.eq.draft,created_at.lt."${dayAgo}")`);
  for (const s of stale ?? []) if (s.id !== keep) await removeFlyer(supabase, s.id);
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

/**
 * Was die Upload-Maske nach einem Fehler anbietet: noch einmal veröffentlichen („review“), ab einer Seite weiter
 * hochladen („upload“) oder das PDF neu wählen („restart“).
 */
export type PublishResult = { ok: true } | { error: string; next: "review" | "upload" | "restart"; fromPage?: number };

const AGAIN = "Veröffentlichen hat nicht geklappt – bitte noch einmal versuchen.";
const GONE = "Der Entwurf ist nicht mehr vorhanden. Bitte wähle das PDF noch einmal aus.";

export async function publishDraft(input: PublishInput): Promise<PublishResult> {
  const { supabase } = await requireEditor();
  const invalid = checkPublishInput(input);
  if (invalid) return { error: invalid, next: "restart" };
  const { id, pageCount, pageWidth, pageHeight, format } = input;
  const { data: draft } = await supabase.from("flyers").select("status").eq("id", id).maybeSingle();
  // schon veröffentlicht: die erste Antwort ging unterwegs verloren – kein Fehler
  if (draft?.status === "published") {
    refresh();
    return { ok: true };
  }
  if (!draft) return { error: GONE, next: "restart" };

  // Nur veröffentlichen, wenn wirklich alle Seiten und Vorschaubilder angekommen sind.
  const { data: files, error: listError } = await supabase.storage.from("prospekte").list(id, { limit: 200 });
  if (listError) return { error: AGAIN, next: "review" };
  const names = new Set((files ?? []).map((f) => f.name));
  for (let n = 1; n <= pageCount; n++) {
    if (!names.has(`${n}.${format}`) || !names.has(`thumb-${n}.${format}`)) {
      return { error: `Seite ${n} fehlt noch. Erneut versuchen lädt sie noch einmal hoch.`, next: "upload", fromPage: n };
    }
  }

  // Ersetzen und Freischalten in einer Transaktion (supabase/migrations/20261005140000_publish_flyer.sql):
  // scheitert etwas, bleibt der alte Prospekt der Woche online.
  const { data: replaced, error } = await supabase.rpc("publish_flyer", {
    p_id: id,
    p_page_count: pageCount,
    p_page_width: pageWidth,
    p_page_height: pageHeight,
    p_format: format,
  });
  if (error) return error.code === "P0002" ? { error: GONE, next: "restart" } : { error: AGAIN, next: "review" };
  refresh();

  // Aufräumen ändert nichts mehr am veröffentlichten Prospekt – Fehler hier nur protokollieren.
  try {
    for (const old of (replaced as string[] | null) ?? []) await removeImages(supabase, old);
    await cleanup(supabase, id);
  } catch (e) {
    console.error("Prospekt: Aufräumen nach dem Veröffentlichen", e);
  }
  return { ok: true };
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
  if (!(await removeFlyer(supabase, id))) return { error: "Löschen hat nicht geklappt – bitte noch einmal versuchen." };
  refresh();
  return { ok: true };
}
