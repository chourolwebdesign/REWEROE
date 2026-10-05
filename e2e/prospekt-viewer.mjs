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
await page.goto(`${BASE}/angebote`, { waitUntil: "networkidle0" });

const thumbs = await page.$$("[data-flyer-page]");
check(thumbs.length >= 1, `Raster mit ${thumbs.length} Seiten`);
check((await page.$eval("[data-flyer-page] img", (i) => i.getAttribute("alt"))).startsWith("Prospektseite 1 von"), "Alt-Text „Prospektseite 1 von …“");
await thumbs[0].click();
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /1\s*\/\s*\d+/.test(e.textContent)), "Viewer offen bei 1 / N");
await page.keyboard.press("ArrowRight");
await page.waitForFunction(() => new URLSearchParams(location.search).get("seite") === "2");
check(true, "Pfeiltaste blättert, Adresse zeigt ?seite=2");
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector(".pswp--open"));
check(await page.evaluate(() => document.activeElement?.hasAttribute("data-flyer-page") && !location.search.includes("seite")), "Esc schließt, Fokus im Raster, ?seite entfernt");

await page.goto(`${BASE}/angebote?seite=2`, { waitUntil: "networkidle0" });
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /2\s*\/\s*\d+/.test(e.textContent)), "Link mit ?seite=2 öffnet Seite 2");
check(third.size === 0, `keine Drittanbieter-Anfragen (${[...third].join(",") || "keine"})`);
await b.close();
