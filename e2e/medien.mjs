// node e2e/medien.mjs – Video: Fassung nach Browser (AV1 → HEVC → H.264), 720 × 1280 auch auf dem Handy, im Datensparmodus nur
// das Standbild; Fotos: Qualität der Bildoptimierung (Story 85, große Fotos 85, Galerie-Kacheln 75).
import { BASE, browser, check } from "./lib.mjs";

const b = await browser();
const STORY_VIDEO = 'section[aria-roledescription="Story"] video';

async function storyVideo(vp, { noAv1 = false, saveData = false } = {}) {
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
    }, { timeout: 20000 }, STORY_VIDEO)
    .then(() => true, () => false);
  const info = await page.$eval(STORY_VIDEO, (v) => ({ src: v.currentSrc, w: v.videoWidth, h: v.videoHeight }));
  await page.close();
  return { playing, ...info };
}

const mobile = { width: 390, height: 844, isMobile: true, hasTouch: true };
const desktop = { width: 1280, height: 900 };
let v = await storyVideo(desktop);
check(v.playing && v.src.endsWith("-av1.mp4") && v.w === 720 && v.h === 1280, `Desktop: AV1 720 × 1280 (${v.src.split("/").pop()} ${v.w}×${v.h})`);
v = await storyVideo(mobile);
check(v.playing && v.src.endsWith("-av1.mp4") && v.w === 720, `Handy: AV1 in 720 statt 540 (${v.src.split("/").pop()} ${v.w}×${v.h})`);
v = await storyVideo(mobile, { noAv1: true });
check(v.playing && /-(hevc|h264)\.mp4$/.test(v.src) && v.w === 720, `ohne AV1: HEVC oder H.264 (${v.src.split("/").pop()})`);
v = await storyVideo(mobile, { saveData: true });
check(!v.playing && !v.src, "Datensparmodus: kein Video, nur das Standbild");

await b.close();
