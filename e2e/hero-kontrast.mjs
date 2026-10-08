// node e2e/hero-kontrast.mjs – Kontrast der weißen Schrift über dem Rundgang-Video (nur lesend; Spec Stufe 6: „am Screenshot
// gemessen“). Die Schrift wird durchsichtig gemacht (Hintergründe, Pillen und Verläufe bleiben), das Video in 1-Sekunden-Schritten
// durchgespult; je Textfeld zählt der hellste Hintergrund (99. Perzentil der Leuchtdichte) über alle Bilder. Ziel 4,5:1, große
// Schrift (H1) und das Menü-Symbol 3:1. Formate: Referenz, Safari mit Leisten, kleines Android, Tablet und Handy quer.
import { createRequire } from "node:module";
import { BASE, browser, check } from "./lib.mjs";
const require = createRequire(import.meta.url);
const sharp = require("sharp");

const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (L) => 1.05 / (L + 0.05);
const NEED = { "Kopfleiste „Rödelheim“": 4.5, "Kopfleiste „Ali Alamyaar oHG“": 4.5, "Menü-Symbol": 3, Eyebrow: 4.5, "H1 (große Schrift)": 3, "Öffnungsstatus": 4.5, "Knopf „Route“": 4.5 };

const b = await browser();
for (const [w, h] of [[390, 844], [390, 664], [360, 640], [1000, 700], [844, 390]]) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  await p.goto(`${BASE}/`, { waitUntil: "load" });
  await p.waitForFunction(() => {
    const v = document.querySelector("[data-hero-video] video");
    return v && v.readyState >= 2 && !v.paused;
  }, { timeout: 20000 });
  const { boxes, duration } = await p.evaluate(() => {
    const textBox = (node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const r = range.getBoundingClientRect();
      return [r.left, r.top, r.width, r.height].map(Math.round);
    };
    const rect = (el) => {
      const r = el.getBoundingClientRect();
      return [r.left, r.top, r.width, r.height].map(Math.round);
    };
    const hero = document.querySelector("section[data-hero]");
    const logo = document.querySelector("header a[href='/'] span.leading-tight");
    const status = hero.querySelector("#hero-aktionen").previousElementSibling;
    const out = {
      "Kopfleiste „Rödelheim“": textBox(logo.children[0]),
      "Kopfleiste „Ali Alamyaar oHG“": textBox(logo.children[1]),
      "Menü-Symbol": rect(document.querySelector("header button[aria-label='Menü öffnen'] svg")),
      Eyebrow: textBox([...hero.querySelector("p.text-eyebrow").childNodes].find((n) => n.nodeType === 3)),
      "H1 (große Schrift)": textBox(hero.querySelector("h1").childNodes[0]),
      "Öffnungsstatus": textBox(status.lastElementChild ?? status),
      "Knopf „Route“": textBox([...hero.querySelectorAll("#hero-aktionen a")][1]),
    };
    const v = document.querySelector("[data-hero-video] video");
    v.pause();
    const s = document.createElement("style");
    s.textContent = `section[data-hero] *, header * { color: transparent !important; text-shadow: none !important }
      section[data-hero] svg, header svg { visibility: hidden !important }
      section[data-hero] .bg-white.text-red { background: transparent !important }
      #hero-aktionen a:first-child, [data-hero-video] button { visibility: hidden !important }
      nav[aria-label="Schnellzugriff"] { display: none !important }`;
    document.head.append(s);
    return { boxes: out, duration: v.duration };
  });
  const worst = {};
  for (let t = 0; t < duration; t += 1) {
    await p.evaluate(
      (t) =>
        new Promise((ok) => {
          const v = document.querySelector("[data-hero-video] video");
          v.addEventListener("seeked", () => requestAnimationFrame(() => requestAnimationFrame(ok)), { once: true });
          v.currentTime = t;
        }),
      t,
    );
    const { data, info } = await sharp(await p.screenshot({ type: "png" })).raw().toBuffer({ resolveWithObject: true });
    for (const [name, [x, y, bw, bh]] of Object.entries(boxes)) {
      const Ls = [];
      for (let yy = Math.max(0, y); yy < Math.min(info.height, y + bh); yy++)
        for (let xx = Math.max(0, x); xx < Math.min(info.width, x + bw); xx++) {
          const i = (yy * info.width + xx) * info.channels;
          Ls.push(lum(data[i], data[i + 1], data[i + 2]));
        }
      if (!Ls.length) continue;
      Ls.sort((a, c) => a - c);
      const p99 = Ls[Math.floor(Ls.length * 0.99)];
      if (!worst[name] || p99 > worst[name]) worst[name] = p99;
    }
  }
  const low = Object.entries(worst)
    .map(([name, L]) => [name, ratio(L)])
    .filter(([name, r]) => r < NEED[name]);
  const all = Object.entries(worst).map(([name, L]) => `${name} ${ratio(L).toFixed(1)}`).join(", ");
  check(low.length === 0, `${w} × ${h}: Schrift über dem Video lesbar${low.length ? ` – zu schwach: ${low.map(([n, r]) => `${n} ${r.toFixed(2)}:1`).join(", ")}` : ` (${all})`}`);
  await p.close();
}
await b.close();
