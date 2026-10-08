// node e2e/hero.mjs – Startseite, Rundgang-Hero (nur lesend). Handy (390 × 844): das Video füllt den ersten Bildschirm randlos,
// Überschrift und beide Knöpfe liegen darin, die Kopfleiste ist transparent, der Rundgang läuft in Schleife und lässt sich anhalten;
// bei reduzierter Bewegung und im Datensparmodus startet er nicht von selbst, der Knopf startet ihn. Desktop (1440 × 900): Text links,
// großer Rahmen rechts (≥ 85 % der Höhe). Keine Story-Navigation mehr. Der Pause-Knopf ist auch bei 320 × 568 und quer antippbar.
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
check(await m.$eval(TOGGLE, (t) => t.getAttribute("aria-pressed") === "true" && t.getAttribute("aria-label") === "Rundgang anhalten"), "… fester Name „Rundgang anhalten“, angehalten = gedrückt (Screenreader: kein widersprüchlicher Zustand)");
await m.click(TOGGLE);
check(await running(m), "… und startet ihn wieder");
await m.close();

// Kleine und quer gehaltene Handys: der Pause-Knopf liegt oben und ist antippbar (nicht unter dem Textblock)
for (const [width, height] of [[320, 568], [844, 390]]) {
  const p = await b.newPage();
  await p.setViewport({ width, height, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await p.goto(`${BASE}/`, { waitUntil: "load" });
  await running(p);
  const onTop = await p.$eval(TOGGLE, (btn) => {
    const r = btn.getBoundingClientRect();
    const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
    return hit === btn || btn.contains(hit);
  });
  await p.tap(TOGGLE);
  const pausedAfterTap = await p.$eval(VIDEO, (v) => v.paused);
  check(onTop && pausedAfterTap, `${width} × ${height}: Pause-Knopf liegt obenauf und hält den Rundgang an`);
  await p.close();
}

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

// Lädt die gewählte Fassung nicht, läuft die nächste; läuft gar keine, bleibt das Poster und der Knopf verschwindet; ohne JS kein Knopf
const blocked = async (pattern) => {
  const p = await b.newPage();
  await p.setViewport(mobile);
  await p.setRequestInterception(true);
  p.on("request", (r) => (pattern.test(r.url()) ? r.abort() : r.continue()));
  await p.goto(`${BASE}/`, { waitUntil: "load" });
  return p;
};
let p = await blocked(/-av1\.mp4$/);
check(await running(p) && /-(hevc|h264)\.mp4$/.test(await p.$eval(VIDEO, (v) => v.currentSrc)), `AV1 lädt nicht → nächste Fassung läuft (${await p.$eval(VIDEO, (v) => v.currentSrc.split("/").pop())})`);
await p.close();
p = await blocked(/\.mp4$/);
await settle();
await settle();
check(
  await p.evaluate((sel) => !document.querySelector(sel)?.getClientRects().length && document.querySelector("[data-hero-video] img")?.getClientRects().length > 0, TOGGLE),
  "keine Fassung lädt → Poster bleibt, kein Pause-Knopf",
);
await p.close();
p = await b.newPage();
await p.setViewport(mobile);
await p.setJavaScriptEnabled(false);
await p.goto(`${BASE}/`, { waitUntil: "load" });
check(await p.evaluate((sel) => !document.querySelector(sel)?.getClientRects().length, TOGGLE), "ohne JavaScript kein Pause-Knopf");
await p.close();

// Kann der Browser kein Format abspielen, gibt es den Knopf gar nicht erst
p = await b.newPage();
await p.setViewport(mobile);
await p.evaluateOnNewDocument(() => {
  HTMLMediaElement.prototype.canPlayType = () => "";
});
await p.goto(`${BASE}/`, { waitUntil: "load" });
await settle();
check(await p.evaluate((sel) => !document.querySelector(sel), TOGGLE), "Browser kann kein Format abspielen → kein Pause-Knopf");
await p.close();
// Verschwindet der Knopf unter dem Fokus, bleibt der Fokus im Hero (nicht auf <body>)
p = await blocked(/\.mp4$/);
await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await p.goto(`${BASE}/`, { waitUntil: "load" });
await settle();
if (await p.$(TOGGLE)) {
  await p.focus(TOGGLE);
  await p.keyboard.press("Enter");
  await settle();
  await settle();
}
check(await p.evaluate((sel) => !document.querySelector(sel) && document.activeElement !== document.body && !!document.activeElement?.closest("section[data-hero]"), TOGGLE), "… Knopf weg, Fokus bleibt im Hero");
await p.close();
// Nach einer Client-Navigation von einer Seite ohne Server-HTML (unbekannter Beitrag) ist der Knopf da und html.js gesetzt
p = await b.newPage();
await p.setViewport(mobile);
await p.goto(`${BASE}/aktuelles/gibts-nicht`, { waitUntil: "load" });
await new Promise((r) => setTimeout(r, 800));
await Promise.all([p.waitForNavigation({ waitUntil: "load" }).catch(() => {}), p.evaluate(() => [...document.querySelectorAll("main a")].find((a) => a.textContent.includes("Zur Startseite"))?.click())]);
await p.waitForFunction(() => location.pathname === "/", { timeout: 10000 }).catch(() => {});
await running(p);
check(
  await p.evaluate((sel) => document.documentElement.classList.contains("js") && document.querySelector(sel)?.getClientRects().length > 0, TOGGLE),
  "Client-Navigation von der 404 zur Startseite: Pause-Knopf sichtbar, html.js gesetzt",
);
await p.close();

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
