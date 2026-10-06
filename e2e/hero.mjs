// node e2e/hero.mjs – Startseite, Rundgang-Hero (nur lesend). Handy (390 × 844): das Video füllt den ersten Bildschirm randlos,
// Überschrift und beide Knöpfe liegen darin, die Kopfleiste ist transparent, der Rundgang läuft in Schleife und lässt sich anhalten;
// bei reduzierter Bewegung und im Datensparmodus startet er nicht von selbst, der Knopf startet ihn. Desktop (1440 × 900): Text links,
// großer Rahmen rechts (≥ 85 % der Höhe). Keine Story-Navigation mehr.
import { BASE, browser, check } from "./lib.mjs";

const HERO = "section[data-hero]";
const MEDIA = "[data-hero-video]";
const VIDEO = `${MEDIA} video`;
const TOGGLE = `${MEDIA} button[aria-pressed]`;
const mobile = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 3 };
const b = await browser();

const running = (page) =>
  page
    .waitForFunction((s) => {
      const v = document.querySelector(s);
      return v && v.currentSrc && !v.paused && v.readyState >= 2;
    }, { timeout: 20000 }, VIDEO)
    .then(() => true, () => false);
const storyNav = (page) =>
  page.$$eval(`${HERO} button`, (bs) => bs.map((x) => x.getAttribute("aria-label") || x.textContent.trim()).filter((n) => /Weiter|Zurück|Nächstes|Vorheriges/.test(n)));
const settle = () => new Promise((r) => setTimeout(r, 1500));

// Handy
const m = await b.newPage();
await m.setViewport(mobile);
await m.goto(`${BASE}/`, { waitUntil: "load" });
const g = await m.evaluate((H, M) => {
  const r = (el) => el && el.getBoundingClientRect();
  const hero = r(document.querySelector(H));
  const media = r(document.querySelector(M));
  const buttons = [...document.querySelectorAll("#hero-aktionen a")].map((a) => r(a).bottom);
  return {
    vw: innerWidth,
    vh: innerHeight,
    hero: hero && { top: hero.top, h: hero.height },
    media: media && { l: media.left, t: media.top, w: media.width, h: media.height },
    h1Top: r(document.querySelector(`${H} h1`))?.top,
    buttonsBottom: buttons.length ? Math.max(...buttons) : Infinity,
    transparent: document.querySelector("header").classList.contains("on-dark"),
  };
}, HERO, MEDIA);
check(g.hero && Math.abs(g.hero.top) <= 1 && Math.abs(g.hero.h - g.vh) <= 2, `Handy: Hero genau ein Bildschirm hoch (${g.hero && Math.round(g.hero.h)} / ${g.vh})`);
check(g.media && g.media.l <= 0 && g.media.t <= 0 && g.media.w >= g.vw && g.media.h >= g.vh - 2, "Handy: Video randlos über den ganzen Bildschirm");
check(g.h1Top >= 0 && g.buttonsBottom <= g.vh, `Handy: Überschrift und beide Knöpfe im ersten Bildschirm (Knöpfe bis ${Math.round(g.buttonsBottom)} px)`);
check(g.transparent, "Handy: Kopfleiste transparent über dem Video");
check(await running(m), "Handy: der Rundgang läuft nach dem Laden von selbst");
check(await m.$eval(VIDEO, (v) => v.loop), "… in Schleife");
check((await m.$$(`${HERO} video`)).length === 1 && (await storyNav(m)).length === 0, "nur der Rundgang, keine Story-Navigation");
await m.click(TOGGLE);
check(await m.$eval(VIDEO, (v) => v.paused), "Pause-Knopf hält den Rundgang an");
check(await m.$eval(TOGGLE, (t) => t.getAttribute("aria-pressed") === "true" && /abspielen/.test(t.getAttribute("aria-label"))), "… und heißt dann „Rundgang abspielen“");
await m.click(TOGGLE);
check(await running(m), "… und startet ihn wieder");
await m.close();

// Reduzierte Bewegung und Datensparmodus: kein Autoplay, der Knopf startet
for (const [name, prep] of [
  ["reduzierte Bewegung", (p) => p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }])],
  ["Datensparmodus", (p) => p.evaluateOnNewDocument(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }))],
]) {
  const p = await b.newPage();
  await p.setViewport(mobile);
  await prep(p);
  await p.goto(`${BASE}/`, { waitUntil: "load" });
  await settle();
  check(await p.$eval(VIDEO, (v) => v.paused && !v.currentSrc), `${name}: kein Autoplay, nur das Standbild`);
  await p.click(TOGGLE);
  check(await running(p), `${name}: der Knopf startet den Rundgang`);
  await p.close();
}

// Desktop
const d = await b.newPage();
await d.setViewport({ width: 1440, height: 900 });
await d.goto(`${BASE}/`, { waitUntil: "load" });
const dg = await d.evaluate((H, M) => {
  const media = document.querySelector(M)?.getBoundingClientRect();
  const h1 = document.querySelector(`${H} h1`).getBoundingClientRect();
  return { vw: innerWidth, vh: innerHeight, mh: media?.height ?? 0, ml: media?.left ?? 0, h1r: h1.right };
}, HERO, MEDIA);
check(dg.mh >= 0.85 * dg.vh, `Desktop: Rahmen mindestens 85 % der Höhe (${Math.round(dg.mh)} von ${dg.vh} px)`);
check(dg.ml > dg.vw / 2 && dg.h1r <= dg.ml, "Desktop: Text links, Video rechts");
check((await storyNav(d)).length === 0, "Desktop: keine Story-Navigation");
await b.close();
