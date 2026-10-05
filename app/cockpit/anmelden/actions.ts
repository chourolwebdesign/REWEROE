"use server";

import { redirect } from "next/navigation";
import { safeNext } from "@/lib/cockpit/safe-next";
import { supabaseServer } from "@/lib/supabase/server";

export interface SignInState {
  error?: string;
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("passwort") ?? "");
  if (!email || !password) return { error: "Bitte E-Mail und Passwort eingeben." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-Mail oder Passwort stimmt nicht." };
  redirect(safeNext(formData.get("weiter")));
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/cockpit/anmelden");
}
