// node e2e/lighthouse.mjs [/pfad …] – Lighthouse mobil, 3 Läufe je Seite, Median (Server auf Port 3100). Lighthouse kommt per npx
// (13.5.0), keine Abhängigkeit im Projekt. Ziele (Spec Stufe 5): Leistung ≥ 95 und CLS 0 überall, /angebote ≤ 1 MB und LCP ≤ 2,5 s,
// Startseite ohne Video ≤ 700 KB.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { BASE } from "./lib.mjs";

const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/angebote", "/markt", "/kontakt", "/karriere", "/aktuelles", "/aktuelles/resilienzwoche-2026"];
const out = process.env.LH_OUT ?? mkdtempSync(join(tmpdir(), "lh-"));
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];
const rows = [];
for (const path of paths) {
  const runs = [];
  for (let i = 1; i <= 3; i++) {
    const file = join(out, `${path.replace(/\W+/g, "_") || "home"}-${i}.json`);
    execFileSync("npx", ["--yes", "lighthouse@13.5.0", BASE + path, "--quiet", "--output=json", `--output-path=${file}`, "--form-factor=mobile", "--chrome-flags=--headless=new --no-first-run --disable-extensions"], {
      env: { ...process.env, CHROME_PATH: chrome },
      stdio: "ignore",
    });
    const r = JSON.parse(readFileSync(file, "utf8"));
    const media = (r.audits["resource-summary"].details?.items ?? []).find((x) => x.resourceType === "media")?.transferSize ?? 0;
    runs.push({
      perf: r.categories.performance.score * 100,
      lcp: r.audits["largest-contentful-paint"].numericValue,
      cls: r.audits["cumulative-layout-shift"].numericValue,
      kb: r.audits["total-byte-weight"].numericValue / 1024,
      media: media / 1024,
    });
  }
  const m = (k) => median(runs.map((x) => x[k]));
  rows.push({ path, perf: Math.round(m("perf")), lcp: `${(m("lcp") / 1000).toFixed(1)} s`, lcpMs: m("lcp"), cls: +m("cls").toFixed(3), kb: Math.round(m("kb")), ohneVideo: Math.round(m("kb") - m("media")) });
}
console.table(rows);
const bad = rows.filter((r) => r.perf < 95 || r.cls > 0 || (r.path === "/angebote" && (r.kb > 1024 || r.lcpMs > 2500)) || (r.path === "/" && r.ohneVideo > 700));
if (bad.length) {
  console.log(`✗ unter Ziel: ${bad.map((r) => r.path).join(", ")}`);
  process.exit(1);
}
console.log("✓ alle Ziele erreicht");
