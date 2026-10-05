// node --env-file=.env.local e2e/cockpit-fehlerfaelle.mjs – Fehlerfälle beim Hochladen, ohne etwas zu veröffentlichen:
// kaputte Datei, Woche im Dateinamen außerhalb der Auswahl, älterer Browser (ohne neue JS-Funktionen, auch im pdf.js-Worker),
// Veröffentlichen ohne Netz. Legt höchstens einen Entwurf an und verwirft ihn wieder.
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BASE, browser, check, login } from "./lib.mjs";

const cfg = readFileSync(new URL("../lib/supabase/config.ts", import.meta.url), "utf8");
const pick = (name) => process.env[`NEXT_PUBLIC_${name}`] || cfg.match(new RegExp(`${name} = [^"]*"([^"]+)"`))[1];
const sb = createClient(pick("SUPABASE_URL"), pick("SUPABASE_PUBLISHABLE_KEY"), { auth: { persistSession: false } });
await sb.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD });

// Funktionen, die erst neueste Browser haben (pdf.js-Modern-Build braucht sie ohne Ersatz)
const STRIP = "delete Map.prototype.getOrInsertComputed; delete Map.prototype.getOrInsert; delete WeakMap.prototype.getOrInsertComputed; delete WeakMap.prototype.getOrInsert; delete Math.sumPrecise;";

const b = await browser();
const maker = await b.newPage();
await maker.setContent(`<style>@page{size:A4;margin:0}body{margin:0}section{height:296mm;display:grid;place-items:center;font:700 64px sans-serif;break-after:page}section:last-child{break-after:auto}</style>
  ${[1, 2].map((n) => `<section style="background:hsl(${n * 120} 70% 85%)">TESTPROSPEKT Fehlerfall · Seite ${n}</section>`).join("")}`);
const pdf = await maker.pdf({ format: "A4", printBackground: true });
await maker.close();
const file = (name, data) => {
  const p = join(tmpdir(), name);
  writeFileSync(p, data);
  return p;
};
const okPdf = file("TESTPROSPEKT_fehlerfall.pdf", pdf);
const oldWeekPdf = file("KW14_2025_TESTPROSPEKT.pdf", pdf);
const brokenPdf = file("TESTPROSPEKT_kaputt.pdf", "Das ist kein PDF, nur Text mit .pdf am Ende.");

const failures = [];
async function scenario(name, fn) {
  try {
    await fn();
  } catch (e) {
    failures.push(name);
    console.log(e.message.startsWith("✗") ? e.message : `✗ ${name}: ${e.message}`);
  }
}

async function cockpitPage({ oldBrowser = false } = {}) {
  const page = await b.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
  if (oldBrowser) {
    await page.evaluateOnNewDocument(STRIP);
    await page.setRequestInterception(true);
    page.on("request", async (req) => {
      if (!/pdf\.worker/.test(req.url())) return req.continue();
      const src = await (await fetch(req.url())).text();
      page.workerPatched = true;
      req.respond({ status: 200, contentType: "text/javascript", body: `${STRIP}\n${src}` });
    });
  }
  await login(page);
  await page.goto(`${BASE}/cockpit/prospekt`, { waitUntil: "networkidle0" });
  return page;
}

const alertText = (page) => page.$eval('[role="alert"]', (e) => e.textContent).catch(() => "");
// erst mittig ins Bild holen: am unteren Rand läge der Knopf unter der festen Cockpit-Navigation
async function tap(page, selector) {
  await page.$eval(selector, (e) => e.scrollIntoView({ block: "center" }));
  await page.click(selector);
}

await scenario("Tastatur", async () => {
  const page = await cockpitPage();
  for (let i = 0; i < 25 && !(await page.evaluate(() => document.activeElement?.type === "file")); i++) await page.keyboard.press("Tab");
  const ring = await page.evaluate(() => {
    const label = document.activeElement?.closest("label");
    return label ? getComputedStyle(label).outlineStyle : "kein Label";
  });
  check(ring !== "none" && ring !== "kein Label", `„PDF auswählen“ zeigt den Tastaturfokus (outline: ${ring})`);
  await page.close();
});

await scenario("kaputte Datei", async () => {
  const page = await cockpitPage();
  await (await page.$('input[type="file"]')).uploadFile(brokenPdf);
  await tap(page, '[data-action="upload"]');
  await page.waitForSelector('[role="alert"]', { timeout: 30000 });
  const msg = await alertText(page);
  check(msg.includes("beschädigt"), `kaputte Datei → klare Meldung („${msg.slice(0, 70)}“)`);
  check(!(await page.$('[data-action="retry"]')), "kaputte Datei → kein „Erneut versuchen“ ohne Aussicht");
  await page.close();
});

await scenario("Woche im Dateinamen", async () => {
  const page = await cockpitPage();
  await (await page.$('input[type="file"]')).uploadFile(oldWeekPdf);
  await page.waitForSelector("[data-upload-week]");
  const selected = await page.$eval("[data-upload-week]", (e) => e.selectedOptions[0].textContent);
  const offered = await page.$$eval("[data-upload-week] option", (os) => os.map((o) => o.textContent));
  check(!selected.startsWith("KW 14 "), `Dateiname „KW14_2025“ → vorgeschlagen wird eine aktuelle Woche (${selected})`);
  check(offered.every((o) => !o.startsWith("KW 14 ")), "KW 14/2025 steht nicht zur Auswahl");
  check((await page.$eval("[data-upload-hint]", (e) => e.textContent).catch(() => "")).includes("KW 14"), "Hinweis auf die KW im Dateinamen");
  await page.close();
});

await scenario("älterer Browser + Veröffentlichen ohne Netz", async () => {
  const page = await cockpitPage({ oldBrowser: true });
  await (await page.$('input[type="file"]')).uploadFile(okPdf);
  await tap(page, '[data-action="upload"]');
  await page.waitForSelector('[data-upload-review], [role="alert"]', { timeout: 90000 });
  const msg = await alertText(page);
  check(page.workerPatched === true, "pdf.js-Worker ohne neue JS-Funktionen gestartet");
  check(!msg && (await page.$("[data-upload-review]")), `älterer Browser: Seiten erzeugt und hochgeladen${msg ? ` (statt: „${msg.slice(0, 60)}“)` : ""}`);
  check(await page.evaluate(() => document.activeElement?.matches("[data-upload-review] h2")), "Fokus springt auf die Vorschau („Passt alles?“)");

  await page.setOfflineMode(true);
  await tap(page, '[data-action="publish"]');
  await page.waitForSelector('[data-upload-review] [role="alert"]', { timeout: 15000 }).catch(() => {});
  const offline = await alertText(page);
  check(offline.includes("Verbindung"), `Veröffentlichen ohne Netz → Meldung („${offline.slice(0, 60)}“)`);
  check(Boolean(await page.$('[data-action="publish"]')), "Veröffentlichen bleibt möglich");
  await page.setOfflineMode(false);

  let asked = false;
  page.once("dialog", (dlg) => {
    asked = true;
    dlg.accept();
  });
  await tap(page, '[data-action="discard"]');
  await page.waitForFunction(() => !document.querySelector("[data-upload-review]"), { timeout: 15000 });
  check(asked, "„Abbrechen“ fragt vor dem Verwerfen nach");
  const left = await sb.from("flyers").select("id").eq("status", "draft").eq("source_name", "TESTPROSPEKT_fehlerfall.pdf");
  check((left.data ?? []).length === 0, "wieder online: „Abbrechen“ verwirft den Entwurf");
  await page.close();
});

// Entwürfe dieses Tests entfernen (falls ein Schritt vorher abbrach)
for (const dr of (await sb.from("flyers").select("id").eq("status", "draft").like("source_name", "TESTPROSPEKT%")).data ?? []) {
  const { data: files } = await sb.storage.from("prospekte").list(dr.id);
  if (files?.length) await sb.storage.from("prospekte").remove(files.map((f) => `${dr.id}/${f.name}`));
  await sb.from("flyers").delete().eq("id", dr.id);
}
check(((await sb.from("flyers").select("id").like("source_name", "TESTPROSPEKT_%")).data ?? []).length === 0, "keine Testentwürfe übrig");
await b.close();
if (failures.length) {
  console.log(`✗ ${failures.length} Fehlerfall/-fälle: ${failures.join(", ")}`);
  process.exit(1);
}
