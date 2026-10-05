// node --env-file=.env.local e2e/cockpit-axe.mjs – axe für Anmeldung, Übersicht und Prospekt (Desktop + Mobil)
import { createRequire } from "node:module";
import { BASE, browser, check, login } from "./lib.mjs";
const require = createRequire(import.meta.url);
const { AxePuppeteer } = require("@axe-core/puppeteer");

const tags = ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"];
const b = await browser();
for (const vp of [{ width: 1280, height: 900 }, { width: 390, height: 844, isMobile: true, hasTouch: true }]) {
  const page = await b.newPage();
  await page.setViewport(vp);
  await page.goto(`${BASE}/cockpit/anmelden`, { waitUntil: "networkidle0" });
  const first = await new AxePuppeteer(page).withTags(tags).analyze();
  check(first.violations.length === 0, `axe /cockpit/anmelden ${vp.width}px: ${first.violations.map((v) => v.id).join(",") || "0"}`);
  await login(page);
  for (const path of ["/cockpit", "/cockpit/prospekt"]) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle0" });
    const res = await new AxePuppeteer(page).withTags(tags).analyze();
    check(res.violations.length === 0, `axe ${path} ${vp.width}px: ${res.violations.map((v) => v.id).join(",") || "0"}`);
  }
  await page.close();
}
await b.close();
