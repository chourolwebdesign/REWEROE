// node --env-file=.env.local e2e/prospekt-viewer.mjs – braucht einen veröffentlichten Prospekt der laufenden Woche
// (vorher: KEEP=1 node --env-file=.env.local e2e/cockpit-prospekt.mjs).
import { BASE, browser, check } from "./lib.mjs";

const b = await browser();
const page = await b.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
// ohne Öffnungsanimation: PhotoSwipe ignoriert Tasten, bis die Animation fertig ist
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
const third = new Set();
page.on("request", (r) => { const u = new URL(r.url()); if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) third.add(u.hostname); });
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
const imageKb = Math.round([...imageBytes.values()].reduce((a, b) => a + b, 0) / 1024);
check(imageKb <= 700, `Bilder beim Laden ${imageKb} KB (≤ 700)`);

const thumbs = await page.$$("[data-flyer-page]");
check(thumbs.length >= 1, `Raster mit ${thumbs.length} Seiten`);
check((await page.$eval("[data-flyer-page] img", (i) => i.getAttribute("alt"))).startsWith("Prospektseite 1 von"), "Alt-Text „Prospektseite 1 von …“");
await thumbs[0].click();
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /1\s*\/\s*\d+/.test(e.textContent)), "Viewer offen bei 1 / N");
await page.keyboard.press("ArrowRight");
await page.waitForFunction(() => new URLSearchParams(location.search).get("seite") === "2");
const kw = await page.evaluate(() => new URLSearchParams(location.search).get("kw"));
const shownKw = await page.$eval("#prospekt", (e) => e.textContent.match(/KW (\d+) ·/)?.[1]);
check(kw === shownKw, `Pfeiltaste blättert, Adresse zeigt ?kw=${kw}&seite=2 (Woche im Link)`);
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector(".pswp--open"));
check(await page.evaluate(() => document.activeElement?.hasAttribute("data-flyer-page") && !location.search.includes("seite") && !location.search.includes("kw")), "Esc schließt, Fokus im Raster, ?kw&seite entfernt");

await page.goto(`${BASE}/angebote?seite=2`, { waitUntil: "networkidle0" });
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /2\s*\/\s*\d+/.test(e.textContent)), "Link mit ?seite=2 (ohne Woche, ältere Links) öffnet Seite 2");
// „load“ statt „networkidle0“: beim Wechsel weg von einem offenen Viewer meldet Puppeteer unter dem Service Worker
// sonst gelegentlich nie Netzruhe (Seite und Server antworten dabei normal)
await page.goto(`${BASE}/angebote?kw=${kw}&seite=3`, { waitUntil: "load" });
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /3\s*\/\s*\d+/.test(e.textContent)), `Link mit ?kw=${kw}&seite=3 öffnet Seite 3`);
await page.goto(`${BASE}/angebote?kw=1&seite=2`, { waitUntil: "load" });
await page.waitForSelector("[data-flyer-page]");
await new Promise((r) => setTimeout(r, 2000)); // Zeit zum Hydrieren und für den Effekt, der Links öffnet
check(!(await page.$(".pswp--open")), "Link einer Woche, die nicht mehr online ist, öffnet keine fremde Seite");
check(third.size === 0, `keine Drittanbieter-Anfragen (${[...third].join(",") || "keine"})`);
await b.close();
