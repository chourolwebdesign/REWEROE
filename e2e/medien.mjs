// node e2e/medien.mjs – Video: Fassung nach Browser (AV1 → HEVC → H.264), 1080 × 1920 auf allen Geräten, Poster in derselben
// Auflösung, im Datensparmodus nur das Standbild; Fotos: Qualität der Bildoptimierung (Hero-Poster 85, große Fotos 85, Galerie-Kacheln 75).
import { BASE, browser, check } from "./lib.mjs";

const b = await browser();
const HERO_VIDEO = "[data-hero-video] video";

async function heroVideo(vp, { noAv1 = false, saveData = false } = {}) {
  const page = await b.newPage();
  await page.setViewport(vp);
  if (noAv1) {
    await page.evaluateOnNewDocument(() => {
      const orig = HTMLMediaElement.prototype.canPlayType;
      HTMLMediaElement.prototype.canPlayType = function (t) {
        return t.includes("av01") ? "" : orig.call(this, t);
      };
    });
  }
  if (saveData) await page.evaluateOnNewDocument(() => Object.defineProperty(navigator, "connection", { value: { saveData: true } }));
  await page.goto(`${BASE}/`, { waitUntil: "load" });
  const playing = await page
    .waitForFunction((s) => {
      const v = document.querySelector(s);
      return v && v.currentSrc && v.readyState >= 2;
    }, { timeout: 20000 }, HERO_VIDEO)
    .then(() => true, () => false);
  const info = await page.$eval(HERO_VIDEO, (v) => ({ src: v.currentSrc, w: v.videoWidth, h: v.videoHeight }));
  await page.close();
  return { playing, ...info };
}

const mobile = { width: 390, height: 844, isMobile: true, hasTouch: true };
const desktop = { width: 1280, height: 900 };
let v = await heroVideo(desktop);
check(v.playing && v.src.endsWith("-1080-av1.mp4") && v.w === 1080 && v.h === 1920, `Desktop: AV1 1080 × 1920 (${v.src.split("/").pop()} ${v.w}×${v.h})`);
v = await heroVideo(mobile);
check(v.playing && v.src.endsWith("-1080-av1.mp4") && v.w === 1080, `Handy: AV1 in 1080 (${v.src.split("/").pop()} ${v.w}×${v.h})`);
v = await heroVideo(mobile, { noAv1: true });
check(v.playing && /-1080-(hevc|h264)\.mp4$/.test(v.src) && v.w === 1080, `ohne AV1: HEVC oder H.264 in 1080 (${v.src.split("/").pop()})`);
v = await heroVideo(mobile, { saveData: true });
check(!v.playing && !v.src, "Datensparmodus: kein Video, nur das Standbild");

// Fotos: Qualität der Bildoptimierung (Parameter q= in der Bildadresse)
const photos = await b.newPage();
await photos.setViewport(desktop);
await photos.goto(`${BASE}/`, { waitUntil: "load" });
const param = (sel, name) => photos.$eval(sel, (i, n) => new URL(i.currentSrc || i.src, location.href).searchParams.get(n), name).catch(() => null);
const HERO_IMG = "[data-hero-video] img";
const TILE_IMG = 'button[aria-label^="Foto vergrößern"] img';
const MARKT_IMG = 'section[aria-label="Bilder aus dem Markt"] img';
check((await param(HERO_IMG, "q")) === "85", "Hero-Poster: Qualität 85");
check((await param(TILE_IMG, "q")) === "75", "Galerie-Kachel: Qualität 75");
await photos.goto(`${BASE}/markt`, { waitUntil: "load" });
check((await param(MARKT_IMG, "q")) === "85", "/markt: großes Foto Qualität 85");
// Retina-Handy (3×): die Bildoptimierung liefert genug Pixel (sizes passt zur angezeigten Breite)
await photos.setViewport({ ...mobile, deviceScaleFactor: 3 });
await photos.goto(`${BASE}/`, { waitUntil: "load" });
check(Number(await param(HERO_IMG, "w")) >= 1080, `Hero-Poster auf Retina-Handy ≥ 1080 px (${await param(HERO_IMG, "w")})`);
// echte Pixel des Posters (die Bildoptimierung vergrößert nie über die Quelle hinaus)
const posterPx = await photos.$eval(HERO_IMG, (i) => new Promise((ok) => { const im = new Image(); im.onload = () => ok(im.naturalWidth + "×" + im.naturalHeight); im.onerror = () => ok("–"); im.src = i.currentSrc; }));
check(posterPx === "1080×1920", `Poster in Videoauflösung 1080 × 1920 (${posterPx})`);
check(Number(await param(TILE_IMG, "w")) >= 384, `Galerie-Kachel auf Retina-Handy ≥ 384 px (${await param(TILE_IMG, "w")})`);
await photos.goto(`${BASE}/markt`, { waitUntil: "load" });
check(Number(await param(MARKT_IMG, "w")) >= 1080, `/markt-Foto auf Retina-Handy ≥ 1080 px (${await param(MARKT_IMG, "w")})`);
await photos.close();

await b.close();
