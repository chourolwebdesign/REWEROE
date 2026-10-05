"use server";

import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { after } from "next/server";
import { alarmMail } from "@/lib/feedback/alarm";
import { checkFeedback, createLimiter, needsAlarm, type FeedbackInput } from "@/lib/feedback/rules";
import { feedbackAlarmReady, feedbackRecipients, sendMail } from "@/lib/mailer";
import { absoluteUrl } from "@/lib/site";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

export type SendResult = { id: string } | { error: "ungueltig" | "zu-viele" | "fehler" };

const allow = createLimiter();
const db = () => createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

/** Rückmeldung prüfen, begrenzen und speichern. Die IP dient nur dem Zähler im Arbeitsspeicher. */
export async function sendFeedback(input: FeedbackInput): Promise<SendResult> {
  const clean = checkFeedback(input);
  if (!clean) return { error: "ungueltig" };
  // Vercel setzt x-forwarded-for selbst (nicht fälschbar); ohne die Kopfzeile (lokaler Server) gibt es kein Limit.
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip && !allow(ip)) return { error: "zu-viele" };
  const key = process.env.FEEDBACK_KEY;
  if (!key) {
    console.error("Feedback: FEEDBACK_KEY fehlt");
    return { error: "fehler" };
  }
  const { data, error } = await db().rpc("submit_feedback", {
    p_key: key,
    p_rating: clean.rating,
    p_aspects: clean.aspects,
    p_comment: clean.comment,
    p_contact: clean.contact,
    p_lang: clean.lang,
  });
  if (error || typeof data !== "string") {
    console.error("Feedback speichern", error?.code ?? "ohne ID");
    return { error: "fehler" };
  }
  if (needsAlarm(clean.rating) && feedbackAlarmReady()) {
    // nach der Antwort senden: die Seite wartet nicht auf den Mailserver
    after(() => sendMail({ to: feedbackRecipients(), ...alarmMail(clean, absoluteUrl("/cockpit/feedback")) }).catch((e) => console.error("Feedback-Alarm", e)));
  }
  return { id: data };
}

/** Vermerkt, dass nach dem Dank „Auf Google bewerten“ angetippt wurde (nur für frische Einträge). */
export async function markGoogleClick(id: string): Promise<void> {
  const key = process.env.FEEDBACK_KEY;
  if (!key || !UUID.test(id)) return;
  await db().rpc("feedback_google_click", { p_key: key, p_id: id });
}
