// node --env-file=.env.local e2e/cockpit-inhalte.mjs – Inhalte im Cockpit: Sondertag (geschlossen → Zeiten → Fehler → ohne Netz →
// löschen), Termin (anlegen → bearbeiten → löschen) und Stelle (Fehler → anlegen → ausblenden → löschen) mit Blick auf die Website
// (/kontakt, Startseite, /karriere, JSON-LD, /kalender.ics). Räumt alle Testeinträge auf.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { BASE, browser, check, login } from "./lib.mjs";

const cfg = readFileSync(new URL("../lib/supabase/config.ts", import.meta.url), "utf8");
const pick = (name) => process.env[`NEXT_PUBLIC_${name}`] || cfg.match(new RegExp(`${name} = [^"]*"([^"]+)"`))[1];
const sb = createClient(pick("SUPABASE_URL"), pick("SUPABASE_PUBLISHABLE_KEY"), { auth: { persistSession: false } });
await sb.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD });

/** Berliner Datum in `n` Tagen */
const berlin = (n) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date(Date.now() + n * 864e5));
/**
 * erster Werktag (Mo–Sa) ab heute + n, an dem der Markt nichts eingetragen hat: Speichern ersetzt einen Sondertag mit demselben
 * Datum, das Aufräumen löscht ihn danach – ein echter Eintrag darf nie getroffen werden
 */
async function freeWorkday(n) {
  const { data, error } = await sb.from("special_days").select("date").gte("date", berlin(n));
  if (error) throw error;
  const taken = new Set(data.map((r) => r.date));
  for (let k = n; ; k++) {
    const d = berlin(k);
    if (new Date(`${d}T12:00:00Z`).getUTCDay() !== 0 && !taken.has(d)) return d;
  }
}
const dayDate = await freeWorkday(20);
const html = (p) => fetch(BASE + p).then((r) => r.text());
const valueOf = (page, selector) => page.$eval(selector, (e) => e.value);
/** Link „Auf der Website ansehen“ in der Erfolgsmeldung: Ziel|Fenster|Text */
const viewLink = (page, form) =>
  page.$eval(`${form} [role="status"] a`, (a) => `${a.getAttribute("href")}|${a.target}|${a.textContent.includes("Auf der Website ansehen")}`).catch(() => "fehlt");

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
  check((await viewLink(page, sf)) === "/kontakt#zeiten-titel|_blank|true", "Meldung mit „Auf der Website ansehen“ (/kontakt, neuer Tab)");
  await page.waitForSelector(`[data-sondertag="${dayDate}"]`);
  check((await html("/kontakt")).includes("E2E-Inventur"), "/kontakt zeigt den Sondertag gleich");
  check((await html("/")).includes(`"validFrom":"${dayDate}","validThrough":"${dayDate}","opens":"00:00","closes":"00:00"`), "JSON-LD: geschlossen");
  check((await html("/kalender.ics")).includes("geschlossen – E2E-Inventur"), "Markt-Kalender: geschlossen – E2E-Inventur");

  // bearbeiten: das Datum steht fest; 10–14 Uhr statt geschlossen
  await page.goto(`${BASE}/cockpit/inhalte/sondertage?datum=${dayDate}`, { waitUntil: "networkidle0" });
  check(!(await page.$(`${sf} input[name="date"][type="date"]`)), "Bearbeiten: Datum steht fest");
  await tap(page, `${sf} input[name="closed"]`);
  await page.waitForSelector(`${sf} input[name="opens"]`, { visible: true });
  await setValue(page, `${sf} input[name="opens"]`, "10:00");
  await setValue(page, `${sf} input[name="closes"]`, "14:00");
  msg = await submit(page, sf);
  check(msg.role === "status", `Sondertag geändert („${msg.text}“)`);
  check((await html("/")).includes(`"validFrom":"${dayDate}","validThrough":"${dayDate}","opens":"10:00","closes":"14:00"`), "JSON-LD: 10–14 Uhr");
  // sichtbar mit Beginn: „bis 14 Uhr“ allein schickte Kunden zur regulären Öffnungszeit (7 Uhr)
  check(/E2E-Inventur<\/span><span[^>]*>10 – 14 Uhr<\/span>/.test(await html("/kontakt")), "/kontakt zeigt „10 – 14 Uhr“ unter „Besondere Tage“");

  // Fehler: Datum in der Vergangenheit – die Eingaben bleiben stehen
  await page.goto(`${BASE}/cockpit/inhalte/sondertage`, { waitUntil: "networkidle0" });
  await setValue(page, `${sf} input[name="date"]`, berlin(-3));
  await fill(page, `${sf} input[name="label"]`, "E2E-Vergangen");
  await tap(page, `${sf} input[name="closed"]`);
  msg = await submit(page, sf);
  check(msg.role === "alert" && msg.text.includes("Vergangenheit"), `Vergangenheit → „${msg.text}“`);
  check((await valueOf(page, `${sf} input[name="label"]`)) === "E2E-Vergangen", "nach dem Fehler bleiben die Eingaben stehen");
  const closedState = await page.$eval(sf, (f) => ({
    checked: f.querySelector('input[name="closed"]').checked,
    times: Boolean(f.querySelector('input[name="opens"]')?.offsetParent),
  }));
  check(closedState.checked && !closedState.times, `nach dem Fehler bleibt „geschlossen“ angehakt, ohne Zeitfelder (${JSON.stringify(closedState)})`);

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

  // Termin: anlegen, Startseite und Kalender, bearbeiten, löschen
  await page.goto(`${BASE}/cockpit/inhalte/termine`, { waitUntil: "networkidle0" });
  const ef = '[data-form="termin"]';
  await setValue(page, `${ef} input[name="date"]`, berlin(10));
  await fill(page, `${ef} input[name="time"]`, "10–14 Uhr");
  await fill(page, `${ef} input[name="title"]`, "E2E-Verkostung");
  await fill(page, `${ef} textarea[name="text"]`, "E2E-Test am Stand.");
  msg = await submit(page, ef);
  check(msg.role === "status", `Termin gespeichert („${msg.text}“)`);
  check((await viewLink(page, ef)) === "/#termine-titel|_blank|true", "Meldung mit „Auf der Website ansehen“ (Startseite, neuer Tab)");
  check((await html("/")).includes("E2E-Verkostung"), "Startseite zeigt den Termin");
  check((await html("/kalender.ics")).includes("REWE Rödelheim: E2E-Verkostung"), "Markt-Kalender: Termin");
  const eventId = (await sb.from("events").select("id").eq("title", "E2E-Verkostung").single()).data.id;
  await page.goto(`${BASE}/cockpit/inhalte/termine?id=${eventId}`, { waitUntil: "networkidle0" });
  await fill(page, `${ef} input[name="title"]`, "E2E-Kürbis-Verkostung");
  msg = await submit(page, ef);
  check(msg.role === "status" && (await html("/")).includes("E2E-Kürbis-Verkostung"), "Termin bearbeitet → Startseite aktuell");
  // offener Tab nach einem Update der Website (alte Server-Action-IDs): Hinweis zum Neuladen statt „Keine Verbindung“
  const stale = (r) => (r.method() === "POST" && r.headers()["next-action"] ? r.continue({ headers: { ...r.headers(), "next-action": "7f".padEnd(42, "0") } }) : r.continue());
  await page.setRequestInterception(true);
  page.on("request", stale);
  msg = await submit(page, ef);
  check(msg.role === "alert" && msg.text.includes("neu"), `Tab nach einem Update → „${msg.text}“`);
  page.once("dialog", (d) => d.accept());
  await tap(page, `[data-termin="${eventId}"] [data-action="delete"]`);
  const staleDelete = await page.waitForSelector(`[data-termin="${eventId}"] [role="alert"]`, { timeout: 15000 }).then((e) => e.evaluate((x) => x.textContent));
  check(staleDelete.includes("neu"), `… auch beim Löschen („${staleDelete}“)`);
  page.off("request", stale);
  await page.setRequestInterception(false);
  page.once("dialog", (d) => d.accept());
  await tap(page, `[data-termin="${eventId}"] [data-action="delete"]`);
  await page.waitForFunction((id) => !document.querySelector(`[data-termin="${id}"]`), { timeout: 15000 }, eventId);
  check(!(await html("/")).includes("E2E-Kürbis-Verkostung"), "Termin gelöscht → Startseite ohne");

  // Stelle: Fehler (Eingaben bleiben), anlegen mit JobPosting, ausblenden, löschen
  await page.goto(`${BASE}/cockpit/inhalte/stellen`, { waitUntil: "networkidle0" });
  const jf = '[data-form="stelle"]';
  await fill(page, `${jf} input[name="title"]`, "E2E-Kassierer (m/w/d)");
  await page.select(`${jf} select[name="employment"]`, "Minijob");
  msg = await submit(page, jf);
  check(msg.role === "alert" && msg.text.includes("Beschreibung"), `Stelle ohne Beschreibung → „${msg.text}“`);
  const kept = [await valueOf(page, `${jf} input[name="title"]`), await valueOf(page, `${jf} select[name="employment"]`)];
  check(kept.join("|") === "E2E-Kassierer (m/w/d)|Minijob", `nach dem Fehler bleiben Titel und Anstellung stehen (${kept.join(", ")})`);
  await fill(page, `${jf} textarea[name="text"]`, "E2E-Testtext: 20 Stunden, auch samstags.");
  msg = await submit(page, jf);
  check(msg.role === "status", `Stelle gespeichert („${msg.text}“)`);
  check((await viewLink(page, jf)) === "/karriere#stellen-titel|_blank|true", "Meldung mit „Auf der Website ansehen“ (/karriere, neuer Tab)");
  const karriere = await html("/karriere");
  check(karriere.includes("E2E-Kassierer (m/w/d)") && karriere.includes('"@type":"JobPosting","title":"E2E-Kassierer (m/w/d)"'), "/karriere zeigt die Stelle mit JobPosting");
  const jobId = (await sb.from("jobs").select("id").eq("title", "E2E-Kassierer (m/w/d)").single()).data.id;
  await tap(page, `[data-stelle="${jobId}"] [data-action="toggle"]`);
  await page.waitForFunction((id) => document.querySelector(`[data-stelle="${id}"]`)?.textContent.includes("ausgeblendet"), { timeout: 15000 }, jobId);
  check(!(await html("/karriere")).includes("E2E-Kassierer"), "ausgeblendet → nicht mehr auf /karriere (auch kein JobPosting)");
  page.once("dialog", (d) => d.accept());
  await tap(page, `[data-stelle="${jobId}"] [data-action="delete"]`);
  await page.waitForFunction((id) => !document.querySelector(`[data-stelle="${id}"]`), { timeout: 15000 }, jobId);
  check(!(await sb.from("jobs").select("id").eq("id", jobId).maybeSingle()).data, "Stelle gelöscht");

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
