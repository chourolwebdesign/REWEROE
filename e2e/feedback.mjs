// node --env-file=.env.local e2e/feedback.mjs – /feedback: zufrieden (großer Knopf zur REWE-Umfrage, Google im Fuß), unzufrieden
// (Bereiche, Kommentar, Kontakt, Doppeltipp), Sprachen (Deutsch als Start, Auswahl, Arabisch von rechts), Tastatur, 320 px, Limit, axe, keine
// Drittanbieter. Löscht alle eigenen Rückmeldungen wieder.
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { BASE, browser, check } from "./lib.mjs";
const require = createRequire(import.meta.url);
const { AxePuppeteer } = require("@axe-core/puppeteer");

const cfg = readFileSync(new URL("../lib/supabase/config.ts", import.meta.url), "utf8");
const pick = (name) => process.env[`NEXT_PUBLIC_${name}`] || cfg.match(new RegExp(`${name} = [^"]*"([^"]+)"`))[1];
const sb = createClient(pick("SUPABASE_URL"), pick("SUPABASE_PUBLISHABLE_KEY"), { auth: { persistSession: false } });
await sb.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD });

const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const marker = `E2E-${Date.now()}`;
const created = [];
const b = await browser();

async function open({ lang = "de", width = 390, ip } = {}) {
  const page = await b.newPage();
  await page.setViewport(width < 600 ? { width, height: 844, isMobile: true, hasTouch: true } : { width, height: 900 });
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.setExtraHTTPHeaders({ "accept-language": lang, ...(ip ? { "x-forwarded-for": ip } : {}) });
  page.third = new Set();
  page.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) page.third.add(u.hostname);
  });
  await page.goto(`${BASE}/feedback`, { waitUntil: "networkidle0" });
  return page;
}
async function axe(page, label) {
  // laufende Übergänge abwarten (z. B. Farbwechsel eines eben angetippten Bereichs), sonst misst axe Zwischenfarben
  await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => {}))));
  const res = await new AxePuppeteer(page).withTags(tags).analyze();
  check(res.violations.length === 0, `axe ${label}: ${res.violations.map((v) => `${v.id}(${v.nodes.length})`).join(" ") || "0"}`);
}
async function done(page) {
  await page.waitForSelector("[data-feedback-done]", { timeout: 15000 });
  const id = await page.$eval("[data-feedback-done]", (e) => e.getAttribute("data-feedback-id"));
  created.push(id);
  return id;
}
const text = (page, sel) => page.$eval(sel, (e) => e.textContent.trim());

try {
  // 1) zufrieden, Deutsch, Handy
  let page = await open();
  check((await text(page, "h1")) === "Wie war dein Einkauf?", "Deutsch als Startsprache, „du“");
  check((await page.$eval("[data-google-footer]", (a) => a.getAttribute("href")).catch(() => null))?.startsWith("https://"), "Google-Link für alle schon auf der Startseite (Fuß)");
  await axe(page, "/feedback Start 390px");
  await page.click('[data-face="5"]');
  const good = await done(page);
  check((await text(page, "h1")) === "Herzlichen Dank!", "5 Sterne → Dank");
  const survey = await page.$eval("[data-survey]", (a) => ({ href: a.getAttribute("href"), target: a.target })).catch(() => null);
  check(Boolean(survey?.href?.startsWith("https://rewegroup.fra1.qualtrics.com/")) && survey.target === "_blank", "… großer Knopf zur REWE-Umfrage (neuer Tab)");
  check(Boolean(await page.$("[data-google-footer]")), "… Google-Link bleibt unten");
  await axe(page, "/feedback Dank 390px");
  await page.evaluate(() => {
    const a = document.querySelector("[data-google-footer]");
    a.addEventListener("click", (e) => e.preventDefault());
    a.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const goodRow = await sb.from("feedback").select("rating,lang,contact,google_click").eq("id", good).single();
  check(goodRow.data?.rating === 5 && goodRow.data.lang === "de" && goodRow.data.google_click === true, "gespeichert: 5 Sterne, de, Google angetippt");
  check(page.third.size === 0, `keine Drittanbieter (${[...page.third].join(",") || "keine"})`);
  await page.close();

  // 2) unzufrieden, Türkisch, Desktop, Doppeltipp auf „Gönder“
  page = await open({ lang: "tr-TR,tr;q=0.9,de;q=0.5", width: 1280 });
  check((await text(page, "h1")) === "Wie war dein Einkauf?", "Startsprache Deutsch, auch wenn der Browser Türkisch bevorzugt");
  await page.select("[data-lang-select]", "tr");
  check((await text(page, "h1")) === "Alışverişiniz nasıldı?", "Sprachwahl → Türkisch");
  await page.click('[data-face="2"]');
  await page.waitForSelector('[data-aspect="kasse"]');
  check((await page.evaluate(() => document.activeElement?.tagName)) === "H1", "Fokus springt auf die neue Überschrift");
  await page.click('[data-aspect="kasse"]');
  await page.click('[data-aspect="wartezeit"]');
  await page.type("textarea", marker);
  await page.type("[data-contact]", "e2e-feedback@example.org");
  await axe(page, "/feedback Details 1280px");
  await page.$eval('[data-action="send"]', (b) => {
    b.click();
    b.click();
  });
  const bad = await done(page);
  // ein zweiter Aufruf liefe nach dem ersten (Server Actions stehen in einer Warteschlange) – erst danach zählen
  await new Promise((r) => setTimeout(r, 1500));
  check(Boolean(await page.$("[data-care]")), "2 Sterne → Hinweis der Marktleitung");
  check((await page.$eval("[data-google]", (a) => a.dataset.google)) === "dezent", "Google-Link auch bei 2 Sternen sichtbar, ruhig");
  check(!(await page.$("[data-survey]")), "2 Sterne → keine REWE-Umfrage");
  const rows = await sb.from("feedback").select("id,rating,aspects,contact,lang").eq("comment", marker);
  check(rows.data?.length === 1, `Doppeltipp → genau eine Zeile (${rows.data?.length})`);
  const r = rows.data[0];
  check(r.id === bad && r.rating === 2 && r.aspects.join() === "wartezeit,kasse" && r.contact === "e2e-feedback@example.org" && r.lang === "tr", "gespeichert: 2 Sterne, Bereiche, Kontakt, tr");
  await axe(page, "/feedback Dank (2 Sterne) 1280px");
  await page.close();

  // 3) Arabisch: von rechts nach links, Pfeiltasten gespiegelt; Sprachwahl
  page = await open({ lang: "ar" });
  await page.select("[data-lang-select]", "ar");
  check((await page.$eval("[data-feedback-root]", (e) => e.dir)) === "rtl", "Arabisch: dir=rtl");
  await page.focus('[data-face="1"]');
  await page.keyboard.press("ArrowLeft");
  check(await page.$eval('[data-face="2"]', (e) => e.getAttribute("aria-checked") === "true" && document.activeElement === e), "Pfeil nach links wählt in Arabisch das nächste Gesicht");
  check(!(await page.$("[data-feedback-done]")) && !(await page.$("[data-aspect]")), "Pfeiltasten wählen, ohne weiterzugehen");
  await axe(page, "/feedback Arabisch 390px");
  await page.select("[data-lang-select]", "en");
  check((await text(page, "h1")) === "How was your visit?", "Sprachwahl → Englisch");
  check((await page.$eval("[data-feedback-root]", (e) => e.dir)) === "ltr", "… wieder links nach rechts");
  await page.close();

  // 3b) Doppeltipp auf ein Gesicht → genau eine Rückmeldung
  const since = new Date(Date.now() - 1000).toISOString();
  page = await open({ lang: "ru" });
  await page.select("[data-lang-select]", "ru");
  await page.$eval('[data-face="5"]', (b) => {
    b.click();
    b.click();
  });
  await done(page);
  await new Promise((r) => setTimeout(r, 1500));
  const ru = await sb.from("feedback").select("id").eq("lang", "ru").gte("created_at", since);
  check(ru.data?.length === 1, `Doppeltipp auf ein Gesicht → genau eine Zeile (${ru.data?.length})`);
  await page.close();

  // 4) 320 px ohne waagerechtes Scrollen
  page = await open({ width: 320 });
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "320 px: Start ohne Überlauf");
  await page.click('[data-face="1"]');
  await page.waitForSelector('[data-aspect="kasse"]');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "320 px: Details ohne Überlauf");
  await page.close();

  // 5) Limit: 10 je Stunde und Adresse (x-forwarded-for wie hinter Vercel)
  const ip = `203.0.113.${(Date.now() % 250) + 1}`;
  let message = "";
  for (let i = 0; i < 11; i++) {
    page = await open({ ip, width: 1280 });
    await page.click('[data-face="4"]');
    await page.waitForSelector('[data-feedback-done], [role="alert"]', { timeout: 15000 });
    if (await page.$("[data-feedback-done]")) created.push(await page.$eval("[data-feedback-done]", (e) => e.getAttribute("data-feedback-id")));
    else {
      message = await text(page, '[role="alert"]');
      check(Boolean(await page.$("[data-google-footer]")), "Fehler (Limit) → Google-Link bleibt erreichbar");
    }
    await page.close();
  }
  check(created.length === 13 && message.includes("Zu viele"), `11. Rückmeldung derselben Adresse in einer Stunde → „${message}“`);
} finally {
  const ids = created.filter(Boolean);
  if (ids.length) await sb.from("feedback").delete().in("id", ids);
  await b.close();
}
console.log("✓ Testrückmeldungen gelöscht");
