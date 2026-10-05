// node e2e/public-qa.mjs [/pfad …] – axe (Desktop + Mobil), Überlauf bei 320 px, Inhalt ohne JS, keine Drittanbieter.
import { createRequire } from "node:module";
import { BASE, browser, check } from "./lib.mjs";
const require = createRequire(import.meta.url);
const { AxePuppeteer } = require("@axe-core/puppeteer");

const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/angebote", "/markt", "/aktuelles", "/karriere", "/karriere/bewerben", "/kontakt", "/impressum", "/datenschutz", "/gibts-nicht"];
const local = new Set(["localhost", "127.0.0.1"]);
const b = await browser();
for (const path of paths) {
  for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844, isMobile: true, hasTouch: true }]) {
    const p = await b.newPage();
    const third = new Set();
    p.on("request", (r) => { const u = new URL(r.url()); if (!local.has(u.hostname) && u.protocol.startsWith("http")) third.add(u.hostname); });
    await p.setViewport(vp);
    await p.goto(BASE + path, { waitUntil: "load" });
    // einmal durchscrollen (Einblendungen auslösen), dann zurück nach oben: axe bewertet Ziele unter fest stehenden Leisten
    // je nach Scrollstand als verdeckt – geprüft wird der Seitenanfang wie beim ersten Aufruf. Ohne Animation scrollen
    // (html hat scroll-behavior: smooth): sonst lief axe noch am Seitenende, und das nachlaufende Scrollen verschob die
    // Fokus-Prüfung unten zufällig um einige hundert Pixel.
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 350) { scrollTo({ top: y, behavior: "instant" }); await new Promise((r) => setTimeout(r, 60)); } await new Promise((r) => setTimeout(r, 900)); scrollTo({ top: 0, behavior: "instant" }); await new Promise((r) => setTimeout(r, 300)); });
    const res = await new AxePuppeteer(p).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    check(res.violations.length === 0, `${path} ${vp.width}px axe ${res.violations.map((v) => `${v.id}(${v.nodes.length})`).join(" ") || "0"}`);
    check(third.size === 0, `${path} ${vp.width}px Drittanbieter ${[...third].join(",") || "keine"}`);
    if (vp.isMobile) {
      // WCAG 2.4.11: ein per Tastatur fokussierter Link darf nicht unter der Schnellzugriff-Leiste verschwinden
      await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
      const covered = await p.evaluate(async () => {
        const bad = [];
        for (const el of document.querySelectorAll("footer a[href], footer button")) {
          scrollTo(0, 0);
          el.focus();
          await new Promise((r) => setTimeout(r, 120));
          const bar = document.querySelector('nav[aria-label="Schnellzugriff"]');
          if (!bar || getComputedStyle(bar).visibility === "hidden") continue;
          const a = el.getBoundingClientRect();
          const b = bar.getBoundingClientRect();
          if (a.bottom > b.top && a.top < b.bottom) bad.push(el.textContent.trim().slice(0, 30));
        }
        return bad;
      });
      check(covered.length === 0, `${path} ${vp.width}px Fokus nicht unter der Leiste ${covered.join(", ")}`);
    }
    await p.close();
  }
  const narrow = await b.newPage();
  await narrow.setViewport({ width: 320, height: 640, isMobile: true, hasTouch: true });
  await narrow.goto(BASE + path, { waitUntil: "load" });
  check(await narrow.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} kein Überlauf bei 320 px`);
  await narrow.close();
  const nojs = await b.newPage();
  await nojs.setJavaScriptEnabled(false);
  await nojs.goto(BASE + path, { waitUntil: "load" });
  check(await nojs.evaluate(() => Boolean(document.querySelector("h1")) && [...document.querySelectorAll(".reveal")].every((e) => getComputedStyle(e).opacity !== "0")), `${path} ohne JS lesbar`);
  await nojs.close();
}
await b.close();
