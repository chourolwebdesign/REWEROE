// node e2e/mobil.mjs – die Website auf dem Handy (nur lesend). 390 × 844, Faktor 3: Startseite höchstens 10 Bildschirme (ohne
// Laufband und Zahlenband, Galerie ohne Rundgang-Clip und Service-Karten als waagerechte Reihen), Footer höchstens 1,2 Bildschirme,
// rote Seitenköpfe höchstens halber Bildschirm (mit Knopfzeile oder langem Titel 0,7), auf /angebote zwei Drittel der ersten Prospektseite im ersten Bildschirm,
// Brotkrumen ≥ 24 px hoch, Eyebrows ≥ 14 px, Formularfelder ≥ 16 px (iOS zoomt sonst), echte Bildbreiten der Galerie; 360 und
// 430 px: kein seitliches Scrollen.
import { BASE, browser, check } from "./lib.mjs";

const PAGES = ["/", "/angebote", "/markt", "/kontakt", "/karriere", "/karriere/bewerben", "/aktuelles", "/aktuelles/resilienzwoche-2026", "/feedback", "/impressum", "/datenschutz"];
// Rote Köpfe: höchstens halber Bildschirm; mit Knopfzeile (Markt, Karriere) oder langem Titel und Einleitung (Beitrag) höchstens
// 0,7 – dort gehören sie zum Inhalt (vorher 0,69–0,77).
const RED = [["/angebote", 0.5], ["/kontakt", 0.5], ["/aktuelles", 0.5], ["/markt", 0.7], ["/karriere", 0.7], ["/aktuelles/resilienzwoche-2026", 0.7]];
const phone = (width) => ({ width, height: Math.round(width * 2.164), isMobile: true, hasTouch: true, deviceScaleFactor: 3 });
const b = await browser();
const p = await b.newPage();
await p.setViewport(phone(390));
await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
const open = async (path) => {
  await p.goto(`${BASE}${path}`, { waitUntil: "load" });
  await new Promise((r) => setTimeout(r, 500));
};
const shown = (sel) => p.$$eval(sel, (els) => els.filter((e) => e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden").length);
/** Kacheln einer Liste in einer Reihe, die Liste scrollt waagerecht */
const row = (list) =>
  p.$eval(list, (ul) => {
    const tops = [...ul.children].filter((li) => li.getClientRects().length).map((li) => Math.round(li.getBoundingClientRect().top));
    return { items: tops.length, oneRow: new Set(tops).size === 1, scrolls: ul.scrollWidth > ul.clientWidth };
  });

// Startseite
await open("/");
const home = await p.evaluate(() => document.documentElement.scrollHeight / innerHeight);
check(home <= 10, `Startseite höchstens 10 Bildschirme (${home.toFixed(1)})`);
check((await shown(".marquee-viewport")) === 0 && (await shown('section[aria-labelledby="zahlen-titel"]')) === 0, "Startseite: kein Laufband, kein Zahlenband");
check((await shown('section[aria-labelledby="markt-titel"] button[aria-label^="Clip abspielen"]')) === 0, "Startseite: Galerie ohne Rundgang-Clip (der ist der Hero)");
const gallery = await row('section[aria-labelledby="markt-titel"] ul');
check(gallery.oneRow && gallery.scrolls && gallery.items >= 4, `Startseite: Galerie als waagerechte Reihe (${gallery.items} Kacheln)`);
const highlights = await row('section[aria-labelledby="sortiment-titel"] [class*="snap-row"]');
check(highlights.oneRow && highlights.scrolls, `Startseite: „Regional, Bio und frisch gebacken“ als waagerechte Reihe (${highlights.items})`);
const services = await row('section[aria-labelledby="praktisch-titel"] ul');
check(services.oneRow && services.scrolls, `Startseite: Service-Karten als waagerechte Reihe (${services.items})`);
check((await p.$$eval('section[aria-labelledby="praktisch-titel"] h3', (hs) => hs.filter((h) => h.getClientRects().length && /Bewerben/.test(h.textContent)).length)) === 0, "Startseite: keine Karte „Bewerben in 60 Sekunden“ (die Karriere-Band bleibt)");

// Footer
const footer = await p.evaluate(() => [...document.querySelectorAll("footer")].pop().getBoundingClientRect().height / innerHeight);
check(footer <= 1.2, `Footer höchstens 1,2 Bildschirme (${footer.toFixed(2)})`);

// Rote Seitenköpfe, Prospekt im ersten Bildschirm
for (const [path, max] of RED) {
  await open(path);
  const share = await p.evaluate(() => document.querySelector("[data-hero]").getBoundingClientRect().height / innerHeight);
  check(share <= max, `${path}: roter Kopf höchstens ${max === 0.5 ? "halber Bildschirm" : max} (${share.toFixed(2)})`);
}
await open("/angebote");
const flyer = await p.$eval("[data-flyer-page] img", (img) => {
  const r = img.getBoundingClientRect();
  return (Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) / r.height;
});
check(flyer >= 2 / 3, `/angebote: zwei Drittel der ersten Prospektseite im ersten Bildschirm (${Math.round(flyer * 100)} %)`);

// Brotkrumen, Eyebrows, Formularfelder – auf allen Seiten
const crumbs = [];
const eyebrows = [];
const fields = [];
for (const path of PAGES) {
  await open(path);
  const r = await p.evaluate(() => {
    const vis = (e) => e.getClientRects().length > 0;
    return {
      crumbs: [...document.querySelectorAll('nav[aria-label="Brotkrumen"] a')].filter(vis).filter((a) => a.getBoundingClientRect().height < 24).map((a) => `${a.textContent.trim()} ${Math.round(a.getBoundingClientRect().height)} px`),
      eyebrows: [...document.querySelectorAll(".text-eyebrow")].filter(vis).filter((e) => parseFloat(getComputedStyle(e).fontSize) < 14).map((e) => `${e.textContent.trim().slice(0, 24)} ${getComputedStyle(e).fontSize}`),
      fields: [...document.querySelectorAll("input:not([type=hidden]):not([type=checkbox]):not([type=radio]):not([type=file]), select, textarea")].filter(vis).filter((e) => parseFloat(getComputedStyle(e).fontSize) < 16).map((e) => `${e.name || e.id || e.tagName} ${getComputedStyle(e).fontSize}`),
    };
  });
  crumbs.push(...r.crumbs.map((x) => `${path}: ${x}`));
  eyebrows.push(...r.eyebrows.map((x) => `${path}: ${x}`));
  fields.push(...r.fields.map((x) => `${path}: ${x}`));
}
check(crumbs.length === 0, `Brotkrumen mindestens 24 px hoch${crumbs.length ? ` (${[...new Set(crumbs)].slice(0, 3).join("; ")})` : ""}`);
check(eyebrows.length === 0, `Eyebrows mindestens 14 px${eyebrows.length ? ` (${[...new Set(eyebrows)].slice(0, 3).join("; ")})` : ""}`);
check(fields.length === 0, `Formularfelder mindestens 16 px${fields.length ? ` (${fields.slice(0, 3).join("; ")})` : ""}`);

// Echte Bildbreiten: Galerie-Kacheln (Zuschnitt eingerechnet) und Hero-Poster
const realPx = (sel) =>
  p.$$eval(sel, async (imgs) => {
    const out = [];
    for (const img of imgs) {
      const r = img.getBoundingClientRect();
      if (!img.currentSrc || r.width < 40) continue;
      const [w, h] = await new Promise((ok) => {
        const im = new Image();
        im.onload = () => ok([im.naturalWidth, im.naturalHeight]);
        im.onerror = () => ok([0, 0]);
        im.src = img.currentSrc;
      });
      if (!w) continue;
      const need = (getComputedStyle(img).objectFit === "cover" ? Math.max(r.width, r.height * (w / h)) : r.width) * devicePixelRatio;
      out.push({ name: img.alt.slice(0, 28), need: Math.round(need), has: w });
    }
    return out;
  });
const soft = [];
for (const path of ["/", "/markt"]) {
  await open(path);
  await p.evaluate(async () => {
    for (const ul of document.querySelectorAll('section[aria-labelledby="markt-titel"] ul, section[aria-label="Bilder aus dem Markt"] ul')) ul.scrollLeft = ul.scrollWidth;
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight) {
      window.scrollTo({ top: y, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 120));
    }
  });
  await new Promise((r) => setTimeout(r, 600));
  for (const x of await realPx('button[aria-label^="Foto vergrößern"] img')) if (x.has * 1.15 < x.need) soft.push(`${path} ${x.name}: braucht ${x.need}, hat ${x.has}`);
}
check(soft.length === 0, `Galerie-Kacheln scharf auf 3×-Displays${soft.length ? ` (${soft.slice(0, 3).join("; ")})` : ""}`);
await open("/aktuelles/resilienzwoche-2026");
const group = await p.$eval('button[aria-label^="Foto vergrößern"]', async (btn) => {
  btn.scrollIntoView({ block: "center", behavior: "instant" });
  const img = btn.querySelector("img");
  if (!img.complete || !img.naturalWidth) await new Promise((ok) => img.addEventListener("load", ok, { once: true }));
  const r = btn.getBoundingClientRect();
  return { tile: r.width / r.height, image: img.naturalWidth / img.naturalHeight };
});
check(Math.abs(group.tile - group.image) < 0.03, `Beitrag: erstes Galeriebild (Gruppenfoto) unbeschnitten (Kachel ${group.tile.toFixed(2)}, Bild ${group.image.toFixed(2)})`);
await open("/");
const poster = (await realPx("[data-hero-video] img"))[0];
check(poster?.has === 1080, `Hero-Poster in 1080 px (${poster?.has})`);

// 360 und 430 px: kein seitliches Scrollen
for (const width of [360, 430]) {
  await p.setViewport(phone(width));
  const wide = [];
  for (const path of PAGES) {
    await open(path);
    const over = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    if (over > 0) wide.push(`${path} +${over}px`);
  }
  check(wide.length === 0, `${width} px: kein seitliches Scrollen${wide.length ? ` (${wide.join(", ")})` : ""}`);
}

// Desktop behält die Bewerben-Karte
await p.setViewport({ width: 1280, height: 900 });
await open("/");
check((await p.$$eval('section[aria-labelledby="praktisch-titel"] h3', (hs) => hs.filter((h) => h.getClientRects().length && /Bewerben/.test(h.textContent)).length)) === 1, "Desktop: Karte „Bewerben in 60 Sekunden“ bleibt");
await b.close();
