// Gemeinsame Helfer der Browser-Tests. Server separat starten (Standard: http://localhost:3100).
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

export const BASE = process.env.E2E_BASE ?? "http://localhost:3100";
const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export function browser() {
  return puppeteer.launch({ executablePath: CHROME, headless: true });
}

export async function login(page, email = process.env.E2E_EMAIL, password = process.env.E2E_PASSWORD) {
  // ohne weiches Scrollen: sonst klickt Puppeteer, bevor ein Knopf fertig ins Bild gescrollt ist
  await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await page.goto(`${BASE}/cockpit/anmelden`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', email);
  await page.type('input[name="passwort"]', password);
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}), page.click('button[type="submit"]')]);
}

export function check(cond, msg) {
  if (!cond) throw new Error(`✗ ${msg}`);
  console.log(`✓ ${msg}`);
}
