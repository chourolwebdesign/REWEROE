// node --env-file=.env.local e2e/rls-check.mjs → Gäste lesen nur Veröffentlichtes, Editoren schreiben.
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cfg = readFileSync(new URL("../lib/supabase/config.ts", import.meta.url), "utf8");
const pick = (name) => process.env[`NEXT_PUBLIC_${name}`] || cfg.match(new RegExp(`${name} = [^"]*"([^"]+)"`))[1];
const url = pick("SUPABASE_URL");
const key = pick("SUPABASE_PUBLISHABLE_KEY");

const guest = createClient(url, key, { auth: { persistSession: false } });
const week = "2031-01-06"; // Montag weit in der Zukunft, kollidiert mit keinem echten Prospekt
const row = { week_start: week, kw: 2, year: 2031, valid_from: week, valid_to: "2031-01-11" };

assert.ok((await guest.from("flyers").insert(row)).error, "Gast darf keinen Prospekt anlegen");
assert.ok((await guest.storage.from("prospekte").upload("rls-test/1.webp", new Blob(["x"], { type: "image/webp" }))).error, "Gast darf keine Bilder hochladen");
assert.deepEqual((await guest.from("editors").select("*")).data ?? [], [], "Gast sieht keine Editoren");

const editor = createClient(url, key, { auth: { persistSession: false } });
assert.ifError((await editor.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD })).error);
const draft = await editor.from("flyers").insert(row).select("id").single();
assert.ifError(draft.error);
assert.deepEqual((await guest.from("flyers").select("id").eq("id", draft.data.id)).data, [], "Gast sieht keine Entwürfe");
assert.ifError((await editor.from("flyers").delete().eq("id", draft.data.id)).error);
console.log("✓ RLS: Gast liest nur Veröffentlichtes, Editor schreibt.");

// Feedback: Gast liest nichts und schreibt nur über submit_feedback mit dem Feedback-Schlüssel; Editoren lesen, erledigen, löschen.
const fbArgs = (key, rating = 2) => ({ p_key: key, p_rating: rating, p_aspects: ["kasse"], p_comment: "RLS-Test", p_contact: "rls@example.org", p_lang: "de" });
assert.ok((await guest.from("feedback").insert({ rating: 5 })).error, "Gast schreibt nicht direkt in feedback");
assert.equal((await guest.rpc("submit_feedback", fbArgs("falsch"))).error?.code, "42501", "falscher Feedback-Schlüssel → abgelehnt");
assert.ok((await guest.rpc("submit_feedback", { ...fbArgs(process.env.FEEDBACK_KEY), p_aspects: ["parkplatz"] })).error, "unbekannter Bereich → abgelehnt");
const fbBad = await guest.rpc("submit_feedback", fbArgs(process.env.FEEDBACK_KEY));
assert.ifError(fbBad.error);
const fbGood = await guest.rpc("submit_feedback", fbArgs(process.env.FEEDBACK_KEY, 5));
assert.ifError(fbGood.error);
try {
  assert.deepEqual((await guest.from("feedback").select("id")).data ?? [], [], "Gast liest kein Feedback");
  const seen = await editor.from("feedback").select("rating,aspects,comment,contact,status").eq("id", fbBad.data).single();
  assert.deepEqual(seen.data, { rating: 2, aspects: ["kasse"], comment: "RLS-Test", contact: "rls@example.org", status: "neu" });
  assert.equal((await editor.from("feedback").select("contact").eq("id", fbGood.data).single()).data?.contact, "", "bei 4–5 Sternen kein Kontakt");
  // 4–5 Sterne haben nichts zu erledigen (kein Kommentar, kein Kontakt) – sie landen nicht im Eingang „Neu“
  const goodState = (await editor.from("feedback").select("status,handled_at").eq("id", fbGood.data).single()).data;
  assert.ok(goodState?.status === "erledigt" && goodState.handled_at, "4–5 Sterne gleich erledigt");
  assert.equal((await editor.from("feedback").select("status").eq("id", fbBad.data).single()).data?.status, "neu", "1–3 Sterne neu");
  assert.ok((await editor.from("feedback").update({ comment: "geändert" }).eq("id", fbBad.data)).error, "Editor ändert keinen Text");
  assert.ifError((await editor.from("feedback").update({ status: "erledigt", handled_at: new Date().toISOString() }).eq("id", fbBad.data)).error);
  assert.ifError((await guest.rpc("feedback_google_click", { p_key: process.env.FEEDBACK_KEY, p_id: fbGood.data })).error);
  assert.equal((await editor.from("feedback").select("google_click").eq("id", fbGood.data).single()).data?.google_click, true, "Google-Klick vermerkt");
  console.log("✓ Feedback: schreibbar nur mit Schlüssel, lesbar nur für Editoren, Text unveränderlich.");
} finally {
  assert.ifError((await editor.from("feedback").delete().in("id", [fbBad.data, fbGood.data])).error);
}

// publish_flyer: Ersetzen und Freischalten in einer Transaktion – scheitert sie, bleibt der alte Prospekt online.
const w2 = "2031-01-13";
const row2 = { week_start: w2, kw: 3, year: 2031, valid_from: w2, valid_to: "2031-01-18" };
const old = await editor.from("flyers").insert({ ...row2, status: "published", page_count: 1, page_width: 1800, page_height: 2546 }).select("id").single();
assert.ifError(old.error);
const next = await editor.from("flyers").insert(row2).select("id").single();
assert.ifError(next.error);
const args = (pages) => ({ p_id: next.data.id, p_page_count: pages, p_page_width: 1800, p_page_height: 2546, p_format: "webp" });
try {
  assert.ok((await guest.rpc("publish_flyer", args(2))).error, "Gast darf nicht veröffentlichen");
  assert.ok((await editor.rpc("publish_flyer", args(99))).error, "ungültige Seitenzahl wird abgelehnt");
  const live = await editor.from("flyers").select("id").eq("week_start", w2).eq("status", "published");
  assert.deepEqual(live.data?.map((r) => r.id), [old.data.id], "nach dem Fehler ist der alte Prospekt weiter online");
  const done = await editor.rpc("publish_flyer", args(2));
  assert.ifError(done.error);
  assert.deepEqual(done.data, [old.data.id], "gibt die ersetzte ID zurück (für das Löschen der Bilder)");
  const after = await editor.from("flyers").select("id,status,page_count").eq("week_start", w2);
  assert.deepEqual(after.data, [{ id: next.data.id, status: "published", page_count: 2 }], "genau der neue Prospekt ist online");
  const gone = await editor.rpc("publish_flyer", { ...args(2), p_id: old.data.id });
  assert.equal(gone.error?.code, "P0002", "fehlender Entwurf → P0002");
  console.log("✓ publish_flyer: ersetzt in einer Transaktion, Fehler lassen den alten Prospekt stehen.");
} finally {
  await editor.from("flyers").delete().eq("week_start", w2);
}
