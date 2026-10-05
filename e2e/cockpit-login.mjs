// node --env-file=.env.local e2e/cockpit-login.mjs (Server muss laufen, siehe E2E_BASE)
import { BASE, browser, check, login } from "./lib.mjs";

const b = await browser();
const page = await b.newPage();

await page.goto(`${BASE}/cockpit/prospekt`, { waitUntil: "networkidle0" });
check(page.url().startsWith(`${BASE}/cockpit/anmelden?weiter=%2Fcockpit%2Fprospekt`), "ohne Anmeldung → Anmeldeseite mit Rücksprung");

await login(page, process.env.E2E_EMAIL, "falsch-falsch-falsch");
await page.waitForSelector('[role="alert"]');
check((await page.$eval('[role="alert"]', (e) => e.textContent)).includes("stimmt nicht"), "falsches Passwort → Meldung");
check((await page.$eval('input[name="email"]', (e) => e.value)) === process.env.E2E_EMAIL, "falsches Passwort → E-Mail bleibt stehen");

await login(page);
check(new URL(page.url()).pathname === "/cockpit", "richtiges Passwort → Übersicht");
check(await page.$eval("h1", (e) => e.textContent.includes("Hallo")), "Begrüßung sichtbar");
const sessionCookies = (await page.cookies()).filter((c) => c.name.startsWith("sb-"));
const privacy = await (await fetch(`${BASE}/datenschutz`)).text();
check(sessionCookies.length > 0 && privacy.includes("Sitzungs-Cookies"), `Anmeldung setzt ${sessionCookies.length} Sitzungs-Cookie(s) – die Datenschutzerklärung nennt sie`);

await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click('[data-action="logout"]')]);
check(new URL(page.url()).pathname === "/cockpit/anmelden", "Abmelden → Anmeldeseite");
await b.close();
