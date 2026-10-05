// node --env-file=.env.local e2e/inhalte-website.mjs seed|check|clean – liest die Website Sondertage, Termine und Stellen aus der Datenbank?
// seed: Testeinträge anlegen (als Editor), danach bauen und starten; check: Seiten prüfen; clean: Testeinträge löschen.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { BASE, check } from "./lib.mjs";

const cfg = readFileSync(new URL("../lib/supabase/config.ts", import.meta.url), "utf8");
const pick = (name) => process.env[`NEXT_PUBLIC_${name}`] || cfg.match(new RegExp(`${name} = [^"]*"([^"]+)"`))[1];
const sb = createClient(pick("SUPABASE_URL"), pick("SUPABASE_PUBLISHABLE_KEY"), { auth: { persistSession: false } });
await sb.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD });

/** Berliner Datum in `n` Tagen */
const berlin = (n) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date(Date.now() + n * 864e5));
/** nächster Werktag (Mo–Sa) ab heute + n */
function workday(n) {
  for (let k = n; ; k++) if (new Date(`${berlin(k)}T12:00:00Z`).getUTCDay() !== 0) return berlin(k);
}
const dayDate = workday(20);

const mode = process.argv[2];
if (mode === "seed") {
  const r = await Promise.all([
    sb.from("special_days").upsert({ date: dayDate, label: "E2E-Inventur", closed: true }),
    sb.from("events").insert({ date: berlin(10), time: "10–14 Uhr", title: "E2E-Verkostung", text: "E2E-Test" }),
    sb.from("jobs").insert({ title: "E2E-Kassierer (m/w/d)", employment: "Teilzeit", text: "E2E-Testtext" }),
  ]);
  for (const x of r) if (x.error) throw x.error;
  console.log(`✓ Testeinträge angelegt (Sondertag ${dayDate}) – jetzt bauen, starten und „check“`);
} else if (mode === "check") {
  const html = (p) => fetch(BASE + p).then((res) => res.text());
  check((await html("/kontakt")).includes("E2E-Inventur"), "/kontakt: Sondertag aus dem Cockpit");
  const home = await html("/");
  check(home.includes("E2E-Verkostung"), "Startseite: Termin aus dem Cockpit");
  check(home.includes(`"validFrom":"${dayDate}"`), "JSON-LD: Sonderöffnungszeit");
  const ics = await html("/kalender.ics");
  check(ics.includes("E2E-Verkostung") && ics.includes("E2E-Inventur"), "Markt-Kalender: Termin und Sondertag");
  const karriere = await html("/karriere");
  check(karriere.includes("E2E-Kassierer (m/w/d)") && karriere.includes('"@type":"JobPosting"'), "/karriere: Stelle mit JobPosting");
} else if (mode === "clean") {
  await Promise.all([
    sb.from("special_days").delete().like("label", "E2E-%"),
    sb.from("events").delete().like("title", "E2E-%"),
    sb.from("jobs").delete().like("title", "E2E-%"),
  ]);
  console.log("✓ Testeinträge gelöscht");
} else {
  console.error("seed | check | clean");
  process.exit(1);
}
