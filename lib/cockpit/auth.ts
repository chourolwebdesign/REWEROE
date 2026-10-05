import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export interface Editor {
  id: string;
  name: string;
  email: string;
}

/** Für jede Cockpit-Seite und jede Server Action: angemeldeter Editor, sonst zur Anmeldung. */
export async function requireEditor() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/cockpit/anmelden");
  const { data: row } = await supabase.from("editors").select("name").eq("user_id", claims.sub).maybeSingle();
  if (!row) redirect("/cockpit/anmelden?fehler=keine-berechtigung");
  const editor: Editor = { id: claims.sub, name: row.name, email: String(claims.email ?? "") };
  return { editor, supabase };
}
