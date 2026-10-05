// node --env-file=.env.local e2e/start-ticket.mjs – mit Test-Prospekt der laufenden Woche (vorher KEEP=1 …cockpit-prospekt.mjs):
// Ticket zeigt die Titelseite, alle „Prospekt“-Knöpfe führen auf /angebote#prospekt.
// MIT_PROSPEKT=0 (ohne Prospekt): keine Titelseite, alle Knöpfe zu rewe.de.
import { BASE, browser, check } from "./lib.mjs";

const withFlyer = process.env.MIT_PROSPEKT !== "0";
const ok = (href) => (withFlyer ? href === "/angebote#prospekt" : /rewe\.de/.test(href ?? ""));
const b = await browser();

const mobile = await b.newPage();
await mobile.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await mobile.goto(`${BASE}/`, { waitUntil: "networkidle0" });
const cover = await mobile.$('img[alt="Titelseite des aktuellen Prospekts"]');
check(withFlyer ? Boolean(cover) : !cover, withFlyer ? "Ticket zeigt die Titelseite" : "ohne Prospekt keine Titelseite");
if (cover) {
  // wirklich geladen – nicht nur ein <img> mit veralteter Prospekt-ID
  await cover.evaluate((img) => (img.complete ? null : new Promise((r) => img.addEventListener("load", r, { once: true }) || img.addEventListener("error", r, { once: true }))));
  check(await cover.evaluate((img) => img.naturalWidth > 0), "Titelseite lädt (aktueller Prospekt, kein toter Link)");
}
const m = await mobile.evaluate(() => ({
  hero: document.querySelector("#hero-aktionen a")?.getAttribute("href"),
  bar: document.querySelector('nav[aria-label="Schnellzugriff"] a')?.getAttribute("href"),
  ticket: document.querySelector('section[aria-label="Prospekt der Woche"] .cta-row a')?.getAttribute("href"),
}));
check(ok(m.hero), `Hero-Knopf → ${m.hero}`);
check(ok(m.bar), `Schnellzugriff → ${m.bar}`);
check(ok(m.ticket), `Ticket-Knopf → ${m.ticket}`);

const desktop = await b.newPage();
await desktop.setViewport({ width: 1280, height: 800 });
await desktop.goto(`${BASE}/kontakt`, { waitUntil: "networkidle0" });
const header = await desktop.evaluate(() => [...document.querySelectorAll("header a")].find((a) => a.textContent.trim().startsWith("Prospekt"))?.getAttribute("href"));
check(ok(header), `Kopf-Knopf (Unterseite) → ${header}`);
await b.close();
