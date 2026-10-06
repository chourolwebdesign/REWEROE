// node --env-file=.env.local e2e/cockpit-feedback.mjs – Eingang im Cockpit: Übersicht zählt neue Rückmeldungen, Filter, Kontakt
// per Tipp, Erledigt/Wieder öffnen, Löschen mit Rückfrage, CSV (BOM, Formeln entschärft), axe. Legt drei Rückmeldungen über
// submit_feedback an und löscht sie wieder.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { BASE, browser, check, login } from "./lib.mjs";
const require = createRequire(import.meta.url);
const { AxePuppeteer } = require("@axe-core/puppeteer");

const cfg = readFileSync(new URL("../lib/supabase/config.ts", import.meta.url), "utf8");
const pick = (name) => process.env[`NEXT_PUBLIC_${name}`] || cfg.match(new RegExp(`${name} = [^"]*"([^"]+)"`))[1];
const sb = createClient(pick("SUPABASE_URL"), pick("SUPABASE_PUBLISHABLE_KEY"), { auth: { persistSession: false } });
await sb.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD });

async function seed(rating, extra = {}) {
  const { data, error } = await sb.rpc("submit_feedback", { p_key: process.env.FEEDBACK_KEY, p_rating: rating, p_aspects: [], p_comment: "", p_contact: "", p_lang: "de", ...extra });
  if (error) throw error;
  return data;
}
const ids = [
  await seed(1, { p_aspects: ["kasse", "wartezeit"], p_comment: "E2E-Eingang: nur eine Kasse offen", p_contact: "+49 170 1234567" }),
  await seed(3, { p_comment: '=HYPERLINK("http://example.org")', p_contact: "e2e-eingang@example.org", p_lang: "tr" }),
  await seed(5),
];
const card = (id) => `[data-feedback="${id}"]`;
const mobile = { width: 390, height: 844, isMobile: true, hasTouch: true };
async function tap(page, selector) {
  await page.$eval(selector, (e) => e.scrollIntoView({ block: "center" }));
  await page.click(selector);
}
const gone = (page, selector) => page.waitForFunction((s) => !document.querySelector(s), { timeout: 15000 }, selector);

const b = await browser();
try {
  const page = await b.newPage();
  await page.setViewport(mobile);
  await login(page);

  const fresh = (await sb.from("feedback").select("id", { count: "exact", head: true }).eq("status", "neu")).count;
  check((await page.$eval('[data-card="feedback"]', (e) => e.textContent)).includes(`${fresh} neue Rückmeldung`), `Übersicht: ${fresh} neue Rückmeldungen`);

  await page.goto(`${BASE}/cockpit/feedback`, { waitUntil: "networkidle0" });
  const navRows = await page.$$eval('nav[aria-label="Cockpit"] li', (lis) => new Set(lis.map((li) => Math.round(li.getBoundingClientRect().top))).size);
  check(navRows === 1, `mobile Navigation in einer Reihe (${navRows})`);
  check(Boolean(await page.$(card(ids[0]))) && Boolean(await page.$(card(ids[1]))), "Eingang „Neu“ zeigt die Rückmeldungen mit 1–3 Sternen");
  check(!(await page.$(card(ids[2]))), "5 Sterne (nichts zu tun) nicht unter „Neu“");
  check((await page.$eval(card(ids[0]), (e) => e.textContent)).includes("Rückruf gewünscht"), "Kontakt hinterlassen → „Rückruf gewünscht“");
  check((await page.$eval(`${card(ids[0])} a[href^="tel:"]`, (a) => a.getAttribute("href"))) === "tel:+491701234567", "Telefon per Tipp anrufen");
  check((await page.$eval(`${card(ids[1])} a[href^="mailto:"]`, (a) => a.getAttribute("href"))) === "mailto:e2e-eingang@example.org", "E-Mail per Tipp schreiben");
  for (const vp of [mobile, { width: 1280, height: 900 }]) {
    await page.setViewport(vp);
    const res = await new AxePuppeteer(page).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    check(res.violations.length === 0, `axe /cockpit/feedback ${vp.width}px: ${res.violations.map((v) => v.id).join(",") || "0"}`);
  }
  await page.setViewport(mobile);

  await page.goto(`${BASE}/cockpit/feedback?sterne=1`, { waitUntil: "networkidle0" });
  check(Boolean(await page.$(card(ids[0]))) && !(await page.$(card(ids[1]))), "Filter „1 Stern“");

  await page.goto(`${BASE}/cockpit/feedback`, { waitUntil: "networkidle0" });
  await tap(page, `${card(ids[0])} [data-action="done"]`);
  await gone(page, card(ids[0]));
  const handled = await sb.from("feedback").select("status,handled_at,handled_by").eq("id", ids[0]).single();
  check(handled.data?.status === "erledigt" && Boolean(handled.data.handled_at) && Boolean(handled.data.handled_by), "„Erledigt“: raus aus „Neu“, mit wann und wer");

  await page.goto(`${BASE}/cockpit/feedback?status=erledigt`, { waitUntil: "networkidle0" });
  await tap(page, `${card(ids[0])} [data-action="reopen"]`);
  await gone(page, card(ids[0]));
  check((await sb.from("feedback").select("status").eq("id", ids[0]).single()).data?.status === "neu", "„Wieder öffnen“");

  await page.goto(`${BASE}/cockpit/feedback?status=alle`, { waitUntil: "networkidle0" });
  let asked = false;
  page.once("dialog", (d) => {
    asked = true;
    d.accept();
  });
  await tap(page, `${card(ids[2])} [data-action="delete"]`);
  await gone(page, card(ids[2]));
  check(asked && !(await sb.from("feedback").select("id").eq("id", ids[2]).maybeSingle()).data, "Löschen fragt nach und entfernt die Rückmeldung");

  const raw = await page.evaluate(async () => [...new Uint8Array(await (await fetch("/cockpit/feedback/export")).arrayBuffer())]);
  const csv = new TextDecoder().decode(new Uint8Array(raw));
  check(
    raw.slice(0, 3).join() === "239,187,191" && csv.startsWith("Datum;Sterne;Bereiche;Kommentar;Kontakt;Sprache;Google;Status") && csv.includes("E2E-Eingang: nur eine Kasse offen") && csv.includes(`"'=HYPERLINK(""http://example.org"")"`),
    "CSV: BOM, Kopf, Inhalt, Formel entschärft",
  );
} finally {
  await sb.from("feedback").delete().in("id", ids);
  await b.close();
}
console.log("✓ Testrückmeldungen gelöscht");
