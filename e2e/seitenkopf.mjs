// node e2e/seitenkopf.mjs – rote Seitenköpfe: Kopfleiste anfangs transparent darüber, nach dem Kopf weiß; schlichte Seiten weiß –
// auch nach Navigation im Browser (ohne Neuladen).
import { BASE, browser, check } from "./lib.mjs";

const HERO = ["/", "/angebote", "/markt", "/kontakt", "/karriere", "/aktuelles", "/aktuelles/resilienzwoche-2026"];
const PLAIN = ["/impressum", "/datenschutz", "/karriere/bewerben"];
const b = await browser();
const page = await b.newPage();
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
const state = () =>
  page.evaluate(() => ({ transparent: document.querySelector("header").classList.contains("on-dark"), hero: Boolean(document.querySelector("[data-hero]")) }));
const until = (fn) => page.waitForFunction(fn, { timeout: 8000 }).then(() => true, () => false);

for (const vp of [{ width: 390, height: 844, isMobile: true, hasTouch: true }, { width: 1280, height: 900 }]) {
  await page.setViewport(vp);
  for (const path of HERO) {
    await page.goto(BASE + path, { waitUntil: "load" });
    const s = await state();
    check(s.hero && s.transparent, `${path} ${vp.width}px: roter Kopf, Leiste transparent`);
    await page.evaluate(() => {
      const el = document.querySelector("[data-hero]");
      scrollTo({ top: el.offsetTop + el.offsetHeight + 200, behavior: "instant" });
    });
    check(await until(() => !document.querySelector("header").classList.contains("on-dark")), `${path} ${vp.width}px: nach dem Kopf weiß`);
  }
  for (const path of PLAIN) {
    await page.goto(BASE + path, { waitUntil: "load" });
    const s = await state();
    check(!s.hero && !s.transparent, `${path} ${vp.width}px: schlicht, Leiste weiß`);
  }
}

// Navigation ohne Neuladen: /impressum → „Unser Markt“ (Kopfleiste) → „Impressum“ (Fußzeile)
await page.setViewport({ width: 1280, height: 900 });
await page.goto(`${BASE}/impressum`, { waitUntil: "load" });
await page.$eval('header a[href="/markt"]', (a) => a.click());
check(await until(() => location.pathname === "/markt" && document.querySelector("header").classList.contains("on-dark")), "/impressum → /markt im Browser: Leiste wird transparent");
await page.$eval('footer a[href="/impressum"]', (a) => a.click());
check(await until(() => location.pathname === "/impressum" && !document.querySelector("header").classList.contains("on-dark")), "/markt → /impressum im Browser: Leiste wird weiß");
await b.close();
