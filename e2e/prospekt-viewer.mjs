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
check(
  await page.evaluate(() => document.activeElement?.closest("[data-pager-page]")?.getAttribute("data-pager-page") === "2"),
  "… der Fokus wandert mit (Enter vergrößert die Seite, die man sieht)",
);
check((await page.$$eval("[data-pager-page] button", (bs) => bs.filter((x) => x.tabIndex >= 0).length)) === 1, "nur die sichtbare Seite ist ein Tab-Stopp");
// sichtbarer Fokus: der Fokusrahmen liegt innerhalb der scrollenden Leisten, nichts wird abgeschnitten
const clipped = await page.evaluate(() => {
  const out = [];
  for (const sel of ['[data-pager-page="2"] button', '[data-strip-page="2"] button']) {
    const el = document.querySelector(sel);
    el.focus({ preventScroll: true });
    const cs = getComputedStyle(el);
    const grow = parseFloat(cs.outlineWidth) + parseFloat(cs.outlineOffset);
    const r = el.getBoundingClientRect();
    const box = el.closest("ul").getBoundingClientRect();
    if (r.top - grow < box.top - 0.5 || r.bottom + grow > box.bottom + 0.5) out.push(`${sel} oben/unten`);
    if (sel.includes("pager") && (r.left - grow < box.left - 0.5 || r.right + grow > box.right + 0.5)) out.push(`${sel} seitlich`);
  }
  return out;
});
check(clipped.length === 0, `Fokusrahmen nicht abgeschnitten (${clipped.join(", ") || "ok"})`);
// Vorschau-Leiste springt
await page.$eval('[data-strip-page="5"] button', (x) => x.click());
check(await waitLabel(page, "Seite 5 von"), "Vorschau-Leiste: Seite 5");
// Vorschau-Leiste: aktuelle Seite mittig, ein einziger Tab-Stopp, Pfeiltasten wandern von Bild zu Bild
await new Promise((r) => setTimeout(r, 600));
const centre = await page.evaluate(() => {
  const s = document.querySelector('[aria-label="Seiten im Überblick"] ul');
  const t = s.querySelector('[data-strip-page="5"]').getBoundingClientRect();
  const b = s.getBoundingClientRect();
  return Math.round(Math.abs(t.left + t.width / 2 - (b.left + b.width / 2)));
});
check(centre <= 2, `Vorschau-Leiste: Seite 5 steht in der Mitte (Abstand ${centre} px)`);
const stops = await page.$$eval("#prospekt a[href], #prospekt button, #prospekt summary, #prospekt [tabindex='0']", (els) => els.filter((e) => e.tabIndex >= 0 && e.getClientRects().length && !(e.closest("details:not([open])") && e.tagName !== "SUMMARY")).length);
check(stops <= 8, `Tab-Stopps im Prospekt-Bereich höchstens 8 (${stops})`);
await page.focus('[data-strip-page="5"] button');
await page.keyboard.press("ArrowRight");
check(await waitLabel(page, "Seite 6 von"), "Pfeiltaste → in der Vorschau-Leiste → Seite 6");
check(await page.evaluate(() => document.activeElement?.closest("[data-strip-page]")?.getAttribute("data-strip-page") === "6"), "… der Fokus wandert auf das Vorschaubild 6");
await page.keyboard.press("Home");
check(await waitLabel(page, "Seite 1 von"), "Pos1 in der Vorschau-Leiste → Seite 1");
await page.$eval('[data-strip-page="5"] button', (x) => x.click());
await waitLabel(page, "Seite 5 von");

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
// Vergrößerung aus „Alle Seiten“: nach Esc steht der Fokus wieder auf derselben Seite der Übersicht
await page.$eval('[data-flyer-grid-page="20"]', (x) => x.click());
await page.waitForSelector(".pswp--open", { timeout: 10000 });
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector(".pswp--open"));
check(await page.evaluate(() => document.activeElement?.getAttribute("data-flyer-grid-page") === "20"), "Esc nach „Alle Seiten“ → Fokus zurück auf Seite 20 der Übersicht");
// am Ende bleibt der Fokus auf „Weiter“ (nicht auf dem Seitenanfang)
await page.$eval(`[data-strip-page="${total - 1}"] button`, (x) => x.click());
await waitLabel(page, `Seite ${total - 1} von`);
await page.evaluate(() => [...document.querySelectorAll('[aria-label="Prospektseiten"] button')].find((x) => x.textContent.includes("Weiter"))?.focus());
await page.keyboard.press("Enter");
check(await waitLabel(page, `Seite ${total} von ${total}`), `„Weiter“ bis zum Ende → Seite ${total}`);
await new Promise((r) => setTimeout(r, 500)); // der Browser räumt den Fokus eines gesperrten Knopfs erst beim nächsten Zeichnen weg
check(await page.evaluate(() => document.activeElement?.textContent.includes("Weiter")), "… der Fokus bleibt auf „Weiter“");
check(
  await page.evaluate(() => {
    const b = [...document.querySelectorAll('[aria-label="Prospektseiten"] button')].find((x) => x.textContent.includes("Weiter"));
    return b.getAttribute("aria-disabled") === "true" && !b.disabled;
  }),
  "„Weiter“ am Ende: aria-disabled statt disabled – bleibt in jedem Browser fokussierbar",
);
await page.keyboard.press("Enter");
await new Promise((r) => setTimeout(r, 400));
check((await label(page)) === `Seite ${total} von ${total}`, "… Enter darauf tut nichts");

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

// Service Worker: Prospektbilder – auch über /_next/image – nie im Cache (sie wechseln wöchentlich und verdrängten sonst /offline)
await page.goto(`${BASE}/angebote`, { waitUntil: "load" });
await new Promise((r) => setTimeout(r, 2500));
const swCached = await page.evaluate(async () => {
  let n = 0;
  for (const name of await caches.keys()) for (const req of await (await caches.open(name)).keys()) if (decodeURIComponent(req.url).includes("prospekt-bilder")) n++;
  return n;
});
check(swCached === 0, `Service Worker speichert keine Prospektbilder (${swCached})`);

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
// Ende: gerade Seitenzahl → letzte Seite allein links an der Mitte, ohne Lücke; „Zurück“ → die Doppelseite davor
await desk.$eval(`[data-strip-page="${total}"] button`, (x) => x.click());
if (total % 2 === 0) {
  check(await waitLabel(desk, `Seite ${total} von ${total}`), `Desktop: letzte Seite ${total} allein`);
  const spine = await desk.$eval(`[data-pager-page="${total}"] button`, (x) => {
    const r = x.getBoundingClientRect();
    const box = x.closest("ul").getBoundingClientRect();
    return Math.round(Math.abs(r.right - (box.left + box.width / 2)));
  });
  check(spine <= 12, `… sitzt links an der Mitte (Abstand ${spine} px)`);
  await pressButton(desk, "Zurück");
  check(await waitLabel(desk, `Seite ${total - 2}–${total - 1} von ${total}`), `Desktop: „Zurück“ → Doppelseite ${total - 2}–${total - 1}`);
} else {
  check(await waitLabel(desk, `Seite ${total - 1}–${total} von ${total}`), `Desktop: letzte Doppelseite ${total - 1}–${total}`);
}
// Drehen / Fensterbreite über 1024 px hinweg: die zuerst sichtbare Seite bleibt stehen
// nach jedem Drehen kurz warten: der Browser meldet die neue Breite erst beim nächsten Zeichnen (Nutzer tippen nicht im selben Frame)
const rotate = async (w, h) => {
  await desk.setViewport({ width: w, height: h });
  await new Promise((r) => setTimeout(r, 500));
};
await rotate(820, 1180);
await desk.$eval('[data-strip-page="5"] button', (x) => x.click());
check(await waitLabel(desk, "Seite 5 von"), "Tablet hochkant (820 px): Seite 5");
await rotate(1180, 820);
check(await waitLabel(desk, `Seite 4–5 von ${total}`), "… quer (1180 px): Doppelseite 4–5, Seite 5 bleibt im Bild");
await rotate(820, 1180);
check(await waitLabel(desk, "Seite 4 von"), "… wieder hochkant: Seite 4 (die zuerst sichtbare bleibt)");
// Desktop mit Retina: keine größere Bildfassung als nötig (die Seitenhöhe ist auf 78 % des Bildschirms begrenzt)
const retina = await b.newPage();
await retina.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
await retina.goto(`${BASE}/angebote`, { waitUntil: "load" });
await retina.waitForSelector("[data-pager-page='1'] img");
await new Promise((r) => setTimeout(r, 1500));
const fit = await retina.$eval("[data-pager-page='1'] img", (img) => {
  const need = img.getBoundingClientRect().width * devicePixelRatio;
  const sizes = [390, 640, 828, 1080, 1280, 1600, 1920];
  return { need: Math.round(need), chosen: Number(new URL(img.currentSrc).searchParams.get("w")), enough: sizes.find((s) => s >= need) };
});
check(fit.chosen <= fit.enough, `Desktop 1440 × 900 @2×: Titelseite braucht ${fit.need} px, geladen ${fit.chosen} (≤ ${fit.enough})`);
await retina.close();
// weiches Blättern (ohne reduzierte Bewegung): die Seitenanzeige nennt nur echte Doppelseiten
const smooth = await b.newPage();
await smooth.setViewport({ width: 1280, height: 900 });
await smooth.goto(`${BASE}/angebote`, { waitUntil: "load" });
await smooth.waitForSelector(LABEL);
await smooth.evaluate((sel) => {
  window.__labels = [];
  const el = document.querySelector(sel);
  new MutationObserver(() => window.__labels.push(el.textContent.trim())).observe(el, { childList: true, characterData: true, subtree: true });
}, LABEL);
for (const want of ["2–3", "4–5", "6–7"]) {
  await pressButton(smooth, "Weiter");
  await waitLabel(smooth, `Seite ${want} von`);
}
const labels = await smooth.evaluate(() => window.__labels);
const badLabels = labels.filter((l) => {
  const m = l.match(/Seite (\d+)–(\d+)/);
  return m && (Number(m[1]) % 2 !== 0 || Number(m[2]) !== Number(m[1]) + 1);
});
check(badLabels.length === 0 && labels.length <= 3, `Ansage beim Blättern nur echte Doppelseiten (${labels.join(" | ")})`);

check(third.size === 0, `keine Drittanbieter-Anfragen (${[...third].join(",") || "keine"})`);
await b.close();
