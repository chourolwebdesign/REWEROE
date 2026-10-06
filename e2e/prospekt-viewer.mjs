// node e2e/prospekt-viewer.mjs – braucht einen veröffentlichten Prospekt der laufenden Woche (z. B. KW 41 aus dem Cockpit oder
// KEEP=1 node --env-file=.env.local e2e/cockpit-prospekt.mjs). Liest nur.
import { BASE, browser, check } from "./lib.mjs";

const b = await browser();
const third = new Set();
const watchThird = (p) =>
  p.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) third.add(u.hostname);
  });
const LABEL = '[aria-label="Prospektseiten"] [aria-live]';
const label = (p) => p.$eval(LABEL, (e) => e.textContent.trim());
const waitLabel = (p, text) => p.waitForFunction((s, t) => document.querySelector(s)?.textContent.includes(t), { timeout: 8000 }, LABEL, text).then(() => true, () => false);
const pressButton = (p, text) => p.evaluate((t) => [...document.querySelectorAll('[aria-label="Prospektseiten"] button')].find((x) => x.textContent.includes(t))?.click(), text);

const page = await b.newPage();
watchThird(page);
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
// ohne Animationen: PhotoSwipe ignoriert Tasten bis zum Ende der Öffnungsanimation; die Leiste scrollt sofort
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

// Bildgewicht beim Laden: nur fertig übertragene Bilder zählen
const cdp = await page.createCDPSession();
await cdp.send("Network.enable");
const kinds = new Map();
const imageBytes = new Map();
cdp.on("Network.responseReceived", (e) => kinds.set(e.requestId, e.type));
cdp.on("Network.loadingFinished", (e) => {
  if (kinds.get(e.requestId) === "Image") imageBytes.set(e.requestId, e.encodedDataLength);
});

await page.goto(`${BASE}/angebote`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1500));
check((await page.$eval("[data-flyer-page] img", (i) => i.currentSrc)).includes("/_next/image"), "Prospektseiten über die Bildoptimierung (AVIF/WebP)");
const imageKb = Math.round([...imageBytes.values()].reduce((a, c) => a + c, 0) / 1024);
check(imageKb <= 700, `Bilder beim Laden ${imageKb} KB (≤ 700)`);

// Vor dem Laden der Seite nur die Titelseite: Seiten 2–3 und die Vorschau-Leiste folgen danach (der LCP teilt sich die Leitung nicht)
const early = await page.evaluate(() => {
  const load = performance.getEntriesByType("navigation")[0].loadEventStart;
  return performance
    .getEntriesByType("resource")
    .filter((e) => e.name.includes("prospekt-bilder") && e.startTime < load && !/%2F1\.(jpg|webp)/.test(e.name))
    .map((e) => decodeURIComponent(e.name).split("/").pop().split("&")[0]);
});
check(early.length === 0, `vor dem Laden nur die Titelseite (${early.length ? early.slice(0, 4).join(", ") : "ok"})`);
const total = Number((await label(page)).match(/von (\d+)/)?.[1]);
check((await label(page)) === `Seite 1 von ${total}`, `Blätter-Ansicht startet bei Seite 1 (${total} Seiten)`);
check((await page.$eval("[data-flyer-page] img", (i) => i.getAttribute("alt"))).startsWith("Prospektseite 1 von"), "Alt-Text „Prospektseite 1 von …“");

// „Weiter“ per Tastatur
await page.evaluate(() => [...document.querySelectorAll('[aria-label="Prospektseiten"] button')].find((x) => x.textContent.includes("Weiter"))?.focus());
await page.keyboard.press("Enter");
check(await waitLabel(page, "Seite 2 von"), "„Weiter“ per Tastatur → Seite 2");
// Wischen (waagerechtes Scrollen der Leiste)
await page.$eval('[aria-label="Prospektseiten"] ul', (u) => u.scrollBy({ left: u.clientWidth, behavior: "instant" }));
check(await waitLabel(page, "Seite 3 von"), "Wischen → Seite 3");
// Pfeiltaste auf einer Seite
await page.focus('[data-pager-page="3"] button');
await page.keyboard.press("ArrowLeft");
check(await waitLabel(page, "Seite 2 von"), "Pfeiltaste ← auf einer Seite → Seite 2");
// Vorschau-Leiste springt
await page.$eval('[data-strip-page="5"] button', (x) => x.click());
check(await waitLabel(page, "Seite 5 von"), "Vorschau-Leiste: Seite 5");

// Antippen öffnet die Vergrößerung an dieser Seite
await page.$eval('[data-pager-page="5"] button', (x) => x.click());
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /5\s*\/\s*\d+/.test(e.textContent)), "Antippen öffnet die Vergrößerung bei Seite 5");
check((await page.$eval(".pswp__img:not(.pswp__img--placeholder)", (i) => i.getAttribute("src")).catch(() => "")).includes("/_next/image"), "Vergrößerung lädt über die Bildoptimierung");
await page.keyboard.press("ArrowRight");
await page.waitForFunction(() => new URLSearchParams(location.search).get("seite") === "6");
const kw = await page.evaluate(() => new URLSearchParams(location.search).get("kw"));
const shownKw = await page.$eval("#prospekt", (e) => e.textContent.match(/KW (\d+) ·/)?.[1]);
check(kw === shownKw, `Pfeiltaste blättert, Adresse zeigt ?kw=${kw}&seite=6 (Woche im Link)`);
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector(".pswp--open"));
check(await waitLabel(page, "Seite 6 von"), "nach dem Schließen steht die Leiste auf Seite 6");
check(
  await page.evaluate(() => document.activeElement?.closest("[data-pager-page]")?.getAttribute("data-pager-page") === "6" && !location.search.includes("seite") && !location.search.includes("kw")),
  "Esc: Fokus auf Seite 6, Adresse ohne ?kw&seite",
);

// alle Seiten zum Aufklappen
await page.$eval("#prospekt details summary", (s) => s.click());
check((await page.$$("[data-flyer-grid-page]")).length === total, `„Alle Seiten“ zeigt ${total} Seiten`);

// geteilte Links
await page.goto(`${BASE}/angebote?seite=2`, { waitUntil: "load" });
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /2\s*\/\s*\d+/.test(e.textContent)), "Link mit ?seite=2 (ohne Woche, ältere Links) öffnet Seite 2");
// „load“ statt „networkidle0“: beim Wechsel weg von einem offenen Viewer meldet Puppeteer unter dem Service Worker
// sonst gelegentlich nie Netzruhe (Seite und Server antworten dabei normal)
await page.goto(`${BASE}/angebote?kw=${kw}&seite=3`, { waitUntil: "load" });
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /3\s*\/\s*\d+/.test(e.textContent)), `Link mit ?kw=${kw}&seite=3 öffnet Seite 3`);
await page.keyboard.press("Escape");
check(await waitLabel(page, "Seite 3 von"), "nach dem Link steht die Leiste auf Seite 3");
await page.goto(`${BASE}/angebote?kw=1&seite=2`, { waitUntil: "load" });
await page.waitForSelector("[data-flyer-page]");
await new Promise((r) => setTimeout(r, 2000)); // Zeit zum Hydrieren und für den Effekt, der Links öffnet
check(!(await page.$(".pswp--open")), "Link einer Woche, die nicht mehr online ist, öffnet keine fremde Seite");

// Desktop: Titelseite allein, danach Doppelseiten
const desk = await b.newPage();
watchThird(desk);
await desk.setViewport({ width: 1280, height: 900 });
await desk.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
// „load“: der Service Worker (von der ersten Seite installiert) lässt sonst keine Netzruhe zu
await desk.goto(`${BASE}/angebote`, { waitUntil: "load" });
await desk.waitForSelector(LABEL);
check((await label(desk)) === `Seite 1 von ${total}`, "Desktop: Titelseite allein");
await pressButton(desk, "Weiter");
check(await waitLabel(desk, `Seite 2–3 von ${total}`), "Desktop: „Weiter“ → Doppelseite 2–3");
await pressButton(desk, "Weiter");
check(await waitLabel(desk, `Seite 4–5 von ${total}`), "Desktop: „Weiter“ → Doppelseite 4–5");

check(third.size === 0, `keine Drittanbieter-Anfragen (${[...third].join(",") || "keine"})`);
await b.close();
