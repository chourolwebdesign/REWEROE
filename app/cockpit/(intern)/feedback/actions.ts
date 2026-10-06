"use server";

import { revalidatePath } from "next/cache";
import { requireEditor } from "@/lib/cockpit/auth";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const SAVE_FAILED = "Speichern hat nicht geklappt – bitte noch einmal versuchen.";
const DELETE_FAILED = "Löschen hat nicht geklappt – bitte noch einmal versuchen.";

/** Eingang und Übersicht neu laden */
const refresh = () => revalidatePath("/cockpit", "layout");

export async function setFeedbackStatus(id: string, status: "neu" | "erledigt"): Promise<{ ok: true } | { error: string }> {
  const { editor, supabase } = await requireEditor();
  if (!UUID.test(id) || (status !== "neu" && status !== "erledigt")) return { error: SAVE_FAILED };
  const handled = status === "erledigt" ? { handled_at: new Date().toISOString(), handled_by: editor.id } : { handled_at: null, handled_by: null };
  const { error } = await supabase.from("feedback").update({ status, ...handled }).eq("id", id);
  if (error) return { error: SAVE_FAILED };
  refresh();
  return { ok: true };
}

export async function deleteFeedback(id: string): Promise<{ ok: true } | { error: string }> {
  const { supabase } = await requireEditor();
  if (!UUID.test(id)) return { error: DELETE_FAILED };
  const { error } = await supabase.from("feedback").delete().eq("id", id);
  if (error) return { error: DELETE_FAILED };
  refresh();
  return { ok: true };
}
