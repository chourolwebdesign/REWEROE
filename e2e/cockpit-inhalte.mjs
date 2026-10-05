// node --env-file=.env.local e2e/cockpit-inhalte.mjs – Inhalte im Cockpit: Sondertag (geschlossen → Zeiten → Fehler → ohne Netz →
// löschen) mit Blick auf die Website (/kontakt, JSON-LD, /kalender.ics); Termine und Stellen folgen in Task 5. Räumt alle Testeinträge auf.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { BASE, browser, check, login } from "./lib.mjs";

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
const html = (p) => fetch(BASE + p).then((r) => r.text());
const valueOf = (page, selector) => page.$eval(selector, (e) => e.value);

// erst mittig ins Bild holen: am unteren Rand läge der Knopf unter der festen Cockpit-Navigation
async function tap(page, selector) {
  await page.$eval(selector, (e) => e.scrollIntoView({ block: "center" }));
  await page.click(selector);
}
async function fill(page, selector, value) {
  await page.$eval(selector, (e) => (e.value = ""));
  await page.type(selector, value);
}
/** Datums- und Zeitfelder direkt setzen (Tastatureingabe hängt vom Gebietsschema ab) */
async function setValue(page, selector, value) {
  await page.$eval(selector, (e, v) => {
    e.value = v;
    e.dispatchEvent(new Event("input", { bubbles: true }));
  }, value);
}
/** Formular abschicken und die neue Meldung lesen (wartet, bis sich ihr Text ändert) */
async function submit(page, form) {
  const before = await page.$eval(form, (f) => f.querySelector('[role="status"], [role="alert"]')?.textContent ?? "");
  await tap(page, `${form} button[type="submit"]`);
  await page.waitForFunction(
    (f, b) => {
      const m = document.querySelector(f)?.querySelector('[role="status"], [role="alert"]');
      return m && m.textContent !== b;
    },
    { timeout: 15000 },
    form,
    before,
  );
  return page.$eval(`${form} [role="status"], ${form} [role="alert"]`, (e) => ({ role: e.getAttribute("role"), text: e.textContent }));
}

const b = await browser();
const page = await b.newPage();
const mobile = { width: 390, height: 844, isMobile: true, hasTouch: true };
await page.setViewport(mobile);
await login(page);
try {
  // ohne networkidle0: das Vorladen (Prefetch) der verlinkten Bereiche soll den Test nicht aufhalten
  await page.goto(`${BASE}/cockpit/inhalte`, { waitUntil: "load" });
  check(Boolean(await page.$('a[href="/cockpit/inhalte/sondertage"]')), "Inhalte: Bereich Sondertage");
  await page.setViewport({ ...mobile, width: 320 });
  const tight = await page.$$eval('nav[aria-label="Cockpit"] a', (as) =>
    as.filter((a) => a.getBoundingClientRect().right > innerWidth + 0.5 || a.scrollWidth > a.clientWidth).map((a) => a.textContent),
  );
  check(tight.length === 0, `Navigation mit „Inhalte“ passt auf 320 px${tight.length ? ` (zu eng: ${tight.join(", ")})` : ""}`);
  await page.setViewport(mobile);

  // Sondertag: geschlossen
  await page.goto(`${BASE}/cockpit/inhalte/sondertage`, { waitUntil: "networkidle0" });
  const sf = '[data-form="sondertag"]';
  await setValue(page, `${sf} input[name="date"]`, dayDate);
  await fill(page, `${sf} input[name="label"]`, "E2E-Inventur");
  await tap(page, `${sf} input[name="closed"]`);
  let msg = await submit(page, sf);
  check(msg.role === "status" && msg.text.includes("Gespeichert"), `Sondertag gespeichert („${msg.text}“)`);
  await page.waitForSelector(`[data-sondertag="${dayDate}"]`);
  check((await html("/kontakt")).includes("E2E-Inventur"), "/kontakt zeigt den Sondertag gleich");
  check((await html("/")).includes(`"validFrom":"${dayDate}","validThrough":"${dayDate}","opens":"00:00","closes":"00:00"`), "JSON-LD: geschlossen");
  check((await html("/kalender.ics")).includes("geschlossen – E2E-Inventur"), "Markt-Kalender: geschlossen – E2E-Inventur");

  // bearbeiten: das Datum steht fest; 10–14 Uhr statt geschlossen
  await page.goto(`${BASE}/cockpit/inhalte/sondertage?datum=${dayDate}`, { waitUntil: "networkidle0" });
  check(!(await page.$(`${sf} input[name="date"][type="date"]`)), "Bearbeiten: Datum steht fest");
  await tap(page, `${sf} input[name="closed"]`);
  await page.waitForSelector(`${sf} input[name="opens"]`);
  await setValue(page, `${sf} input[name="opens"]`, "10:00");
  await setValue(page, `${sf} input[name="closes"]`, "14:00");
  msg = await submit(page, sf);
  check(msg.role === "status", `Sondertag geändert („${msg.text}“)`);
  check((await html("/")).includes(`"validFrom":"${dayDate}","validThrough":"${dayDate}","opens":"10:00","closes":"14:00"`), "JSON-LD: 10–14 Uhr");

  // Fehler: Datum in der Vergangenheit – die Eingaben bleiben stehen
  await page.goto(`${BASE}/cockpit/inhalte/sondertage`, { waitUntil: "networkidle0" });
  await setValue(page, `${sf} input[name="date"]`, berlin(-3));
  await fill(page, `${sf} input[name="label"]`, "E2E-Vergangen");
  await tap(page, `${sf} input[name="closed"]`);
  msg = await submit(page, sf);
  check(msg.role === "alert" && msg.text.includes("Vergangenheit"), `Vergangenheit → „${msg.text}“`);
  check((await valueOf(page, `${sf} input[name="label"]`)) === "E2E-Vergangen", "nach dem Fehler bleiben die Eingaben stehen");

  // ohne Netz: Meldung statt Fehlerseite, die Eingaben bleiben stehen
  await page.setOfflineMode(true);
  msg = await submit(page, sf);
  await page.setOfflineMode(false);
  check(msg.role === "alert" && msg.text.includes("Verbindung"), `ohne Netz → „${msg.text}“`);
  check((await valueOf(page, `${sf} input[name="label"]`)) === "E2E-Vergangen", "ohne Netz bleiben die Eingaben stehen");

  // löschen mit Rückfrage
  let asked = false;
  page.once("dialog", (d) => {
    asked = true;
    d.accept();
  });
  await tap(page, `[data-sondertag="${dayDate}"] [data-action="delete"]`);
  await page.waitForFunction((d) => !document.querySelector(`[data-sondertag="${d}"]`), { timeout: 15000 }, dayDate);
  check(asked && !(await html("/kontakt")).includes("E2E-Inventur"), "Löschen fragt nach; /kontakt ohne den Sondertag");

  // TERMINE UND STELLEN (Task 5)

  await page.goto(`${BASE}/cockpit`, { waitUntil: "networkidle0" });
  check(Boolean(await page.$('[data-card="sondertage"]')), "Übersicht: Karte „Öffnungszeiten“");
} finally {
  await Promise.all([
    sb.from("special_days").delete().like("label", "E2E-%"),
    sb.from("events").delete().like("title", "E2E-%"),
    sb.from("jobs").delete().like("title", "E2E-%"),
  ]);
  await b.close();
}
console.log("✓ Testeinträge gelöscht");
