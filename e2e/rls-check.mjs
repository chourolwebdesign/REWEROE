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
