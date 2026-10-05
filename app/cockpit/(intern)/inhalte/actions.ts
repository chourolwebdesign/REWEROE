"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/cockpit/auth";
import { formValues, type FormState } from "@/lib/cockpit/form-state";
import { berlinNow, formatDayMonth } from "@/lib/hours";
import { checkEvent, checkJob, checkSpecialDay, isIsoDate } from "@/lib/inhalte/rules";

const SAVED = "Gespeichert – in wenigen Sekunden auf der Website.";
const SAVE_FAILED = "Speichern hat nicht geklappt – bitte noch einmal versuchen.";
const DELETE_FAILED = "Löschen hat nicht geklappt – bitte noch einmal versuchen.";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");
const today = () => berlinNow(new Date()).date;
/** Fehler mit den Eingaben zurückgeben – React setzt das Formular nach jeder Aktion zurück */
const failed = (error: string, fd: FormData): FormState => ({ error, values: formValues(fd) });

/** Alle Seiten unter dem Wurzel-Layout (Website mit Kopf, Fuß und JSON-LD, dazu das Cockpit) und den Markt-Kalender neu erzeugen */
function refresh() {
  revalidatePath("/", "layout");
  revalidatePath("/kalender.ics");
}

export async function saveSpecialDay(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireEditor();
  const res = checkSpecialDay(
    { date: str(fd, "date"), label: str(fd, "label"), closed: fd.get("closed") === "on", opens: str(fd, "opens"), closes: str(fd, "closes") },
    today(),
  );
  if ("error" in res) return failed(res.error, fd);
  const { error } = await supabase.from("special_days").upsert({ ...res.ok, updated_at: new Date().toISOString() });
  if (error) return failed(SAVE_FAILED, fd);
  refresh();
  return { ok: `${res.ok.label} am ${formatDayMonth(res.ok.date)}: ${SAVED}` };
}

export async function deleteSpecialDay(date: string): Promise<FormState> {
  const { supabase } = await requireEditor();
  if (!isIsoDate(date)) return { error: DELETE_FAILED };
  const { error } = await supabase.from("special_days").delete().eq("date", date);
  if (error) return { error: DELETE_FAILED };
  refresh();
  return { ok: "Gelöscht." };
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export async function saveEvent(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireEditor();
  const res = checkEvent({ id: str(fd, "id"), date: str(fd, "date"), time: str(fd, "time"), title: str(fd, "title"), text: str(fd, "text") }, today());
  if ("error" in res) return failed(res.error, fd);
  const { id, row } = res.ok;
  const { error } = id ? await supabase.from("events").update(row).eq("id", id) : await supabase.from("events").insert(row);
  if (error) return failed(SAVE_FAILED, fd);
  refresh();
  return { ok: `${row.title}: ${SAVED}` };
}

export async function deleteEvent(id: string): Promise<FormState> {
  const { supabase } = await requireEditor();
  if (!UUID.test(id)) return { error: DELETE_FAILED };
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: DELETE_FAILED };
  refresh();
  return { ok: "Gelöscht." };
}

export async function saveJob(_prev: FormState, fd: FormData): Promise<FormState> {
  const { supabase } = await requireEditor();
  const res = checkJob(
    { id: str(fd, "id"), title: str(fd, "title"), employment: str(fd, "employment"), text: str(fd, "text"), validThrough: str(fd, "validThrough"), active: fd.get("active") === "on" },
    today(),
  );
  if ("error" in res) return failed(res.error, fd);
  const { id, row } = res.ok;
  const { error } = id ? await supabase.from("jobs").update(row).eq("id", id) : await supabase.from("jobs").insert(row);
  if (error) return failed(SAVE_FAILED, fd);
  refresh();
  return { ok: `${row.title}: ${row.active ? SAVED : "Gespeichert – auf der Website ausgeblendet."}` };
}

export async function deleteJob(id: string): Promise<FormState> {
  const { supabase } = await requireEditor();
  if (!UUID.test(id)) return { error: DELETE_FAILED };
  const { error } = await supabase.from("jobs").delete().eq("id", id);
  if (error) return { error: DELETE_FAILED };
  refresh();
  return { ok: "Gelöscht." };
}

export async function setJobActive(id: string, active: boolean): Promise<FormState> {
  const { supabase } = await requireEditor();
  if (!UUID.test(id)) return { error: SAVE_FAILED };
  const { error } = await supabase.from("jobs").update({ active: active === true }).eq("id", id);
  if (error) return { error: SAVE_FAILED };
  refresh();
  return { ok: active ? "Wieder auf der Website." : "Ausgeblendet." };
}
