// node --env-file=.env.local e2e/cockpit-prospekt.mjs – Test-Prospekt der laufenden Woche: Abbruch/Fortsetzen (JPEG),
// Ersetzen (WebP), abgelaufene Sitzung, öffentliches Bild, Löschen. KEEP=1 lässt den Prospekt am Ende stehen (Task 7).
// Bricht ab, wenn für diese Woche schon ein echter Prospekt online ist.
import { createClient } from "@supabase/supabase-js";
import { readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BASE, browser, check, login } from "./lib.mjs";

const cfg = readFileSync(new URL("../lib/supabase/config.ts", import.meta.url), "utf8");
const pick = (name) => process.env[`NEXT_PUBLIC_${name}`] || cfg.match(new RegExp(`${name} = [^"]*"([^"]+)"`))[1];
const sb = createClient(pick("SUPABASE_URL"), pick("SUPABASE_PUBLISHABLE_KEY"), { auth: { persistSession: false } });
await sb.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD });

// laufende ISO-Woche (Berlin) für den Dateinamen
const berlin = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Berlin" }).format(new Date());
const d = new Date(`${berlin}T12:00:00Z`);
const day = d.getUTCDay() || 7;
const thu = new Date(d); thu.setUTCDate(d.getUTCDate() + 4 - day);
const kw = Math.ceil(((thu - Date.UTC(thu.getUTCFullYear(), 0, 1)) / 864e5 + 1) / 7);
const monday = new Date(d); monday.setUTCDate(d.getUTCDate() - (day - 1));
const weekStart = monday.toISOString().slice(0, 10);

const existing = await sb.from("flyers").select("id,source_name").eq("week_start", weekStart).eq("status", "published");
if (existing.data?.some((f) => !f.source_name.includes("TESTPROSPEKT"))) {
  console.error("Abbruch: Für diese Woche ist schon ein echter Prospekt online.");
  process.exit(1);
}

const b = await browser();
const maker = await b.newPage();
await maker.setContent(`<style>@page{size:A4;margin:0}body{margin:0}section{height:296mm;overflow:hidden;display:grid;place-items:center;font:700 64px sans-serif;break-after:page}section:last-child{break-after:auto}</style>
  ${[1, 2, 3].map((n) => `<section style="background:hsl(${n * 90} 70% 85%)">TESTPROSPEKT KW ${kw} · Seite ${n}</section>`).join("")}`);
const pdfPath = join(tmpdir(), `KW${kw}_${thu.getUTCFullYear()}_TESTPROSPEKT.pdf`);
writeFileSync(pdfPath, await maker.pdf({ format: "A4", printBackground: true }));
await maker.close();

const page = await b.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
await login(page);

/** fault: "abort" (Netz weg bei Seite 2), "expired" (401 bei Seite 2) oder nichts */
async function upload({ query = "", fault } = {}) {
  await page.goto(`${BASE}/cockpit/prospekt${query}`, { waitUntil: "networkidle0" });
  let tripped = false;
  const handler = (req) => {
    // nur den Upload selbst (POST), nicht die CORS-Vorabanfrage (OPTIONS)
    if (fault && !tripped && req.method() === "POST" && /\/storage\/v1\/object\/prospekte\/[^/]+\/2\./.test(req.url())) {
      tripped = true;
      return fault === "expired"
        ? req.respond({
            status: 401,
            contentType: "application/json",
            // CORS-Kopfzeilen wie bei Supabase, sonst wertet der Browser die Antwort als Netzfehler
            headers: { "Access-Control-Allow-Origin": new URL(BASE).origin, "Access-Control-Allow-Credentials": "true" },
            body: '{"statusCode":"401","error":"Unauthorized","message":"jwt expired"}',
          })
        : req.abort("failed");
    }
    req.continue();
  };
  if (fault) {
    await page.setRequestInterception(true);
    page.on("request", handler);
  }
  await (await page.$('input[type="file"]')).uploadFile(pdfPath);
  await page.waitForSelector("[data-upload-week]");
  check((await page.$eval("[data-upload-week]", (e) => e.selectedOptions[0].textContent)).includes(`KW ${kw}`), `Woche aus Dateiname erkannt (KW ${kw})`);
  await page.click('[data-action="upload"]');
  if (fault) {
    await page.waitForSelector('[role="alert"]', { timeout: 60000 });
    const msg = await page.$eval('[role="alert"]', (e) => e.textContent);
    page.off("request", handler);
    await page.setRequestInterception(false);
    if (fault === "expired") {
      check(msg.includes("neu an"), `abgelaufene Sitzung → Hinweis zum neuen Anmelden („${msg.slice(0, 60)}…“)`);
      return;
    }
    check(msg.includes("Erneut versuchen"), "Abbruch → Hinweis zum Fortsetzen");
    await page.click('[data-action="retry"]');
  }
  await page.waitForSelector("[data-upload-review]", { timeout: 90000 });
  check((await page.$$("[data-upload-review] img")).length >= 1, "Vorschau der Seiten vor dem Veröffentlichen");
  await page.click('[data-action="publish"]');
  await page.waitForSelector("[data-upload-done]", { timeout: 30000 });
}

await upload({ query: "?format=jpg", fault: "abort" });
let rows = await sb.from("flyers").select("id,format,page_count").eq("week_start", weekStart).eq("status", "published");
check(rows.data.length === 1 && rows.data[0].page_count === 3 && rows.data[0].format === "jpg", "JPEG-Prospekt mit 3 Seiten veröffentlicht");
const firstId = rows.data[0].id;
check(((await sb.storage.from("prospekte").list(firstId)).data ?? []).length === 6, "3 Seiten + 3 Vorschaubilder im Bucket");

await upload();
rows = await sb.from("flyers").select("id,format").eq("week_start", weekStart).eq("status", "published");
check(rows.data.length === 1 && rows.data[0].id !== firstId && rows.data[0].format === "webp", "Ersetzen: genau ein Prospekt, neue ID, WebP");
check(((await sb.storage.from("prospekte").list(firstId)).data ?? []).length === 0, "Bilder des alten Prospekts gelöscht");
const liveId = rows.data[0].id;

await upload({ fault: "expired" });
const pub = await fetch(`${BASE}/prospekt-bilder/${liveId}/1.webp`);
check(pub.ok && (pub.headers.get("content-type") ?? "").includes("image"), "Seitenbild über /prospekt-bilder erreichbar");

// Entwurf aus dem Sitzungs-Test entfernen (bleibt sonst bis zum nächsten Veröffentlichen liegen)
for (const dr of (await sb.from("flyers").select("id").eq("week_start", weekStart).eq("status", "draft")).data ?? []) {
  const { data: files } = await sb.storage.from("prospekte").list(dr.id);
  if (files?.length) await sb.storage.from("prospekte").remove(files.map((f) => `${dr.id}/${f.name}`));
  await sb.from("flyers").delete().eq("id", dr.id);
}

if (!process.env.KEEP) {
  await page.goto(`${BASE}/cockpit/prospekt`, { waitUntil: "networkidle0" });
  page.once("dialog", (dlg) => dlg.accept());
  await page.click(`[data-delete="${liveId}"]`);
  await page.waitForFunction((id) => !document.querySelector(`[data-delete="${id}"]`), { timeout: 15000 }, liveId);
  check(((await sb.from("flyers").select("id").eq("week_start", weekStart)).data ?? []).length === 0, "Löschen entfernt den Prospekt");
}

// Veröffentlichen/Löschen erneuern alle Seiten (revalidatePath "/" layout) – keine darf danach verschwinden
const sitemap = await (await fetch(`${BASE}/sitemap.xml`)).text();
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => `${BASE}${new URL(m[1]).pathname}`);
const posts = urls.filter((u) => /\/aktuelles\/[^/]+$/.test(u)).map((u) => `${BASE}/og/beitrag-${u.split("/").pop()}.jpg`);
const broken = [];
for (const u of [...urls, ...posts]) {
  const res = await fetch(u);
  if (res.status !== 200) broken.push(`${new URL(u).pathname} ${res.status}`);
}
check(broken.length === 0, `nach dem Cockpit antworten alle ${urls.length + posts.length} Seiten und Beitragsbilder mit 200${broken.length ? ` (${broken.join(", ")})` : ""}`);
await b.close();
