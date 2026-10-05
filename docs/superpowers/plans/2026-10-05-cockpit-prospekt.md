# Markt-Cockpit (Stufe 1) und Prospekt (Stufe 2) – Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Der Markt meldet sich im Cockpit an, lädt den Wochenprospekt als PDF hoch, und die Website zeigt ihn als schnellen Viewer – mit automatischem Wochenwechsel und Rückfall auf rewe.de.

**Architecture:** Supabase (Frankfurt) hält Prospekte und Seitenbilder; die öffentlichen Seiten lesen per `fetch` mit Cache-Tag beim Vorrendern und bleiben statisch (ISR, stündlich). Das Cockpit liegt im selben Next.js-Projekt unter `/cockpit` (eigene Layouts, `proxy.ts` für die Sitzung); das PDF wird im Browser des Redakteurs mit pdf.js in Seitenbilder umgewandelt und direkt nach Supabase Storage geladen. Besucher laden die Bilder über die eigene Domain (`/prospekt-bilder/*` → Rewrite).

**Tech Stack:** Next.js 16.3.8 (App Router, Turbopack, `proxy.ts`), React 19.2, Tailwind 4, Supabase (`@supabase/supabase-js` 2.117.2, `@supabase/ssr` 0.12.7), pdfjs-dist 6.4.299 (Apache-2.0), PhotoSwipe 5.4.4 (MIT), Vitest 5, puppeteer-core + @axe-core/puppeteer (E2E).

**Spec:** `docs/superpowers/specs/2026-10-05-markt-cockpit-design.md` (Abschnitte 1–3, 6, 8–10)

## Global Constraints

- Öffentliche Seiten laden nichts von Drittanbietern: Prospektbilder nur über `/prospekt-bilder/*` (eigene Domain).
- WCAG 2.2 AA; axe ohne Befund auf allen öffentlichen Seiten und im Cockpit (Desktop 1280 px und Mobil 390 px).
- Öffentliche Seiten bleiben vorgerendert (`revalidate = 3600`); ist Supabase beim Build nicht erreichbar, bricht der Build ab.
- Sprache im Cockpit und auf der Website: Deutsch, „du“.
- Supabase-Region `eu-central-1`; in Stufe 1/2 wird kein Secret Key gebraucht – nie in den Browser.
- PDF höchstens 60 MB und 80 Seiten; Seitenbild 1800 px breit, Vorschaubild 480 px; WebP, wo der Browser es erzeugen kann, sonst JPEG.
- Vor dem Veröffentlichen zeigt das Cockpit eine Vorschau der hochgeladenen Seiten (Spec Abschnitt 3, Schritt 4).
- Prospekte, deren Woche länger als vier Wochen vorbei ist, und Entwürfe älter als ein Tag werden beim nächsten Veröffentlichen gelöscht (Zeilen und Bilder).
- Commits mit `git -c user.name=Claude -c user.email=noreply@anthropic.com commit`; nach `main` nur mit Freigabe der Agentur.
- Vorhandene Muster beibehalten: Kommentare auf Deutsch, Tailwind-Tokens aus `app/globals.css`, Komponenten wie `ButtonLink`, `buttonClasses`, `PageHeader`, `.cta-row`.

## Review Focus

- **iPhone/Safari beim Hochladen:** Safari erzeugt kein WebP → JPEG; Canvas-Flächen müssen nach jeder Seite freigegeben werden, sonst bricht Safari bei 30+ Seiten ab. Test: E2E-Lauf mit erzwungenem JPEG (`?format=jpg`), Bilder im Bucket als `.jpg` (Task 6).
- **Verbindung bricht mitten im Upload ab:** Kein halber Prospekt darf online gehen; „Erneut versuchen“ setzt fort. Test: E2E bricht den Upload von Seite 2 per Request-Interception ab, prüft Meldung, setzt fort, prüft Veröffentlichung mit allen Seiten (Task 6).
- **Gleiche Woche erneut hochladen:** Der alte Prospekt bleibt online, bis der neue vollständig ist; danach genau ein veröffentlichter Prospekt je Woche, alte Bilder weg. Test: E2E lädt dieselbe Woche zweimal hoch und prüft Zeilen und Storage (Task 6).
- **Feiertagswochen und Jahreswechsel:** Ostermontag → gültig ab Dienstag; KW 53/2026 → 28.12.–02.01.; „kw-01“ im Dezember → nächstes Jahr. Test: Unit-Tests (Task 4).
- **Sitzung läuft während des Uploads ab:** klare Meldung „neu anmelden“, kein stiller Fehler. Test: E2E antwortet per Interception mit 401 auf einen Seiten-Upload und prüft die Meldung (Task 6).

---

## Dateistruktur

| Datei | Aufgabe |
|---|---|
| `app/layout.tsx` (ändern) | nur `<html>`, `<body>`, Schrift, `html.js`-Skript, Metadaten-Basis |
| `app/(site)/layout.tsx` (neu) | Kopf, `<main>`, Footer, Schnellzugriff, Reveal, Service Worker, Store-JSON-LD, `revalidate` |
| `app/(site)/…` (verschoben) | alle öffentlichen Seiten (Start, aktuelles, angebote, aushang, datenschutz, impressum, karriere, kontakt, markt, offline) |
| `app/not-found.tsx` (ändern) | 404 mit Kopf und Footer (liegt außerhalb von `(site)`) |
| `public/sw.js` (ändern) | `/cockpit`, `/api`, `/prospekt-bilder` nicht anfassen; `VERSION` → `rr-2` |
| `app/robots.ts` (ändern) | `/cockpit` und `/api` sperren |
| `e2e/lib.mjs`, `e2e/public-qa.mjs` (neu) | Browser-Helfer; Qualitätsprüfung öffentlicher Seiten (axe, 320 px, ohne JS, Drittanbieter) |
| `supabase/migrations/20261005120000_prospekte.sql` (neu) | `editors`, `flyers`, `is_editor()`, Bucket `prospekte`, RLS |
| `lib/supabase/config.ts`, `server.ts`, `browser.ts` (neu) | öffentliche Projektdaten; Clients mit Cookie-Sitzung |
| `proxy.ts` (neu) | Sitzung für `/cockpit/*` auffrischen, ohne Anmeldung umleiten |
| `lib/cockpit/safe-next.ts` (+ Test), `lib/cockpit/auth.ts` (neu) | Ziel nach Anmeldung; `requireEditor()` |
| `app/cockpit/…` (neu) | Cockpit: Root-Layout, Anmeldung, geschützte Gruppe `(intern)` mit Übersicht und Prospekt |
| `components/cockpit/*` (neu) | Rahmen, Navigation, Anmeldeformular, Statuskarte, Upload, Wochenliste |
| `lib/prospekt/week.ts` (+ Test) | Woche aus Dateiname/Datum, Gültigkeit |
| `lib/prospekt/select.ts` (+ Test), `lib/prospekt/urls.ts` | welcher Prospekt wann gezeigt wird; Bildpfade |
| `lib/prospekt/render.ts` | PDF → Seitenbilder im Browser |
| `lib/data/flyers.ts` | öffentliche Prospekte lesen (server-only, Cache-Tag) |
| `components/prospekt/flyer-viewer.tsx` (neu) | Raster, Wochenreiter, PhotoSwipe-Viewer, `?seite=` |
| `app/(site)/angebote/page.tsx`, `app/(site)/page.tsx`, `components/home/flyer-ticket.tsx` (ändern) | Viewer bzw. Titelseite, sonst Rückfall auf rewe.de |
| `next.config.ts` (ändern) | Rewrite `/prospekt-bilder/*`, Cache-Header |

---

### Task 1: Öffentliche Seiten in eine Route-Gruppe, Cockpit-Pfade ausnehmen, Prüfskripte

**Files:**
- Modify: `app/layout.tsx`, `app/not-found.tsx`, `public/sw.js`, `app/robots.ts`, `README.md`, `docs/BETREIBER-CHECKLISTE.md`, `package.json`
- Create: `app/(site)/layout.tsx`, `e2e/lib.mjs`, `e2e/public-qa.mjs`
- Move: `app/page.tsx`, `app/{aktuelles,angebote,aushang,datenschutz,impressum,karriere,kontakt,markt,offline}` → `app/(site)/`

**Interfaces:**
- Produces: `app/(site)/layout.tsx` als Rahmen aller öffentlichen Seiten; `app/layout.tsx` ohne Website-Chrome; `e2e/lib.mjs` mit `BASE`, `browser()`, `login(page, email?, password?)`, `check(cond, msg)`.

- [ ] **Step 1: Prüfwerkzeuge und Grundlauf**

```bash
cd ~/Documents/Chourol/02-Projeler/musteri/rewe-roedelheim/REWEROE-main
npm install -D puppeteer-core @axe-core/puppeteer
mkdir -p e2e
```

`e2e/lib.mjs`:

```js
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
  await page.goto(`${BASE}/cockpit/anmelden`, { waitUntil: "networkidle0" });
  await page.type('input[name="email"]', email);
  await page.type('input[name="passwort"]', password);
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }).catch(() => {}), page.click('button[type="submit"]')]);
}

export function check(cond, msg) {
  if (!cond) throw new Error(`✗ ${msg}`);
  console.log(`✓ ${msg}`);
}
```

`e2e/public-qa.mjs`:

```js
// node e2e/public-qa.mjs [/pfad …] – axe (Desktop + Mobil), Überlauf bei 320 px, Inhalt ohne JS, keine Drittanbieter.
import { createRequire } from "node:module";
import { BASE, browser, check } from "./lib.mjs";
const require = createRequire(import.meta.url);
const { AxePuppeteer } = require("@axe-core/puppeteer");

const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/", "/angebote", "/markt", "/aktuelles", "/karriere", "/karriere/bewerben", "/kontakt", "/impressum", "/datenschutz", "/gibts-nicht"];
const local = new Set(["localhost", "127.0.0.1"]);
const b = await browser();
for (const path of paths) {
  for (const vp of [{ width: 1280, height: 800 }, { width: 390, height: 844, isMobile: true, hasTouch: true }]) {
    const p = await b.newPage();
    const third = new Set();
    p.on("request", (r) => { const u = new URL(r.url()); if (!local.has(u.hostname) && u.protocol.startsWith("http")) third.add(u.hostname); });
    await p.setViewport(vp);
    await p.goto(BASE + path, { waitUntil: "load" });
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 350) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } await new Promise((r) => setTimeout(r, 900)); });
    const res = await new AxePuppeteer(p).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    check(res.violations.length === 0, `${path} ${vp.width}px axe ${res.violations.map((v) => `${v.id}(${v.nodes.length})`).join(" ") || "0"}`);
    check(third.size === 0, `${path} ${vp.width}px Drittanbieter ${[...third].join(",") || "keine"}`);
    await p.close();
  }
  const narrow = await b.newPage();
  await narrow.setViewport({ width: 320, height: 640, isMobile: true, hasTouch: true });
  await narrow.goto(BASE + path, { waitUntil: "load" });
  check(await narrow.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} kein Überlauf bei 320 px`);
  await narrow.close();
  const nojs = await b.newPage();
  await nojs.setJavaScriptEnabled(false);
  await nojs.goto(BASE + path, { waitUntil: "load" });
  check(await nojs.evaluate(() => Boolean(document.querySelector("h1")) && [...document.querySelectorAll(".reveal")].every((e) => getComputedStyle(e).opacity !== "0")), `${path} ohne JS lesbar`);
  await nojs.close();
}
await b.close();
```

Grundlauf vor dem Umbau (Vergleichswert):

```bash
npm run build && (npx next start -p 3100 > /tmp/rr-start.log 2>&1 &) ; sleep 4
node e2e/public-qa.mjs / /angebote /gibts-nicht
```

Expected: alle `✓` (Stand `feinschliff-v5`).

- [ ] **Step 2: Seiten verschieben**

```bash
pkill -f "next start -p 3100"
mkdir -p "app/(site)"
git mv app/page.tsx "app/(site)/page.tsx"
for d in aktuelles angebote aushang datenschutz impressum karriere kontakt markt offline; do git mv "app/$d" "app/(site)/$d"; done
ls app "app/(site)"
```

Expected: `app/` enthält noch `layout.tsx`, `not-found.tsx`, `global-error.tsx`, `globals.css`, `fonts.ts`, Icons, `manifest.ts`, `robots.ts`, `sitemap.ts`, `kalender.ics/`, `og/`.

- [ ] **Step 3: Root-Layout verschlanken**

In `app/layout.tsx` die Imports von `MobileBar`, `RevealObserver`, `ServiceWorker`, `SiteFooter`, `SiteHeader`, `ldScript`, `storeJsonLd` und das `export const revalidate` (samt Kommentar) entfernen. `metadata` und `viewport` bleiben. Die Komponente wird zu:

```tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={display.variable} suppressHydrationWarning>
      <body>
        {/* Vor dem ersten Paint: Einblend-Animationen nur mit JS (siehe .reveal in globals.css) */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Website-Layout anlegen**

`app/(site)/layout.tsx`:

```tsx
import { MobileBar } from "@/components/layout/mobile-bar";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { ServiceWorker } from "@/components/pwa/service-worker";
import { ldScript, storeJsonLd } from "@/lib/jsonld";

/** Stündlich neu bauen: Prospektwoche, Feiertage im JSON-LD und Jahreszahl bleiben aktuell. */
export const revalidate = 3600;

/** Rahmen aller öffentlichen Seiten. Das Cockpit (app/cockpit) hat einen eigenen. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter />
      <MobileBar />
      <RevealObserver />
      <ServiceWorker />
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(storeJsonLd())} />
    </>
  );
}
```

- [ ] **Step 5: 404 mit Kopf und Footer**

`app/not-found.tsx` liegt außerhalb von `(site)` und rendert den Rahmen selbst. Zwei Imports ergänzen:

```tsx
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
```

und im `return` den bestehenden Block `<div className="wrap grid min-h-[70svh] content-center py-20">…</div>` unverändert in diese Hülle setzen:

```tsx
    <>
      <SiteHeader />
      <main id="inhalt" tabIndex={-1} className="outline-none">
        <div className="wrap grid min-h-[70svh] content-center py-20">{/* … bestehender Inhalt … */}</div>
      </main>
      <SiteFooter />
    </>
```

- [ ] **Step 6: Service Worker, robots.txt, Doku-Pfade**

`public/sw.js`: `const VERSION = "rr-1";` → `const VERSION = "rr-2";`; im Kopfkommentar „Nicht angefasst: Videos (Range-Anfragen), Kalender, Formulare, Daten für Seitenwechsel.“ → „Nicht angefasst: Videos (Range-Anfragen), Kalender, Formulare, Daten für Seitenwechsel, Cockpit, API, Prospektbilder.“; im `fetch`-Handler direkt nach `if (url.origin !== self.location.origin) return;`:

```js
  // Angemeldete Cockpit-Seiten nie zwischenspeichern; Prospektbilder sind groß und wechseln wöchentlich.
  if (/^\/(cockpit|api|prospekt-bilder)(\/|$)/.test(url.pathname)) return;
```

`app/robots.ts`, indexierbarer Zweig:

```ts
  return { rules: { userAgent: "*", allow: "/", disallow: ["/cockpit", "/api"] }, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
```

Pfade in der Doku nachziehen:

```bash
for f in README.md docs/BETREIBER-CHECKLISTE.md; do
  sed -i '' -E 's#`app/(page\.tsx|aktuelles|angebote|aushang|datenschutz|impressum|karriere|kontakt|markt|offline)#`app/(site)/\1#g' "$f"
done
git diff --stat README.md docs/BETREIBER-CHECKLISTE.md
```

- [ ] **Step 7: Prüfen**

```bash
npx tsc --noEmit -p . && npm run lint && npm test && npm run build 2>&1 | grep -E "rror|Route|○|●|ƒ" | head -40
(npx next start -p 3100 > /tmp/rr-start.log 2>&1 &) ; sleep 4
node e2e/public-qa.mjs / /angebote /gibts-nicht
curl -s localhost:3100/gibts-nicht | grep -c 'aria-label="Hauptnavigation"'
```

Expected: keine Fehler; dieselben Routen wie vorher (ohne `(site)` im Pfad); alle `✓`; die 404-Seite enthält die Hauptnavigation (Zählung ≥ 1).

- [ ] **Step 8: Commit**

```bash
pkill -f "next start -p 3100"
git add -A
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Öffentliche Seiten in Route-Gruppe (site); Root-Layout ohne Website-Rahmen; SW lässt /cockpit aus; E2E-Prüfskripte"
```

---

### Task 2: Supabase-Projekt, Schema, Test-Editor

**Files:**
- Create: `supabase/migrations/20261005120000_prospekte.sql`, `lib/supabase/config.ts`, `e2e/rls-check.mjs`, `.env.example`, `.env.local` (nicht im Repo)
- Modify: `package.json`

**Interfaces:**
- Produces: Tabellen `public.editors(user_id, name, created_at)`, `public.flyers(id, week_start, kw, year, valid_from, valid_to, page_count, page_width, page_height, format, source_name, status, created_by, created_at)`; Funktion `public.is_editor()`; Bucket `prospekte`; `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` aus `lib/supabase/config.ts`.

- [ ] **Step 1: Projekt anlegen (Supabase MCP)**

`get_cost` (type `project`, organization_id `trsoumflcwfazagaqrcu`) → `confirm_cost` → `create_project` mit `name: "rewe-roedelheim"`, `region: "eu-central-1"`, `organization_id: "trsoumflcwfazagaqrcu"`. Mit `get_project` warten, bis der Status `ACTIVE_HEALTHY` ist; Ref notieren.

Manueller Schritt der Agentur (im README in Task 8 dokumentiert): Supabase-Dashboard → Authentication → Sign In / Providers → „Allow new users to sign up“ ausschalten. (Auch mit Registrierung käme niemand ohne Eintrag in `editors` an Daten – RLS – aber Konten sollen nur über die Agentur entstehen.)

- [ ] **Step 2: Migration schreiben**

`supabase/migrations/20261005120000_prospekte.sql`:

```sql
-- Markt-Cockpit, Stufe 1/2: Editoren und Wochenprospekte (Spec 2026-10-05, Abschnitte 1 und 3)

create table public.editors (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  created_at timestamptz not null default now()
);
alter table public.editors enable row level security;

-- In Richtlinien genutzt; security definer, damit die Prüfung nicht selbst an RLS scheitert.
create or replace function public.is_editor() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.editors e where e.user_id = (select auth.uid()));
$$;
revoke all on function public.is_editor() from public;
grant execute on function public.is_editor() to anon, authenticated;

create policy "Editoren sehen Editoren" on public.editors
  for select to authenticated using (public.is_editor());

create table public.flyers (
  id uuid primary key default gen_random_uuid(),
  week_start date not null check (extract(isodow from week_start) = 1),
  kw smallint not null check (kw between 1 and 53),
  year smallint not null check (year between 2024 and 2100),
  valid_from date not null,
  valid_to date not null check (valid_to >= valid_from),
  page_count smallint not null default 0 check (page_count between 0 and 80),
  page_width smallint not null default 0 check (page_width between 0 and 4000),
  page_height smallint not null default 0 check (page_height between 0 and 6000),
  format text not null default 'webp' check (format in ('webp', 'jpg')),
  source_name text not null default '' check (char_length(source_name) <= 200),
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_by uuid default auth.uid() references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);
-- Höchstens ein veröffentlichter Prospekt je Woche; Entwürfe (Ersatz während des Hochladens) daneben erlaubt.
create unique index flyers_one_published_per_week on public.flyers (week_start) where status = 'published';
create index flyers_week on public.flyers (week_start);
alter table public.flyers enable row level security;

create policy "Veröffentlichte Prospekte sind öffentlich" on public.flyers
  for select to anon, authenticated using (status = 'published' or public.is_editor());
create policy "Editoren legen Prospekte an" on public.flyers
  for insert to authenticated with check (public.is_editor());
create policy "Editoren ändern Prospekte" on public.flyers
  for update to authenticated using (public.is_editor()) with check (public.is_editor());
create policy "Editoren löschen Prospekte" on public.flyers
  for delete to authenticated using (public.is_editor());

-- Seitenbilder: öffentlich lesbar über die öffentliche URL, schreiben nur Editoren. 5 MB je Bild reichen (1800 px).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('prospekte', 'prospekte', true, 5242880, array['image/webp', 'image/jpeg']);

create policy "Editoren sehen Prospektbilder" on storage.objects
  for select to authenticated using (bucket_id = 'prospekte' and public.is_editor());
create policy "Editoren laden Prospektbilder hoch" on storage.objects
  for insert to authenticated with check (bucket_id = 'prospekte' and public.is_editor());
create policy "Editoren ersetzen Prospektbilder" on storage.objects
  for update to authenticated using (bucket_id = 'prospekte' and public.is_editor());
create policy "Editoren löschen Prospektbilder" on storage.objects
  for delete to authenticated using (bucket_id = 'prospekte' and public.is_editor());
```

- [ ] **Step 3: Migration anwenden und prüfen**

Supabase MCP `apply_migration` (project_id = Ref, name `prospekte`, query = Dateiinhalt). Danach `get_advisors` (type `security`). Expected: keine Warnung zu `editors`, `flyers`, `is_editor` (RLS aktiv, `search_path` gesetzt).

- [ ] **Step 4: Test-Editor anlegen (nur Entwicklung)**

Passwort lokal erzeugen und in `.env.local` schreiben (nie ins Repo, nie in den Chat):

```bash
PW=$(openssl rand -base64 24 | tr -d '/+=' | cut -c1-24)
printf 'E2E_EMAIL=e2e-editor@chourol.invalid\nE2E_PASSWORD=%s\n' "$PW" >> .env.local
```

Supabase MCP `execute_sql` – `<PASSWORT>` beim Ausführen durch den Wert aus `.env.local` ersetzen (nicht ausgeben):

```sql
with u as (
  insert into auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
  values ('00000000-0000-0000-0000-000000000000', gen_random_uuid(), 'authenticated', 'authenticated', 'e2e-editor@chourol.invalid',
    crypt('<PASSWORT>', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '')
  returning id
), i as (
  insert into auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
  select gen_random_uuid(), u.id, json_build_object('sub', u.id::text, 'email', 'e2e-editor@chourol.invalid'), 'email', u.id::text, now(), now(), now() from u
)
insert into public.editors (user_id, name) select id, 'Test-Editor' from u;
```

- [ ] **Step 5: Abhängigkeiten und Konfiguration**

```bash
npm install @supabase/supabase-js@2.117.2 @supabase/ssr@0.12.7 pdfjs-dist@6.4.299 photoswipe@5.4.4
```

Supabase MCP `get_project_url` und `get_publishable_keys` (den Schlüssel mit Präfix `sb_publishable_` nehmen). `lib/supabase/config.ts` – die beiden Platzhalter in spitzen Klammern durch diese Werte ersetzen:

```ts
/**
 * Öffentliche Supabase-Daten (Projekt rewe-roedelheim, Frankfurt). Der Publishable Key darf im Browser stehen –
 * Lesen und Schreiben regeln die RLS-Richtlinien (supabase/migrations). Umgebungsvariablen überschreiben beides.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://<ref>.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "<sb_publishable_…>";
```

`.env.example` (im Repo; `.env*` ist ignoriert – deshalb mit `git add -f`):

```bash
# Supabase (öffentlich; Standardwerte stehen in lib/supabase/config.ts)
# NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
# NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
# Nur lokal für die E2E-Tests (Test-Editor, siehe docs/superpowers/plans/2026-10-05-cockpit-prospekt.md, Task 2)
# E2E_EMAIL=
# E2E_PASSWORD=
```

- [ ] **Step 6: RLS-Prüfskript schreiben**

`e2e/rls-check.mjs`:

```js
// node --env-file=.env.local e2e/rls-check.mjs → Gäste lesen nur Veröffentlichtes, Editoren schreiben.
import { createClient } from "@supabase/supabase-js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const cfg = readFileSync(new URL("../lib/supabase/config.ts", import.meta.url), "utf8");
const pick = (name) => process.env[`NEXT_PUBLIC_${name}`] || cfg.match(new RegExp(`${name} = [^"]*"([^"]+)"`))[1];
const url = pick("SUPABASE_URL");
const key = pick("SUPABASE_PUBLISHABLE_KEY");

const guest = createClient(url, key, { auth: { persistSession: false } });
const week = "2031-01-06"; // Montag weit in der Zukunft, kollidiert mit keinem echten Prospekt
const row = { week_start: week, kw: 2, year: 2031, valid_from: week, valid_to: "2031-01-11" };

assert.ok((await guest.from("flyers").insert(row)).error, "Gast darf keinen Prospekt anlegen");
assert.ok((await guest.storage.from("prospekte").upload("rls-test/1.webp", new Blob(["x"], { type: "image/webp" }))).error, "Gast darf keine Bilder hochladen");
assert.deepEqual((await guest.from("editors").select("*")).data ?? [], [], "Gast sieht keine Editoren");

const editor = createClient(url, key, { auth: { persistSession: false } });
assert.ifError((await editor.auth.signInWithPassword({ email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD })).error);
const draft = await editor.from("flyers").insert(row).select("id").single();
assert.ifError(draft.error);
assert.deepEqual((await guest.from("flyers").select("id").eq("id", draft.data.id)).data, [], "Gast sieht keine Entwürfe");
assert.ifError((await editor.from("flyers").delete().eq("id", draft.data.id)).error);
console.log("✓ RLS: Gast liest nur Veröffentlichtes, Editor schreibt.");
```

- [ ] **Step 7: Prüfskript laufen lassen**

```bash
node --env-file=.env.local e2e/rls-check.mjs
```

Expected: `✓ RLS: Gast liest nur Veröffentlichtes, Editor schreibt.`

- [ ] **Step 8: Commit**

```bash
git add supabase lib/supabase/config.ts e2e/rls-check.mjs package.json package-lock.json
git add -f .env.example
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Supabase: Editoren, Prospekte, Bucket mit RLS; öffentliche Konfiguration; RLS-Prüfung"
```

---

### Task 3: Anmeldung, Sitzung und Cockpit-Rahmen

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/browser.ts`, `proxy.ts`, `lib/cockpit/safe-next.ts`, `lib/cockpit/safe-next.test.ts`, `lib/cockpit/auth.ts`, `app/cockpit/layout.tsx`, `app/cockpit/anmelden/page.tsx`, `app/cockpit/anmelden/actions.ts`, `components/cockpit/login-form.tsx`, `components/cockpit/nav-items.ts`, `components/cockpit/cockpit-nav.tsx`, `components/cockpit/cockpit-shell.tsx`, `app/cockpit/(intern)/layout.tsx`, `app/cockpit/(intern)/page.tsx`, `e2e/cockpit-login.mjs`

**Interfaces:**
- Consumes: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (Task 2); `BASE`, `browser`, `login`, `check` (Task 1).
- Produces: `supabaseServer(): Promise<SupabaseClient>`, `supabaseBrowser(): SupabaseClient`, `requireEditor(): Promise<{ editor: Editor; supabase: SupabaseClient }>` mit `Editor = { id: string; name: string; email: string }`, `safeNext(value: unknown): string`, `COCKPIT_NAV` (Liste `{ href, label, icon }`), `<CockpitShell editorName>`; Routen `/cockpit` und `/cockpit/anmelden`.

- [ ] **Step 1: Test für safeNext schreiben**

`lib/cockpit/safe-next.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { safeNext } from "./safe-next";

describe("safeNext", () => {
  it("lässt Cockpit-Pfade durch", () => {
    expect(safeNext("/cockpit")).toBe("/cockpit");
    expect(safeNext("/cockpit/prospekt")).toBe("/cockpit/prospekt");
    expect(safeNext("/cockpit/prospekt?woche=2026-10-12")).toBe("/cockpit/prospekt?woche=2026-10-12");
  });
  it("verhindert offene Weiterleitungen", () => {
    expect(safeNext("https://evil.example/cockpit")).toBe("/cockpit");
    expect(safeNext("//evil.example")).toBe("/cockpit");
    expect(safeNext("/cockpit/../angebote")).toBe("/cockpit");
    expect(safeNext("/cockpitx")).toBe("/cockpit");
    expect(safeNext("/angebote")).toBe("/cockpit");
    expect(safeNext(null)).toBe("/cockpit");
    expect(safeNext(42)).toBe("/cockpit");
  });
});
```

- [ ] **Step 2: Test laufen lassen – muss scheitern**

Run: `npx vitest run lib/cockpit/safe-next.test.ts`
Expected: FAIL („Failed to resolve import "./safe-next"“)

- [ ] **Step 3: safeNext umsetzen**

`lib/cockpit/safe-next.ts`:

```ts
/** Ziel nach der Anmeldung: nur Pfade im Cockpit, ohne „..“ und ohne fremde Hosts (kein offener Redirect). */
export function safeNext(value: unknown): string {
  if (typeof value !== "string") return "/cockpit";
  if (!/^\/cockpit(\/[A-Za-z0-9\-/]*)?(\?[A-Za-z0-9\-=&%.]*)?$/.test(value) || value.includes("..")) return "/cockpit";
  return value;
}
```

- [ ] **Step 4: Test laufen lassen – muss bestehen**

Run: `npx vitest run lib/cockpit/safe-next.test.ts`
Expected: PASS (2 Tests)

- [ ] **Step 5: Supabase-Clients**

`lib/supabase/server.ts`:

```ts
import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

/** Supabase mit der Sitzung aus den Cookies (Server Components, Server Actions). */
export async function supabaseServer() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // In Server Components nicht erlaubt – proxy.ts frischt die Sitzung dort auf.
        }
      },
    },
  });
}
```

`lib/supabase/browser.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./config";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Supabase im Browser (Cockpit-Uploads) mit derselben Cookie-Sitzung wie der Server. */
export function supabaseBrowser() {
  client ??= createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return client;
}
```

- [ ] **Step 6: proxy.ts**

`proxy.ts` (Projektwurzel):

```ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./lib/supabase/config";

/** Nur das Cockpit: Sitzung auffrischen; ohne Anmeldung zur Anmeldeseite (mit Rücksprung). */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims && request.nextUrl.pathname !== "/cockpit/anmelden") {
    const login = request.nextUrl.clone();
    login.pathname = "/cockpit/anmelden";
    login.search = `?weiter=${encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search)}`;
    return NextResponse.redirect(login);
  }
  return response;
}

export const config = { matcher: ["/cockpit/:path*"] };
```

- [ ] **Step 7: requireEditor**

`lib/cockpit/auth.ts`:

```ts
import "server-only";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase/server";

export interface Editor {
  id: string;
  name: string;
  email: string;
}

/** Für jede Cockpit-Seite und jede Server Action: angemeldeter Editor, sonst zur Anmeldung. */
export async function requireEditor() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) redirect("/cockpit/anmelden");
  const { data: row } = await supabase.from("editors").select("name").eq("user_id", claims.sub).maybeSingle();
  if (!row) redirect("/cockpit/anmelden?fehler=keine-berechtigung");
  const editor: Editor = { id: claims.sub, name: row.name, email: String(claims.email ?? "") };
  return { editor, supabase };
}
```

- [ ] **Step 8: Anmeldung (Layout, Actions, Formular, Seite)**

`app/cockpit/layout.tsx`:

```tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Markt-Cockpit", template: "%s · Markt-Cockpit" },
  robots: { index: false, follow: false },
};

/** Cockpit: eigener ruhiger Hintergrund, kein Website-Kopf und kein Footer. */
export default function CockpitRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] bg-soft text-ink">{children}</div>;
}
```

`app/cockpit/anmelden/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { safeNext } from "@/lib/cockpit/safe-next";
import { supabaseServer } from "@/lib/supabase/server";

export interface SignInState {
  error?: string;
}

export async function signIn(_prev: SignInState, formData: FormData): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("passwort") ?? "");
  if (!email || !password) return { error: "Bitte E-Mail und Passwort eingeben." };
  const supabase = await supabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-Mail oder Passwort stimmt nicht." };
  redirect(safeNext(formData.get("weiter")));
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/cockpit/anmelden");
}
```

`components/cockpit/login-form.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/cockpit/anmelden/actions";
import { buttonClasses } from "@/components/ui/button";

const field = "mt-2 block h-13 w-full rounded-2xl bg-white px-4 text-base ring-1 ring-line outline-none focus-visible:ring-2 focus-visible:ring-ink";

export function LoginForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, {});
  const error = state.error ?? notice;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="weiter" value={next} />
      <label className="font-semibold">
        E-Mail
        <input name="email" type="email" autoComplete="username" required className={field} />
      </label>
      <label className="font-semibold">
        Passwort
        <input name="passwort" type="password" autoComplete="current-password" required className={field} />
      </label>
      {error && (
        <p role="alert" className="rounded-2xl bg-red-tint px-4 py-3 font-semibold text-red-deep">
          {error}
        </p>
      )}
      <button type="submit" disabled={pending} className={buttonClasses("red", "lg")}>
        {pending ? "Anmelden …" : "Anmelden"}
      </button>
    </form>
  );
}
```

`app/cockpit/anmelden/page.tsx`:

```tsx
import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { LoginForm } from "@/components/cockpit/login-form";
import { safeNext } from "@/lib/cockpit/safe-next";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({ searchParams }: PageProps<"/cockpit/anmelden">) {
  const params = await searchParams;
  const notice = params.fehler === "keine-berechtigung" ? "Dieses Konto hat keinen Zugang zum Cockpit." : undefined;
  return (
    <main className="mx-auto grid min-h-[100dvh] w-full max-w-md content-center px-4 py-12">
      <LogoMark height={36} />
      <h1 className="mt-8 text-h2">Markt-Cockpit</h1>
      <p className="mt-3 text-lede text-muted">Melde dich mit deiner E-Mail-Adresse an.</p>
      <div className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <LoginForm next={safeNext(params.weiter)} notice={notice} />
      </div>
      <p className="mt-6 text-[0.9375rem] text-muted">Passwort vergessen? Melde dich bei deiner Agentur.</p>
    </main>
  );
}
```

- [ ] **Step 9: Geschützter Rahmen und Übersicht (Gerüst)**

`components/cockpit/nav-items.ts`:

```ts
import { LayoutDashboard, Newspaper } from "lucide-react";

/** Navigation des Cockpits; spätere Stufen ergänzen Feedback und Inhalte. */
export const COCKPIT_NAV = [
  { href: "/cockpit", label: "Übersicht", icon: LayoutDashboard },
  { href: "/cockpit/prospekt", label: "Prospekt", icon: Newspaper },
] as const;
```

`components/cockpit/cockpit-nav.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { COCKPIT_NAV } from "./nav-items";

/** Mobil feste Leiste unten, ab 1024 px senkrecht im Seitenkopf. */
export function CockpitNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Cockpit" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] lg:static lg:border-0 lg:pb-0">
      <ul className="grid grid-cols-2 lg:grid-cols-1 lg:gap-1">
        {COCKPIT_NAV.map(({ href, label, icon: Icon }) => {
          const active = href === "/cockpit" ? pathname === "/cockpit" : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-14 flex-col items-center justify-center gap-1 text-[0.8125rem] font-semibold lg:min-h-11 lg:flex-row lg:justify-start lg:gap-3 lg:rounded-full lg:px-3 lg:text-[0.9375rem]",
                  active ? "text-red lg:bg-red-tint" : "text-ink-2 hover:bg-soft",
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

`components/cockpit/cockpit-shell.tsx`:

```tsx
import Link from "next/link";
import { ExternalLink, LogOut } from "lucide-react";
import { signOut } from "@/app/cockpit/anmelden/actions";
import { LogoMark } from "@/components/brand/logo";
import { CockpitNav } from "./cockpit-nav";

/** Rahmen des Cockpits: Kopf mit Name und Abmelden, Navigation unten (Handy) bzw. links (Desktop). */
export function CockpitShell({ editorName, children }: { editorName: string; children: React.ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-[100dvh] lg:grid-cols-[15rem_1fr]">
      <header className="flex items-center justify-between gap-4 bg-white px-4 py-3 shadow-[0_1px_0_var(--color-line)] lg:flex-col lg:items-stretch lg:justify-start lg:gap-8 lg:p-6 lg:shadow-[1px_0_0_var(--color-line)]">
        <Link href="/cockpit" className="flex min-h-11 items-center gap-3 font-display text-[1.125rem] font-bold">
          <LogoMark height={24} />
          Cockpit
        </Link>
        <CockpitNav />
        <div className="flex items-center gap-2 lg:mt-auto lg:flex-col lg:items-stretch">
          <p className="hidden text-[0.875rem] text-muted lg:block">Angemeldet als {editorName}</p>
          <a href="/" target="_blank" rel="noopener" className="hidden min-h-11 items-center gap-2 rounded-full px-3 text-[0.9375rem] font-semibold hover:bg-soft lg:inline-flex">
            <ExternalLink className="size-4" aria-hidden /> Zur Website<span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
          <form action={signOut}>
            <button type="submit" data-action="logout" className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-[0.9375rem] font-semibold hover:bg-soft">
              <LogOut className="size-4" aria-hidden /> Abmelden
            </button>
          </form>
        </div>
      </header>
      <main id="inhalt" className="mx-auto w-full max-w-4xl px-4 pt-6 pb-28 lg:px-10 lg:pt-10 lg:pb-16">
        {children}
      </main>
    </div>
  );
}
```

`app/cockpit/(intern)/layout.tsx`:

```tsx
import { CockpitShell } from "@/components/cockpit/cockpit-shell";
import { requireEditor } from "@/lib/cockpit/auth";

/** Alles hinter der Anmeldung. Zusätzlich prüft jede Server Action selbst über requireEditor. */
export default async function InternLayout({ children }: { children: React.ReactNode }) {
  const { editor } = await requireEditor();
  return <CockpitShell editorName={editor.name}>{children}</CockpitShell>;
}
```

`app/cockpit/(intern)/page.tsx` (Gerüst; Task 6 ergänzt die Prospekt-Karte):

```tsx
import type { Metadata } from "next";
import { requireEditor } from "@/lib/cockpit/auth";

export const metadata: Metadata = { title: "Übersicht" };

export default async function UebersichtPage() {
  const { editor } = await requireEditor();
  return (
    <>
      <p className="text-eyebrow text-red">Markt-Cockpit</p>
      <h1 className="mt-2 text-h2">Hallo, {editor.name}.</h1>
    </>
  );
}
```

- [ ] **Step 10: E2E-Anmeldetest**

`e2e/cockpit-login.mjs`:

```js
// node --env-file=.env.local e2e/cockpit-login.mjs (Server muss laufen, siehe E2E_BASE)
import { BASE, browser, check, login } from "./lib.mjs";

const b = await browser();
const page = await b.newPage();

await page.goto(`${BASE}/cockpit/prospekt`, { waitUntil: "networkidle0" });
check(page.url().startsWith(`${BASE}/cockpit/anmelden?weiter=%2Fcockpit%2Fprospekt`), "ohne Anmeldung → Anmeldeseite mit Rücksprung");

await login(page, process.env.E2E_EMAIL, "falsch-falsch-falsch");
await page.waitForSelector('[role="alert"]');
check((await page.$eval('[role="alert"]', (e) => e.textContent)).includes("stimmt nicht"), "falsches Passwort → Meldung");

await login(page);
check(new URL(page.url()).pathname === "/cockpit", "richtiges Passwort → Übersicht");
check(await page.$eval("h1", (e) => e.textContent.includes("Hallo")), "Begrüßung sichtbar");

await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click('[data-action="logout"]')]);
check(new URL(page.url()).pathname === "/cockpit/anmelden", "Abmelden → Anmeldeseite");
await b.close();
```

- [ ] **Step 11: Prüfen**

```bash
npx tsc --noEmit -p . && npm run lint && npm test
npm run build 2>&1 | grep -E "rror|cockpit"
(npx next start -p 3100 > /tmp/rr-start.log 2>&1 &) ; sleep 4
node --env-file=.env.local e2e/cockpit-login.mjs
```

Expected: alle `✓`; `/cockpit` und `/cockpit/anmelden` sind dynamisch (ƒ), öffentliche Seiten weiter ○/●.

- [ ] **Step 12: Commit**

```bash
pkill -f "next start -p 3100"
git add -A
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Cockpit: Anmeldung mit Supabase, proxy.ts, Rahmen und Übersicht"
```

---

### Task 4: Woche eines Uploads bestimmen

**Files:**
- Create: `lib/prospekt/week.ts`, `lib/prospekt/week.test.ts`

**Interfaces:**
- Consumes: `flyerWeek`, `isoWeek` (`lib/flyer.ts`), `addDays`, `berlinNow`, `weekdayOf` (`lib/hours.ts`).
- Produces:
  - `type UploadWeek = { kw: number; year: number; weekStart: string; validFrom: string; validTo: string; range: string }`
  - `mondayOfIsoWeek(kw: number, year: number): string`
  - `uploadWeek(weekStart: string): UploadWeek`
  - `weekFromFilename(name: string, now: Date): { kw: number; year: number } | null`
  - `defaultUploadWeekStart(now: Date): string`
  - `suggestUploadWeek(filename: string, now: Date): UploadWeek`
  - `uploadWeekChoices(now: Date): UploadWeek[]` (laufende Woche + drei folgende)

- [ ] **Step 1: Tests schreiben**

`lib/prospekt/week.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { defaultUploadWeekStart, mondayOfIsoWeek, suggestUploadWeek, uploadWeek, uploadWeekChoices, weekFromFilename } from "./week";

const at = (iso: string) => new Date(`${iso}T10:00:00Z`);

describe("mondayOfIsoWeek", () => {
  it("rechnet nach ISO 8601", () => {
    expect(mondayOfIsoWeek(41, 2026)).toBe("2026-10-05");
    expect(mondayOfIsoWeek(1, 2026)).toBe("2025-12-29");
    expect(mondayOfIsoWeek(53, 2026)).toBe("2026-12-28");
    expect(mondayOfIsoWeek(1, 2027)).toBe("2027-01-04");
  });
});

describe("uploadWeek", () => {
  it("übernimmt die Gültigkeit aus lib/flyer.ts", () => {
    expect(uploadWeek("2026-10-05")).toEqual({ kw: 41, year: 2026, weekStart: "2026-10-05", validFrom: "2026-10-05", validTo: "2026-10-10", range: "Mo 05.10. – Sa 10.10.2026" });
  });
  it("beginnt nach Ostermontag am Dienstag", () => {
    expect(uploadWeek("2027-03-29")).toMatchObject({ kw: 13, validFrom: "2027-03-30", validTo: "2027-04-03" });
  });
  it("KW 53 über den Jahreswechsel gehört zu 2026", () => {
    expect(uploadWeek("2026-12-28")).toMatchObject({ kw: 53, year: 2026, validTo: "2027-01-02" });
  });
});

describe("weekFromFilename", () => {
  it("liest die REWE-Dateinamen", () => {
    expect(weekFromFilename("KW41_2026_final_proof.pdf", at("2026-10-02"))).toEqual({ kw: 41, year: 2026 });
    expect(weekFromFilename("Prospekt KW 7.pdf", at("2027-02-10"))).toEqual({ kw: 7, year: 2027 });
    expect(weekFromFilename("rewe-kw-42-2026.pdf", at("2026-10-09"))).toEqual({ kw: 42, year: 2026 });
  });
  it("nimmt ohne Jahr das nächstliegende Jahr", () => {
    expect(weekFromFilename("kw-01.pdf", at("2026-12-30"))).toEqual({ kw: 1, year: 2027 });
    expect(weekFromFilename("KW52.pdf", at("2027-01-02"))).toEqual({ kw: 52, year: 2026 });
  });
  it("ignoriert Unsinn", () => {
    expect(weekFromFilename("Angebote.pdf", at("2026-10-02"))).toBeNull();
    expect(weekFromFilename("KW99_2026.pdf", at("2026-10-02"))).toBeNull();
    expect(weekFromFilename("KW53_2027.pdf", at("2027-10-02"))).toBeNull(); // 2027 hat keine KW 53
  });
});

describe("defaultUploadWeekStart", () => {
  it("Do–So → nächste Woche, Mo–Mi → laufende Woche (Berliner Zeit)", () => {
    expect(defaultUploadWeekStart(at("2026-10-06"))).toBe("2026-10-05"); // Di
    expect(defaultUploadWeekStart(at("2026-10-07"))).toBe("2026-10-05"); // Mi
    expect(defaultUploadWeekStart(at("2026-10-08"))).toBe("2026-10-12"); // Do
    expect(defaultUploadWeekStart(at("2026-10-09"))).toBe("2026-10-12"); // Fr
    expect(defaultUploadWeekStart(at("2026-10-11"))).toBe("2026-10-12"); // So
    expect(defaultUploadWeekStart(new Date("2026-10-07T22:30:00Z"))).toBe("2026-10-12"); // Mi 23:30 UTC = Do 00:30 Berlin
  });
});

describe("suggestUploadWeek", () => {
  it("Dateiname vor Wochentag", () => {
    expect(suggestUploadWeek("KW41_2026_final_proof.pdf", at("2026-10-09")).weekStart).toBe("2026-10-05");
    expect(suggestUploadWeek("prospekt.pdf", at("2026-10-09")).weekStart).toBe("2026-10-12");
  });
});

describe("uploadWeekChoices", () => {
  it("laufende Woche und drei folgende", () => {
    expect(uploadWeekChoices(at("2026-10-07")).map((w) => w.kw)).toEqual([41, 42, 43, 44]);
    expect(uploadWeekChoices(at("2026-10-11"))[0].weekStart).toBe("2026-10-05"); // sonntags zuerst noch die laufende Woche
  });
});
```

- [ ] **Step 2: Tests laufen lassen – müssen scheitern**

Run: `npx vitest run lib/prospekt/week.test.ts`
Expected: FAIL („Failed to resolve import "./week"“)

- [ ] **Step 3: Umsetzen**

`lib/prospekt/week.ts`:

```ts
/**
 * Welche Woche ein hochgeladener Prospekt abdeckt. Gültigkeit (Feiertags-Montag → ab Dienstag) kommt aus lib/flyer.ts,
 * damit Website, Markt-Kalender und Cockpit dieselben Daten zeigen.
 */
import { flyerWeek, isoWeek } from "@/lib/flyer";
import { addDays, berlinNow, weekdayOf } from "@/lib/hours";

export interface UploadWeek {
  kw: number;
  /** ISO-Wochenjahr (KW 53/2026 endet im Januar 2027, gehört aber zu 2026) */
  year: number;
  /** Montag der Woche (ISO-Datum) */
  weekStart: string;
  validFrom: string;
  validTo: string;
  /** „Mo 05.10. – Sa 10.10.2026“ */
  range: string;
}

export function mondayOfIsoWeek(kw: number, year: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const offset = (jan4.getUTCDay() + 6) % 7; // 0 = Montag
  return new Date(Date.UTC(year, 0, 4 - offset + (kw - 1) * 7)).toISOString().slice(0, 10);
}

export function uploadWeek(weekStart: string): UploadWeek {
  const w = flyerWeek(new Date(`${addDays(weekStart, 2)}T10:00:00Z`));
  return { kw: w.kw, year: Number(addDays(weekStart, 3).slice(0, 4)), weekStart, validFrom: w.from, validTo: w.to, range: w.range };
}

const mondayOf = (iso: string) => addDays(iso, weekdayOf(iso) === 0 ? -6 : 1 - weekdayOf(iso));

export function weekFromFilename(name: string, now: Date): { kw: number; year: number } | null {
  const m = name.match(/kw[\s_-]?(\d{1,2})(?:[\s_-]+(20\d{2}))?/i);
  if (!m) return null;
  const kw = Number(m[1]);
  if (kw < 1 || kw > 53) return null;
  let year: number;
  if (m[2]) year = Number(m[2]);
  else {
    // ohne Jahr: das Jahr, dessen Woche am nächsten an heute liegt
    const today = berlinNow(now).date;
    const thisYear = Number(today.slice(0, 4));
    const dist = (y: number) => Math.abs(Date.parse(mondayOfIsoWeek(kw, y)) - Date.parse(today));
    year = [thisYear - 1, thisYear, thisYear + 1].reduce((best, y) => (dist(y) < dist(best) ? y : best));
  }
  if (isoWeek(mondayOfIsoWeek(kw, year)) !== kw) return null; // z. B. KW 53 in einem Jahr mit 52 Wochen
  return { kw, year };
}

export function defaultUploadWeekStart(now: Date): string {
  const today = berlinNow(now).date;
  const wd = weekdayOf(today);
  const monday = mondayOf(today);
  return wd === 0 || wd >= 4 ? addDays(monday, 7) : monday;
}

export function suggestUploadWeek(filename: string, now: Date): UploadWeek {
  const fromName = weekFromFilename(filename, now);
  return uploadWeek(fromName ? mondayOfIsoWeek(fromName.kw, fromName.year) : defaultUploadWeekStart(now));
}

export function uploadWeekChoices(now: Date): UploadWeek[] {
  const monday = mondayOf(berlinNow(now).date);
  return [0, 1, 2, 3].map((k) => uploadWeek(addDays(monday, 7 * k)));
}
```

- [ ] **Step 4: Tests laufen lassen – müssen bestehen**

Run: `npx vitest run lib/prospekt/week.test.ts`
Expected: PASS. Bei Abweichungen die Umsetzung korrigieren, nicht die Erwartungswerte – sie stammen aus dem Kalender 2026/2027.

- [ ] **Step 5: Commit**

```bash
git add lib/prospekt/week.ts lib/prospekt/week.test.ts
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Prospekt: Woche aus Dateiname und Datum (ISO-Woche, Feiertage, Jahreswechsel)"
```

---

### Task 5: Welcher Prospekt wann gezeigt wird, Bildpfade, Datenzugriff

**Files:**
- Create: `lib/prospekt/select.ts`, `lib/prospekt/select.test.ts`, `lib/prospekt/urls.ts`, `lib/data/flyers.ts`
- Modify: `next.config.ts`

**Interfaces:**
- Produces:
  - `type FlyerRecord = { id: string; week_start: string; kw: number; year: number; valid_from: string; valid_to: string; page_count: number; page_width: number; page_height: number; format: "webp" | "jpg" }`
  - `pickFlyers(flyers: FlyerRecord[], now: Date): FlyerChoice` mit `FlyerChoice = { current: FlyerRecord | null; next: FlyerRecord | null; defaultTab: "current" | "next" }`
  - `flyerImage(f: Pick<FlyerRecord, "id" | "format">, page: number, size: "full" | "thumb"): string` → `/prospekt-bilder/<id>/[thumb-]<n>.<format>`
  - `flyerObjectPath(id: string, page: number, size: "full" | "thumb", format: "webp" | "jpg"): string` → `<id>/[thumb-]<n>.<format>`
  - `publishedFlyers(): Promise<FlyerRecord[]>` (server-only)

- [ ] **Step 1: Tests schreiben**

`lib/prospekt/select.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pickFlyers, type FlyerRecord } from "./select";
import { flyerImage, flyerObjectPath } from "./urls";

const flyer = (week_start: string): FlyerRecord => ({
  id: `id-${week_start}`, week_start, kw: 0, year: 2026, valid_from: week_start, valid_to: week_start,
  page_count: 3, page_width: 1800, page_height: 2546, format: "webp",
});
const at = (iso: string, hhmm = "10:00") => new Date(`${iso}T${hhmm}:00Z`);
const all = [flyer("2026-09-28"), flyer("2026-10-05"), flyer("2026-10-12")];

describe("pickFlyers", () => {
  it("unter der Woche nur die laufende Woche", () => {
    expect(pickFlyers(all, at("2026-10-07"))).toEqual({ current: all[1], next: null, defaultTab: "current" });
  });
  it("samstags zusätzlich die nächste Woche, vorausgewählt bleibt die laufende", () => {
    expect(pickFlyers(all, at("2026-10-10"))).toEqual({ current: all[1], next: all[2], defaultTab: "current" });
  });
  it("sonntags ist die nächste Woche vorausgewählt", () => {
    expect(pickFlyers(all, at("2026-10-11"))).toEqual({ current: all[1], next: all[2], defaultTab: "next" });
  });
  it("ohne Prospekt der laufenden Woche kein alter Prospekt", () => {
    expect(pickFlyers([flyer("2026-09-28")], at("2026-10-07"))).toEqual({ current: null, next: null, defaultTab: "current" });
  });
  it("sonntags nur die nächste Woche vorhanden", () => {
    expect(pickFlyers([flyer("2026-10-12")], at("2026-10-11"))).toEqual({ current: null, next: flyer("2026-10-12"), defaultTab: "next" });
  });
  it("rechnet in Berliner Zeit (Sa 23:30 UTC = So 01:30)", () => {
    expect(pickFlyers(all, at("2026-10-10", "23:30")).defaultTab).toBe("next");
  });
});

describe("Bildpfade", () => {
  it("öffentlich über die eigene Domain, im Bucket ohne Präfix", () => {
    expect(flyerImage({ id: "abc", format: "jpg" }, 3, "thumb")).toBe("/prospekt-bilder/abc/thumb-3.jpg");
    expect(flyerImage({ id: "abc", format: "webp" }, 1, "full")).toBe("/prospekt-bilder/abc/1.webp");
    expect(flyerObjectPath("abc", 12, "full", "webp")).toBe("abc/12.webp");
  });
});
```

- [ ] **Step 2: Tests laufen lassen – müssen scheitern**

Run: `npx vitest run lib/prospekt/select.test.ts`
Expected: FAIL (Module fehlen)

- [ ] **Step 3: Umsetzen**

`lib/prospekt/select.ts`:

```ts
/**
 * Welche Prospekte die Website zeigt (Berliner Zeit), Spec Abschnitt 3:
 * „Diese Woche“ = Prospekt der laufenden Woche (Mo–So); „Nächste Woche“ ab Samstag, sonntags vorausgewählt.
 * Ein älterer Prospekt wird nie gezeigt – dann fällt die Seite auf den Link zu rewe.de zurück.
 */
import { addDays, berlinNow, weekdayOf } from "@/lib/hours";

export interface FlyerRecord {
  id: string;
  week_start: string;
  kw: number;
  year: number;
  valid_from: string;
  valid_to: string;
  page_count: number;
  page_width: number;
  page_height: number;
  format: "webp" | "jpg";
}

export interface FlyerChoice {
  current: FlyerRecord | null;
  next: FlyerRecord | null;
  defaultTab: "current" | "next";
}

export function pickFlyers(flyers: FlyerRecord[], now: Date): FlyerChoice {
  const today = berlinNow(now).date;
  const wd = weekdayOf(today);
  const monday = addDays(today, wd === 0 ? -6 : 1 - wd);
  const current = flyers.find((f) => f.week_start === monday) ?? null;
  const upcoming = flyers.find((f) => f.week_start === addDays(monday, 7)) ?? null;
  const next = wd === 6 || wd === 0 ? upcoming : null;
  return { current, next, defaultTab: wd === 0 && next ? "next" : "current" };
}
```

`lib/prospekt/urls.ts`:

```ts
import type { FlyerRecord } from "./select";

const file = (page: number, size: "full" | "thumb", format: string) => `${size === "thumb" ? "thumb-" : ""}${page}.${format}`;

/** Öffentlicher Pfad über die eigene Domain (Rewrite in next.config.ts) – Besucher laden nichts direkt von Supabase. */
export const flyerImage = (f: Pick<FlyerRecord, "id" | "format">, page: number, size: "full" | "thumb") => `/prospekt-bilder/${f.id}/${file(page, size, f.format)}`;

/** Pfad im Storage-Bucket „prospekte“. */
export const flyerObjectPath = (id: string, page: number, size: "full" | "thumb", format: "webp" | "jpg") => `${id}/${file(page, size, format)}`;
```

`lib/data/flyers.ts`:

```ts
import "server-only";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/lib/supabase/config";

const FIELDS = "id,week_start,kw,year,valid_from,valid_to,page_count,page_width,page_height,format";

/**
 * Veröffentlichte Prospekte der letzten Wochen (öffentlich über RLS). Cache-Tag „prospekte“ – das Cockpit
 * erneuert ihn nach dem Veröffentlichen. Ein Fehler bricht den Build ab statt einer Seite ohne Prospekt.
 */
export async function publishedFlyers(): Promise<FlyerRecord[]> {
  const url = `${SUPABASE_URL}/rest/v1/flyers?select=${FIELDS}&status=eq.published&order=week_start.desc&limit=6`;
  const res = await fetch(url, {
    headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
    cache: "force-cache",
    next: { revalidate: 3600, tags: ["prospekte"] },
  });
  if (!res.ok) throw new Error(`Supabase (Prospekte) antwortet mit ${res.status}`);
  return res.json();
}
```

- [ ] **Step 4: Rewrite und Cache-Header**

`next.config.ts`: oben `import { SUPABASE_URL } from "./lib/supabase/config";` ergänzen; in `nextConfig` neben `redirects`:

```ts
  async rewrites() {
    // Prospektbilder über die eigene Domain: keine Anfrage der Besucher an Drittanbieter, Caching durch Vercel.
    return [{ source: "/prospekt-bilder/:path*", destination: `${SUPABASE_URL}/storage/v1/object/public/prospekte/:path*` }];
  },
```

und in `headers()` als weiteren Eintrag:

```ts
      {
        // unveränderlich: jeder Upload bekommt eine neue Prospekt-ID und damit neue Pfade
        source: "/prospekt-bilder/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
```

- [ ] **Step 5: Tests und Build**

```bash
npx vitest run lib/prospekt && npx tsc --noEmit -p . && npm run build 2>&1 | grep -E "rror" ; echo build-done
```

Expected: PASS; Build ohne Fehler.

- [ ] **Step 6: Commit**

```bash
git add lib/prospekt lib/data next.config.ts
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Prospekt: Auswahl nach Wochentag, Bildpfade über eigene Domain, Datenzugriff mit Cache-Tag"
```

---

### Task 6: Prospekt im Cockpit hochladen, prüfen, veröffentlichen, löschen

**Files:**
- Create: `lib/prospekt/render.ts`, `app/cockpit/(intern)/prospekt/page.tsx`, `app/cockpit/(intern)/prospekt/actions.ts`, `components/cockpit/flyer-upload.tsx`, `components/cockpit/flyer-week-list.tsx`, `components/cockpit/status-card.tsx`, `e2e/cockpit-prospekt.mjs`, `e2e/cockpit-axe.mjs`
- Modify: `app/cockpit/(intern)/page.tsx`

**Interfaces:**
- Consumes: `requireEditor()`, `supabaseBrowser()` (Task 3); `uploadWeek`, `uploadWeekChoices`, `suggestUploadWeek`, `UploadWeek` (Task 4); `flyerObjectPath`, `flyerImage` (Task 5).
- Produces:
  - Server Actions: `createDraft(input: { weekStart: string; sourceName: string }): Promise<{ id: string } | { error: string }>`, `publishDraft(input: { id: string; pageCount: number; pageWidth: number; pageHeight: number; format: "webp" | "jpg" }): Promise<{ ok: true; kw: number } | { error: string }>`, `discardDraft(id: string): Promise<{ ok: true }>`, `deleteFlyer(id: string): Promise<{ ok: true } | { error: string }>`
  - Client: `pickFormat(): "webp" | "jpg"`, `pdfPageCount(file: File): Promise<number>`, `renderPdfPages(file, { format, fullWidth, thumbWidth, from? }): AsyncGenerator<RenderedPage>` mit `RenderedPage = { n: number; total: number; full: Blob; thumb: Blob; width: number; height: number }`
  - DOM-Haken für Tests: `input[type=file]`, `[data-upload-week]`, `[data-action=upload|retry|publish|discard]`, `[data-upload-review]`, `[data-upload-done]`, `[data-delete="<id>"]`

- [ ] **Step 1: E2E-Test schreiben**

`e2e/cockpit-prospekt.mjs`:

```js
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
await maker.setContent(`<style>@page{size:A4;margin:0}section{height:297mm;display:grid;place-items:center;font:700 64px sans-serif;page-break-after:always}</style>
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
    if (fault && !tripped && req.method() !== "GET" && /\/storage\/v1\/object\/prospekte\/[^/]+\/2\./.test(req.url())) {
      tripped = true;
      return fault === "expired"
        ? req.respond({ status: 401, contentType: "application/json", body: '{"statusCode":"401","error":"Unauthorized","message":"jwt expired"}' })
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
      check(msg.includes("neu an"), "abgelaufene Sitzung → Hinweis zum neuen Anmelden");
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
await b.close();
```

- [ ] **Step 2: Test laufen lassen – muss scheitern**

```bash
npm run build && (npx next start -p 3100 > /tmp/rr-start.log 2>&1 &) ; sleep 4
node --env-file=.env.local e2e/cockpit-prospekt.mjs
```

Expected: FAIL (`/cockpit/prospekt` existiert nicht, kein Dateifeld).

- [ ] **Step 3: PDF im Browser rendern**

`lib/prospekt/render.ts`:

```ts
/**
 * PDF → Seitenbilder im Browser (nur im Cockpit geladen). Jede Seite wird einzeln gezeichnet und danach freigegeben –
 * sonst stößt Safari bei 30+ Seiten an seine Canvas-Grenze.
 */
export interface RenderedPage {
  n: number;
  total: number;
  full: Blob;
  thumb: Blob;
  width: number;
  height: number;
}

/** WebP, wo der Browser es erzeugen kann (Chrome, Firefox, Android) – Safari liefert sonst PNG, dort JPEG. */
export function pickFormat(): "webp" | "jpg" {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  return c.toDataURL("image/webp").startsWith("data:image/webp") ? "webp" : "jpg";
}

async function loadPdf(file: File) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  return pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
}

export async function pdfPageCount(file: File) {
  const doc = await loadPdf(file);
  const n = doc.numPages;
  await doc.destroy();
  return n;
}

function toBlob(canvas: HTMLCanvasElement, format: "webp" | "jpg", quality: number) {
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Bild konnte nicht erzeugt werden"))), format === "webp" ? "image/webp" : "image/jpeg", quality),
  );
}

function scaled(source: HTMLCanvasElement, width: number) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = Math.round((source.height / source.width) * width);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(source, 0, 0, c.width, c.height);
  return c;
}

export async function* renderPdfPages(file: File, opts: { format: "webp" | "jpg"; fullWidth: number; thumbWidth: number; from?: number }): AsyncGenerator<RenderedPage> {
  const doc = await loadPdf(file);
  try {
    for (let n = opts.from ?? 1; n <= doc.numPages; n++) {
      const page = await doc.getPage(n);
      const viewport = page.getViewport({ scale: opts.fullWidth / page.getViewport({ scale: 1 }).width });
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      await page.render({ canvas, viewport }).promise;
      const thumbCanvas = scaled(canvas, opts.thumbWidth);
      const [full, thumb] = await Promise.all([toBlob(canvas, opts.format, 0.82), toBlob(thumbCanvas, opts.format, 0.8)]);
      yield { n, total: doc.numPages, full, thumb, width: canvas.width, height: canvas.height };
      page.cleanup();
      canvas.width = canvas.height = thumbCanvas.width = thumbCanvas.height = 0;
    }
  } finally {
    await doc.destroy();
  }
}
```

- [ ] **Step 4: Server Actions**

`app/cockpit/(intern)/prospekt/actions.ts`:

```ts
"use server";

import { revalidatePath, updateTag } from "next/cache";
import { requireEditor } from "@/lib/cockpit/auth";
import { addDays, berlinNow, weekdayOf } from "@/lib/hours";
import { uploadWeek } from "@/lib/prospekt/week";

const ISO = /^\d{4}-\d{2}-\d{2}$/;
type Supa = Awaited<ReturnType<typeof requireEditor>>["supabase"];

async function removeFlyer(supabase: Supa, id: string) {
  const { data } = await supabase.storage.from("prospekte").list(id, { limit: 200 });
  if (data?.length) await supabase.storage.from("prospekte").remove(data.map((f) => `${id}/${f.name}`));
  await supabase.from("flyers").delete().eq("id", id);
}

function refresh() {
  updateTag("prospekte");
  revalidatePath("/", "layout");
}

export async function createDraft(input: { weekStart: string; sourceName: string }): Promise<{ id: string } | { error: string }> {
  const { supabase } = await requireEditor();
  const today = berlinNow(new Date()).date;
  if (!ISO.test(input.weekStart) || new Date(`${input.weekStart}T12:00:00Z`).getUTCDay() !== 1) return { error: "Ungültige Woche." };
  if (input.weekStart < addDays(today, -7) || input.weekStart > addDays(today, 35)) return { error: "Bitte eine Woche in der Nähe von heute wählen." };
  const w = uploadWeek(input.weekStart);
  const { data, error } = await supabase
    .from("flyers")
    .insert({ week_start: w.weekStart, kw: w.kw, year: w.year, valid_from: w.validFrom, valid_to: w.validTo, source_name: input.sourceName.slice(0, 200) })
    .select("id")
    .single();
  return error ? { error: "Der Prospekt konnte nicht angelegt werden." } : { id: data.id };
}

export async function publishDraft(input: { id: string; pageCount: number; pageWidth: number; pageHeight: number; format: "webp" | "jpg" }): Promise<{ ok: true; kw: number } | { error: string }> {
  const { supabase } = await requireEditor();
  const { id, pageCount, pageWidth, pageHeight, format } = input;
  if (!(pageCount >= 1 && pageCount <= 80 && pageWidth >= 100 && pageWidth <= 4000 && pageHeight >= 100 && pageHeight <= 6000) || !["webp", "jpg"].includes(format)) {
    return { error: "Ungültige Angaben zum Prospekt." };
  }
  const { data: draft } = await supabase.from("flyers").select("id,week_start,kw").eq("id", id).maybeSingle();
  if (!draft) return { error: "Der Entwurf ist nicht mehr vorhanden." };

  // Nur veröffentlichen, wenn wirklich alle Seiten und Vorschaubilder angekommen sind.
  const { data: files } = await supabase.storage.from("prospekte").list(id, { limit: 200 });
  const names = new Set((files ?? []).map((f) => f.name));
  for (let n = 1; n <= pageCount; n++) {
    if (!names.has(`${n}.${format}`) || !names.has(`thumb-${n}.${format}`)) return { error: `Seite ${n} fehlt noch – bitte erneut versuchen.` };
  }

  // Der alte Prospekt derselben Woche bleibt online, bis der neue vollständig ist – erst jetzt ersetzen.
  const { data: old } = await supabase.from("flyers").select("id").eq("week_start", draft.week_start).eq("status", "published").neq("id", id);
  for (const o of old ?? []) await removeFlyer(supabase, o.id);
  const { error } = await supabase.from("flyers").update({ page_count: pageCount, page_width: pageWidth, page_height: pageHeight, format, status: "published" }).eq("id", id);
  if (error) return { error: "Veröffentlichen hat nicht geklappt – bitte erneut versuchen." };

  // Aufräumen: Wochen, die länger als vier Wochen vorbei sind, und Entwürfe von gestern und früher.
  const today = berlinNow(new Date()).date;
  const monday = addDays(today, weekdayOf(today) === 0 ? -6 : 1 - weekdayOf(today));
  const dayAgo = new Date(Date.now() - 864e5).toISOString();
  const { data: stale } = await supabase.from("flyers").select("id").or(`week_start.lt.${addDays(monday, -28)},and(status.eq.draft,created_at.lt."${dayAgo}")`);
  for (const s of stale ?? []) if (s.id !== id) await removeFlyer(supabase, s.id);

  refresh();
  return { ok: true, kw: draft.kw };
}

/** Entwurf verwerfen (Vorschau „Abbrechen“): Bilder und Zeile weg, nichts ändert sich auf der Website. */
export async function discardDraft(id: string): Promise<{ ok: true }> {
  const { supabase } = await requireEditor();
  const { data } = await supabase.from("flyers").select("status").eq("id", id).maybeSingle();
  if (data?.status === "draft") await removeFlyer(supabase, id);
  return { ok: true };
}

export async function deleteFlyer(id: string): Promise<{ ok: true } | { error: string }> {
  const { supabase } = await requireEditor();
  await removeFlyer(supabase, id);
  refresh();
  return { ok: true };
}
```

- [ ] **Step 5: Upload-Komponente (mit Vorschau vor dem Veröffentlichen)**

`components/cockpit/flyer-upload.tsx`:

```tsx
"use client";

import { FileUp, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createDraft, discardDraft, publishDraft } from "@/app/cockpit/(intern)/prospekt/actions";
import { buttonClasses } from "@/components/ui/button";
import { pdfPageCount, pickFormat, renderPdfPages } from "@/lib/prospekt/render";
import { flyerObjectPath } from "@/lib/prospekt/urls";
import { suggestUploadWeek, uploadWeekChoices, type UploadWeek } from "@/lib/prospekt/week";
import { supabaseBrowser } from "@/lib/supabase/browser";

const MAX_BYTES = 60 * 1024 * 1024;
const MAX_PAGES = 80;
const PREVIEW = 8;

type Phase =
  | { name: "idle" }
  | { name: "ready"; file: File; week: UploadWeek }
  | { name: "working"; file: File; week: UploadWeek; done: number; total: number }
  | { name: "review"; file: File; week: UploadWeek; total: number }
  | { name: "failed"; file: File; week: UploadWeek; message: string; resumable: boolean }
  | { name: "done"; kw: number };

interface Progress {
  id?: string;
  uploaded: number;
  width: number;
  height: number;
  format: "webp" | "jpg";
  previews: string[];
}

/** Prospekt hochladen: PDF wählen → Woche prüfen → Seiten im Browser erzeugen und hochladen → Vorschau → veröffentlichen. */
export function FlyerUpload() {
  const [phase, setPhase] = useState<Phase>({ name: "idle" });
  const progress = useRef<Progress>({ uploaded: 0, width: 0, height: 0, format: "webp", previews: [] });
  const choices = uploadWeekChoices(new Date());

  // Vorschau-URLs freigeben, wenn die Komponente verschwindet
  useEffect(() => () => progress.current.previews.forEach((u) => URL.revokeObjectURL(u)), []);

  function reset() {
    progress.current.previews.forEach((u) => URL.revokeObjectURL(u));
    const forced = new URLSearchParams(location.search).get("format") === "jpg";
    progress.current = { uploaded: 0, width: 0, height: 0, format: forced ? "jpg" : pickFormat(), previews: [] };
  }

  function choose(file: File | undefined) {
    if (!file) return;
    reset();
    const week = suggestUploadWeek(file.name, new Date());
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) return setPhase({ name: "failed", file, week, message: "Das ist keine PDF-Datei.", resumable: false });
    if (file.size > MAX_BYTES) return setPhase({ name: "failed", file, week, message: "Das PDF ist größer als 60 MB.", resumable: false });
    setPhase({ name: "ready", file, week });
  }

  async function run(file: File, week: UploadWeek) {
    const p = progress.current;
    try {
      const total = await pdfPageCount(file);
      if (total > MAX_PAGES) return setPhase({ name: "failed", file, week, message: "Das PDF hat mehr als 80 Seiten.", resumable: false });
      setPhase({ name: "working", file, week, done: p.uploaded, total });
      if (!p.id) {
        const res = await createDraft({ weekStart: week.weekStart, sourceName: file.name });
        if ("error" in res) return setPhase({ name: "failed", file, week, message: res.error, resumable: false });
        p.id = res.id;
      }
      const bucket = supabaseBrowser().storage.from("prospekte");
      const contentType = p.format === "webp" ? "image/webp" : "image/jpeg";
      for await (const page of renderPdfPages(file, { format: p.format, fullWidth: 1800, thumbWidth: 480, from: p.uploaded + 1 })) {
        for (const [size, blob] of [["full", page.full], ["thumb", page.thumb]] as const) {
          const { error } = await bucket.upload(flyerObjectPath(p.id, page.n, size, p.format), blob, { contentType, cacheControl: "31536000", upsert: true });
          if (error) throw error;
        }
        if (page.n === 1) Object.assign(p, { width: page.width, height: page.height });
        if (page.n <= PREVIEW) p.previews.push(URL.createObjectURL(page.thumb));
        p.uploaded = page.n;
        setPhase({ name: "working", file, week, done: page.n, total: page.total });
      }
      setPhase({ name: "review", file, week, total: p.uploaded });
    } catch (e) {
      const err = e as { statusCode?: string | number; status?: number; message?: string };
      const code = String(err.statusCode ?? err.status ?? "");
      const expired = code === "401" || code === "403" || /jwt|unauthor/i.test(err.message ?? "");
      setPhase({
        name: "failed",
        file,
        week,
        resumable: !expired,
        message: expired
          ? "Deine Anmeldung ist abgelaufen. Bitte melde dich neu an – danach lädst du das PDF noch einmal hoch."
          : `Die Verbindung ist abgebrochen. Erneut versuchen setzt bei Seite ${p.uploaded + 1} fort.`,
      });
    }
  }

  async function publish(file: File, week: UploadWeek) {
    const p = progress.current;
    const res = await publishDraft({ id: p.id!, pageCount: p.uploaded, pageWidth: p.width, pageHeight: p.height, format: p.format });
    if ("error" in res) return setPhase({ name: "failed", file, week, message: res.error, resumable: true });
    reset();
    setPhase({ name: "done", kw: res.kw });
  }

  async function discard() {
    if (progress.current.id) await discardDraft(progress.current.id);
    reset();
    setPhase({ name: "idle" });
  }

  if (phase.name === "done") {
    return (
      <div data-upload-done className="rounded-[1.75rem] bg-white p-6 md:p-8">
        <h2 className="text-h3">Fertig! KW {phase.kw} ist online.</h2>
        <p className="mt-2 text-muted">Die Website zeigt den Prospekt in wenigen Sekunden.</p>
        <div className="cta-row mt-6">
          <a href="/angebote" target="_blank" rel="noopener" className={buttonClasses("ink")}>
            Auf der Website ansehen<span className="sr-only"> (öffnet in neuem Tab)</span>
          </a>
          <button type="button" onClick={() => setPhase({ name: "idle" })} className={buttonClasses("soft")}>
            Weiteren Prospekt hochladen
          </button>
        </div>
      </div>
    );
  }

  if (phase.name === "review") {
    const { file, week, total } = phase;
    return (
      <div data-upload-review className="rounded-[1.75rem] bg-white p-6 md:p-8">
        <h2 className="text-h3">Passt alles?</h2>
        <p className="mt-2 text-muted">
          KW {week.kw} · {week.range} · {total} Seiten. So sieht der Prospekt auf der Website aus{total > PREVIEW ? ` (erste ${PREVIEW} Seiten)` : ""}.
        </p>
        <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {progress.current.previews.map((src, i) => (
            <li key={src}>
              {/* eslint-disable-next-line @next/next/no-img-element -- lokale Vorschau (Blob-URL) */}
              <img src={src} alt={`Vorschau Seite ${i + 1}`} className="h-auto w-full rounded-lg ring-1 ring-line" />
            </li>
          ))}
        </ul>
        <div className="cta-row mt-6">
          <button type="button" data-action="publish" onClick={() => publish(file, week)} className={buttonClasses("red", "lg")}>
            Veröffentlichen
          </button>
          <button type="button" data-action="discard" onClick={discard} className={buttonClasses("soft", "lg")}>
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  const busy = phase.name === "working";
  return (
    <div className="rounded-[1.75rem] bg-white p-6 md:p-8">
      <label className={`${buttonClasses("red", "lg")} cursor-pointer ${busy ? "pointer-events-none opacity-60" : ""}`}>
        <FileUp className="size-5" aria-hidden />
        PDF auswählen
        <input type="file" accept="application/pdf,.pdf" className="sr-only" disabled={busy} onChange={(e) => choose(e.target.files?.[0])} />
      </label>
      <p className="mt-3 text-[0.9375rem] text-muted">Den Wochenprospekt als PDF – bis 60 MB, höchstens 80 Seiten.</p>

      {"week" in phase && (
        <div className="mt-6 grid gap-4">
          <p className="font-semibold break-all">{phase.file.name}</p>
          <label className="font-semibold">
            Woche
            <select
              data-upload-week
              disabled={busy || Boolean(progress.current.id)}
              value={phase.week.weekStart}
              onChange={(e) => {
                const week = [phase.week, ...choices].find((w) => w.weekStart === e.target.value) ?? phase.week;
                setPhase({ ...phase, week } as Phase);
              }}
              className="mt-2 block h-13 w-full rounded-2xl bg-soft px-4 font-semibold"
            >
              {[...new Map([phase.week, ...choices].map((w) => [w.weekStart, w])).values()].map((w) => (
                <option key={w.weekStart} value={w.weekStart}>
                  KW {w.kw} · {w.range}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {phase.name === "working" && (
        <div className="mt-6" aria-live="polite">
          <p className="font-semibold">
            Seite {Math.min(phase.done + 1, phase.total)} von {phase.total} wird vorbereitet …
          </p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-soft" role="progressbar" aria-valuemin={0} aria-valuemax={phase.total} aria-valuenow={phase.done} aria-label="Fortschritt">
            <div className="h-full rounded-full bg-red transition-[width] duration-300" style={{ width: `${(phase.done / phase.total) * 100}%` }} />
          </div>
        </div>
      )}

      {phase.name === "failed" && (
        <p role="alert" className="mt-6 rounded-2xl bg-red-tint px-4 py-3 font-semibold text-red-deep">
          {phase.message}
        </p>
      )}

      {phase.name === "ready" && (
        <button type="button" data-action="upload" onClick={() => run(phase.file, phase.week)} className={`${buttonClasses("ink", "lg")} mt-6`}>
          Hochladen
        </button>
      )}
      {phase.name === "failed" && phase.resumable && (
        <button type="button" data-action="retry" onClick={() => run(phase.file, phase.week)} className={`${buttonClasses("ink", "lg")} mt-4`}>
          <RotateCcw className="size-5" aria-hidden /> Erneut versuchen
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Wochenliste und Statuskarte**

`components/cockpit/flyer-week-list.tsx`:

```tsx
"use client";

import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteFlyer } from "@/app/cockpit/(intern)/prospekt/actions";

export interface WeekRow {
  weekStart: string;
  kw: number;
  range: string;
  flyer: { id: string; pageCount: number; sourceName: string } | null;
}

/** Laufende Woche und die drei folgenden: online oder fehlt; online mit Löschen. */
export function FlyerWeekList({ rows }: { rows: WeekRow[] }) {
  const [pending, start] = useTransition();
  return (
    <ul className="grid gap-3">
      {rows.map((r) => (
        <li key={r.weekStart} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 md:p-5">
          <div>
            <p className="font-display text-[1.25rem] font-bold">KW {r.kw}</p>
            <p className="text-[0.9375rem] text-muted">{r.range}</p>
          </div>
          {r.flyer ? (
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-open/10 px-3 py-1 text-[0.875rem] font-semibold text-open">✓ online · {r.flyer.pageCount} Seiten</span>
              <button
                type="button"
                data-delete={r.flyer.id}
                disabled={pending}
                onClick={() => {
                  if (confirm(`Prospekt KW ${r.kw} wirklich löschen?`)) start(async () => void (await deleteFlyer(r.flyer!.id)));
                }}
                className="grid size-11 place-items-center rounded-full text-red hover:bg-red-tint"
                aria-label={`Prospekt KW ${r.kw} löschen`}
              >
                <Trash2 className="size-5" aria-hidden />
              </button>
            </div>
          ) : (
            <span className="rounded-full bg-soft px-3 py-1 text-[0.875rem] font-semibold text-muted">fehlt</span>
          )}
        </li>
      ))}
    </ul>
  );
}
```

`components/cockpit/status-card.tsx`:

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Karte in der Übersicht: Titel, Statuszeilen, eine Aktion; `alert` hebt hervor, was zu tun ist. */
export function StatusCard({ title, lines, action, alert = false }: { title: string; lines: string[]; action: { href: string; label: string }; alert?: boolean }) {
  return (
    <section className={cn("rounded-[1.75rem] p-6 md:p-7", alert ? "bg-red text-white" : "bg-white")}>
      <h2 className="text-h3">{title}</h2>
      <ul className="mt-3 grid gap-1">
        {lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <Link href={action.href} className={cn("mt-5 inline-flex min-h-11 items-center rounded-full px-5 font-semibold", alert ? "bg-white text-ink" : "bg-ink text-white")}>
        {action.label}
      </Link>
    </section>
  );
}
```

- [ ] **Step 7: Prospekt-Seite und Übersicht**

`app/cockpit/(intern)/prospekt/page.tsx`:

```tsx
import type { Metadata } from "next";
import { FlyerUpload } from "@/components/cockpit/flyer-upload";
import { FlyerWeekList, type WeekRow } from "@/components/cockpit/flyer-week-list";
import { requireEditor } from "@/lib/cockpit/auth";
import { uploadWeekChoices } from "@/lib/prospekt/week";

export const metadata: Metadata = { title: "Prospekt" };

export default async function ProspektPage() {
  const { supabase } = await requireEditor();
  const weeks = uploadWeekChoices(new Date());
  const { data } = await supabase
    .from("flyers")
    .select("id,week_start,page_count,source_name")
    .eq("status", "published")
    .in("week_start", weeks.map((w) => w.weekStart));
  const rows: WeekRow[] = weeks.map((w) => {
    const f = data?.find((d) => d.week_start === w.weekStart);
    return { weekStart: w.weekStart, kw: w.kw, range: w.range, flyer: f ? { id: f.id, pageCount: f.page_count, sourceName: f.source_name } : null };
  });
  return (
    <>
      <p className="text-eyebrow text-red">Wochenprospekt</p>
      <h1 className="mt-2 text-h2">Prospekt hochladen.</h1>
      <p className="mt-3 max-w-[52ch] text-lede text-muted">
        Den nächsten Prospekt bekommst du meist freitags. Lade ihn hoch, sobald er da ist – die Website zeigt ihn ab Samstag als „Nächste Woche“.
      </p>
      <div className="mt-8">
        <FlyerUpload />
      </div>
      <h2 className="mt-12 text-h3">Wochen</h2>
      <div className="mt-4">
        <FlyerWeekList rows={rows} />
      </div>
    </>
  );
}
```

`app/cockpit/(intern)/page.tsx` (ersetzt das Gerüst aus Task 3):

```tsx
import type { Metadata } from "next";
import { StatusCard } from "@/components/cockpit/status-card";
import { requireEditor } from "@/lib/cockpit/auth";
import { berlinNow, weekdayOf } from "@/lib/hours";
import { uploadWeekChoices, type UploadWeek } from "@/lib/prospekt/week";

export const metadata: Metadata = { title: "Übersicht" };

export default async function UebersichtPage() {
  const { editor, supabase } = await requireEditor();
  const now = new Date();
  const [thisWeek, nextWeek] = uploadWeekChoices(now);
  const { data } = await supabase.from("flyers").select("week_start,page_count").eq("status", "published").in("week_start", [thisWeek.weekStart, nextWeek.weekStart]);
  const found = (w: UploadWeek) => data?.find((d) => d.week_start === w.weekStart);
  const wd = weekdayOf(berlinNow(now).date);
  // Rot, wenn diese Woche fehlt – oder ab Freitag (und sonntags) die nächste; der neue Prospekt kommt meist freitags.
  const alert = !found(thisWeek) || (!found(nextWeek) && (wd >= 5 || wd === 0));
  const line = (w: UploadWeek) => {
    const f = found(w);
    return f ? `KW ${w.kw} ✓ online (${f.page_count} Seiten)` : `KW ${w.kw} fehlt noch`;
  };
  return (
    <>
      <p className="text-eyebrow text-red">Markt-Cockpit</p>
      <h1 className="mt-2 text-h2">Hallo, {editor.name}.</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <StatusCard
          title="Prospekt"
          lines={[line(thisWeek), line(nextWeek)]}
          alert={alert}
          action={{ href: "/cockpit/prospekt", label: found(nextWeek) ? "Prospekte ansehen" : "Prospekt hochladen" }}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 8: pdf.js-Worker mit Turbopack prüfen**

```bash
npm run build 2>&1 | grep -E "rror|napi|canvas" ; find .next/static -name "pdf.worker*" | head -3
```

Expected: Build ohne Fehler; eine `pdf.worker*`-Datei unter `.next/static`.
Fallback 1 (Worker fehlt): `cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs` und in `render.ts` `workerSrc = "/pdf.worker.min.mjs"`; `public/pdf.worker.min.mjs` in `.gitattributes` nicht nötig, aber im README unter „Markt-Cockpit“ erwähnen (bei pdfjs-Update neu kopieren).
Fallback 2 (Build meldet `@napi-rs/canvas`): in `next.config.ts` `turbopack: { resolveAlias: { "@napi-rs/canvas": { browser: "./lib/prospekt/empty.ts" } } }` und `lib/prospekt/empty.ts` mit `export {};` anlegen.

- [ ] **Step 9: E2E laufen lassen – muss bestehen**

```bash
pkill -f "next start -p 3100"; (npx next start -p 3100 > /tmp/rr-start.log 2>&1 &) ; sleep 4
node --env-file=.env.local e2e/cockpit-prospekt.mjs
```

Expected: alle `✓` (Wochenerkennung, Abbruch + Fortsetzen, Vorschau, JPEG, Ersetzen, Sitzungshinweis, öffentliches Bild, Löschen).

- [ ] **Step 10: axe im Cockpit**

`e2e/cockpit-axe.mjs`:

```js
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
```

```bash
node --env-file=.env.local e2e/cockpit-axe.mjs
```

Expected: alle `✓` mit `0`.

- [ ] **Step 11: Commit**

```bash
pkill -f "next start -p 3100"
git add -A
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Cockpit: Prospekt hochladen (pdf.js im Browser), Vorschau, veröffentlichen, ersetzen, löschen; Übersicht mit Prospekt-Status"
```

---

### Task 7: Prospekt auf der Website (`/angebote`)

**Files:**
- Create: `components/prospekt/flyer-viewer.tsx`, `e2e/prospekt-viewer.mjs`
- Modify: `app/(site)/angebote/page.tsx`, `app/globals.css`

**Interfaces:**
- Consumes: `publishedFlyers()`, `pickFlyers()`, `flyerImage()`, `FlyerRecord` (Task 5); `uploadWeek()` (Task 4).
- Produces: `<FlyerViewer weeks={ViewerWeek[]} defaultTab />` mit `ViewerWeek = { key: "current" | "next"; label: string; kw: number; range: string; flyer: FlyerRecord }`; Anker `#prospekt` auf `/angebote`.

- [ ] **Step 1: E2E-Test schreiben**

`e2e/prospekt-viewer.mjs`:

```js
// node --env-file=.env.local e2e/prospekt-viewer.mjs – braucht einen veröffentlichten Prospekt der laufenden Woche
// (vorher: KEEP=1 node --env-file=.env.local e2e/cockpit-prospekt.mjs).
import { BASE, browser, check } from "./lib.mjs";

const b = await browser();
const page = await b.newPage();
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const third = new Set();
page.on("request", (r) => { const u = new URL(r.url()); if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) third.add(u.hostname); });
await page.goto(`${BASE}/angebote`, { waitUntil: "networkidle0" });

const thumbs = await page.$$("[data-flyer-page]");
check(thumbs.length >= 1, `Raster mit ${thumbs.length} Seiten`);
check((await page.$eval("[data-flyer-page] img", (i) => i.getAttribute("alt"))).startsWith("Prospektseite 1 von"), "Alt-Text „Prospektseite 1 von …“");
await thumbs[0].click();
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /1\s*\/\s*\d+/.test(e.textContent)), "Viewer offen bei 1 / N");
await page.keyboard.press("ArrowRight");
await page.waitForFunction(() => new URLSearchParams(location.search).get("seite") === "2");
check(true, "Pfeiltaste blättert, Adresse zeigt ?seite=2");
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector(".pswp--open"));
check(await page.evaluate(() => document.activeElement?.hasAttribute("data-flyer-page") && !location.search.includes("seite")), "Esc schließt, Fokus im Raster, ?seite entfernt");

await page.goto(`${BASE}/angebote?seite=2`, { waitUntil: "networkidle0" });
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /2\s*\/\s*\d+/.test(e.textContent)), "Link mit ?seite=2 öffnet Seite 2");
check(third.size === 0, `keine Drittanbieter-Anfragen (${[...third].join(",") || "keine"})`);
await b.close();
```

- [ ] **Step 2: Test laufen lassen – muss scheitern**

```bash
npm run build && (npx next start -p 3100 > /tmp/rr-start.log 2>&1 &) ; sleep 4
KEEP=1 node --env-file=.env.local e2e/cockpit-prospekt.mjs
node --env-file=.env.local e2e/prospekt-viewer.mjs
```

Expected: FAIL („Raster mit 0 Seiten“) – `/angebote` zeigt noch das Ticket.

- [ ] **Step 3: Viewer-Komponente**

`components/prospekt/flyer-viewer.tsx`:

```tsx
"use client";

import "photoswipe/style.css";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { flyerImage } from "@/lib/prospekt/urls";
import { cn } from "@/lib/utils";

export interface ViewerWeek {
  key: "current" | "next";
  label: string;
  kw: number;
  range: string;
  flyer: FlyerRecord;
}

function setPageParam(n: number | null) {
  const url = new URL(location.href);
  if (n) url.searchParams.set("seite", String(n));
  else url.searchParams.delete("seite");
  history.replaceState(history.state, "", url);
}

/**
 * Prospekt als Seitenraster (Titelseite groß) und Vollbild-Viewer (PhotoSwipe, erst beim Öffnen geladen):
 * Wischen, Zoom, Pfeiltasten; die aktuelle Seite steht als ?seite= in der Adresse und lässt sich teilen.
 */
export function FlyerViewer({ weeks, defaultTab }: { weeks: ViewerWeek[]; defaultTab: "current" | "next" }) {
  const [tab, setTab] = useState(weeks.find((w) => w.key === defaultTab)?.key ?? weeks[0].key);
  const week = weeks.find((w) => w.key === tab) ?? weeks[0];
  const { flyer } = week;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  const open = useCallback(
    async (index: number) => {
      const { default: PhotoSwipeLightbox } = await import("photoswipe/lightbox");
      let current = index;
      const lightbox = new PhotoSwipeLightbox({
        dataSource: Array.from({ length: flyer.page_count }, (_, i) => ({
          src: flyerImage(flyer, i + 1, "full"),
          msrc: flyerImage(flyer, i + 1, "thumb"),
          width: flyer.page_width,
          height: flyer.page_height,
          alt: `Prospektseite ${i + 1} von ${flyer.page_count}`,
        })),
        pswpModule: () => import("photoswipe"),
        index,
        bgOpacity: 0.94,
        returnFocus: false,
        closeTitle: "Schließen",
        zoomTitle: "Vergrößern",
        arrowPrevTitle: "Vorherige Seite",
        arrowNextTitle: "Nächste Seite",
        errorMsg: "Diese Seite konnte nicht geladen werden.",
      });
      lightbox.on("change", () => {
        current = lightbox.pswp?.currIndex ?? current;
        setPageParam(current + 1);
      });
      lightbox.on("destroy", () => {
        setPageParam(null);
        buttons.current[current]?.focus();
      });
      lightbox.init();
      lightbox.loadAndOpen(index);
      setPageParam(index + 1);
    },
    [flyer],
  );

  // Geteilter Link mit ?seite=: beim ersten Aufruf direkt diese Seite öffnen
  useEffect(() => {
    const n = Number(new URLSearchParams(location.search).get("seite"));
    if (n >= 1 && n <= flyer.page_count) void open(n - 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- nur beim ersten Aufruf
  }, []);

  return (
    <div>
      {weeks.length > 1 && (
        <div role="tablist" aria-label="Prospektwoche" className="inline-flex rounded-full bg-soft p-1">
          {weeks.map((w) => (
            <button
              key={w.key}
              role="tab"
              type="button"
              aria-selected={w.key === tab}
              onClick={() => setTab(w.key)}
              className={cn("min-h-11 rounded-full px-5 font-semibold transition-colors", w.key === tab ? "bg-white text-ink shadow-[var(--shadow-soft)]" : "text-muted hover:text-ink")}
            >
              {w.label}
            </button>
          ))}
        </div>
      )}
      <p className="mt-5 font-semibold">
        KW {week.kw} · {week.range}
      </p>
      <ul className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4">
        {Array.from({ length: flyer.page_count }, (_, i) => (
          <li key={`${flyer.id}-${i}`} className={cn(i === 0 && "col-span-2 row-span-2")}>
            <button
              ref={(el) => {
                buttons.current[i] = el;
              }}
              type="button"
              data-flyer-page
              onClick={() => open(i)}
              className="group block w-full overflow-hidden rounded-2xl bg-white ring-1 ring-line transition-transform duration-150 active:scale-[0.98]"
              aria-label={`Prospektseite ${i + 1} von ${flyer.page_count} vergrößern`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- fertig skaliert (480 px), keine Optimierung nötig */}
              <img
                src={flyerImage(flyer, i + 1, "thumb")}
                width={480}
                height={Math.round((flyer.page_height / flyer.page_width) * 480)}
                alt={`Prospektseite ${i + 1} von ${flyer.page_count}`}
                loading={i < 4 ? "eager" : "lazy"}
                decoding="async"
                className="h-auto w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
              />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

`app/globals.css` am Ende ergänzen:

```css
/* ───────────── Prospekt-Viewer (PhotoSwipe) in Markenfarben ───────────── */
.pswp {
  --pswp-bg: #0c0c0c;
  --pswp-placeholder-bg: #2b2925;
  --pswp-icon-color: #fff;
  --pswp-icon-color-secondary: #0c0c0c;
}
```

- [ ] **Step 4: `/angebote` umbauen**

In `app/(site)/angebote/page.tsx` Imports ergänzen:

```tsx
import { FlyerViewer, type ViewerWeek } from "@/components/prospekt/flyer-viewer";
import { publishedFlyers } from "@/lib/data/flyers";
import { pickFlyers } from "@/lib/prospekt/select";
import { uploadWeek } from "@/lib/prospekt/week";
```

`export default function AngebotePage()` → `export default async function AngebotePage()`; direkt nach der Zeile `const open = …` einfügen:

```tsx
  const choice = pickFlyers(await publishedFlyers(), new Date());
  const weeks: ViewerWeek[] = [
    ...(choice.current ? [{ key: "current" as const, label: "Diese Woche", flyer: choice.current }] : []),
    ...(choice.next ? [{ key: "next" as const, label: "Nächste Woche", flyer: choice.next }] : []),
  ].map((w) => ({ ...w, kw: w.flyer.kw, range: uploadWeek(w.flyer.week_start).range }));
```

und den Block

```tsx
      <section aria-label="Aktueller Prospekt" className="wrap">
        <FlyerTicket />
      </section>
```

ersetzen durch:

```tsx
      <section id="prospekt" aria-label="Aktueller Prospekt" className="wrap">
        {weeks.length > 0 ? (
          <>
            <FlyerViewer weeks={weeks} defaultTab={choice.defaultTab} />
            <p className="mt-6 text-[0.9375rem] text-muted">
              Alle Angebote auch als Text:{" "}
              <a href={markt.links.flyer} target="_blank" rel="noopener" className="font-semibold text-ink underline underline-offset-4">
                Liste auf rewe.de<span className="sr-only"> (öffnet in neuem Tab)</span>
              </a>
            </p>
          </>
        ) : (
          <FlyerTicket />
        )}
      </section>
```

- [ ] **Step 5: E2E laufen lassen – muss bestehen; öffentliche Qualitätsprüfung**

```bash
npm run build && (pkill -f "next start -p 3100"; npx next start -p 3100 > /tmp/rr-start.log 2>&1 &) ; sleep 4
node --env-file=.env.local e2e/prospekt-viewer.mjs
node e2e/public-qa.mjs /angebote /
node --env-file=.env.local e2e/cockpit-prospekt.mjs
```

Expected: alle `✓`; der letzte Lauf (ohne `KEEP`) räumt den Test-Prospekt wieder ab.

- [ ] **Step 6: Commit**

```bash
pkill -f "next start -p 3100"
git add -A
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Website: Prospekt-Viewer auf /angebote (Raster, PhotoSwipe, ?seite=, Wochenreiter), Rückfall auf rewe.de"
```

---

### Task 8: Startseiten-Ticket mit Titelseite, Doku, Gesamtprüfung, Pull Request

**Files:**
- Modify: `components/home/flyer-ticket.tsx`, `app/(site)/page.tsx`, `README.md`, `docs/BETREIBER-CHECKLISTE.md`, `app/(site)/datenschutz/page.tsx`, `docs/superpowers/specs/2026-10-05-markt-cockpit-design.md`

**Interfaces:**
- Consumes: `publishedFlyers()`, `pickFlyers()`, `flyerImage()` (Task 5); `absoluteUrl()` (`lib/site.ts`).
- Produces: `FlyerTicket` mit optionalem `cover?: { src: string; width: number; height: number }`.

- [ ] **Step 1: Ticket mit Titelseite**

`components/home/flyer-ticket.tsx`:

1. Import ergänzen: `import { absoluteUrl } from "@/lib/site";`
2. Signatur:

```tsx
export function FlyerTicket({
  headingLevel = "h2",
  className,
  cover,
}: {
  headingLevel?: "h1" | "h2";
  className?: string;
  /** Titelseite des gezeigten Prospekts (aus dem Cockpit) – dann bleiben Knopf und Teilen auf der eigenen Website */
  cover?: { src: string; width: number; height: number };
}) {
```

3. Den Textteil `<div className="p-7 sm:p-10 lg:p-12">` ersetzen durch `<div className="p-7 sm:p-10 lg:grid lg:grid-cols-[1fr_auto] lg:items-center lg:gap-10 lg:p-12">`, seinen bisherigen Inhalt (Überschrift, Absatz, `.cta-row`) in ein `<div>` legen und dahinter einfügen:

```tsx
        {cover && (
          <a href="/angebote#prospekt" className="mx-auto mt-8 block w-40 rotate-[2deg] overflow-hidden rounded-xl shadow-[0_20px_50px_rgb(18_18_18/0.25)] ring-1 ring-line transition-transform duration-150 active:scale-[0.97] sm:w-48 lg:mt-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- fertig skaliertes Vorschaubild */}
            <img src={cover.src} width={cover.width} height={cover.height} alt="Titelseite des aktuellen Prospekts" className="h-auto w-full" />
          </a>
        )}
```

4. In der `.cta-row` den Prospekt-Knopf und die Teilen-Adresse abhängig machen:

```tsx
          {cover ? (
            <ButtonLink href="/angebote#prospekt" variant="ink" size="lg">
              Prospekt ansehen
            </ButtonLink>
          ) : (
            <ButtonLink href={markt.links.flyer} external variant="ink" size="lg">
              Prospekt öffnen
            </ButtonLink>
          )}
          <ShareButton
            url={cover ? absoluteUrl("/angebote") : markt.links.flyer}
            title="Prospekt der Woche – REWE Rödelheim"
            text={`Die Angebote bei REWE Rödelheim (KW ${week.kw}):`}
            label="Teilen"
            size="lg"
          />
```

- [ ] **Step 2: Startseite liefert die passende Titelseite**

`app/(site)/page.tsx`: `export default function HomePage()` → `export default async function HomePage()`; Imports `publishedFlyers` (`@/lib/data/flyers`), `pickFlyers` (`@/lib/prospekt/select`), `flyerImage` (`@/lib/prospekt/urls`); vor `return`:

```tsx
  // Das Ticket zeigt sonntags schon die neue Woche – dann auch deren Titelseite (sonst keine).
  const choice = pickFlyers(await publishedFlyers(), new Date());
  const shown = choice.defaultTab === "next" ? choice.next : choice.current;
  const cover = shown ? { src: flyerImage(shown, 1, "thumb"), width: 480, height: Math.round((shown.page_height / shown.page_width) * 480) } : undefined;
```

und `<FlyerTicket />` → `<FlyerTicket cover={cover} />`.

- [ ] **Step 3: Doku, Datenschutz, Spec**

`README.md` – nach dem Abschnitt „Service-Funktionen“ einfügen:

```markdown
## Markt-Cockpit

`/cockpit` – Anmeldung mit E-Mail und Passwort (Supabase, Projekt `rewe-roedelheim`, Frankfurt). Der Markt lädt hier den Wochenprospekt als PDF hoch; die Seiten werden im Browser in Bilder umgewandelt, nach einer Vorschau veröffentlicht und auf `/angebote` sowie im Startseiten-Ticket gezeigt. Ab Samstag erscheint ein schon hochgeladener Prospekt als „Nächste Woche“; Prospekte, deren Woche länger als vier Wochen vorbei ist, löscht das nächste Veröffentlichen.

| Aufgabe | So geht's |
|---|---|
| Konto anlegen | Supabase-Dashboard → Authentication → Add user (E-Mail, Passwort, „Auto Confirm“), dann im SQL-Editor `insert into public.editors (user_id, name) values ('<uuid>', '<Vorname>');` |
| Registrierung sperren | Authentication → Sign In / Providers → „Allow new users to sign up“ aus (einmalig) |
| Datenbank ändern | neue Datei in `supabase/migrations/`, per Supabase-MCP `apply_migration` oder SQL-Editor anwenden |
| Tests | Server auf Port 3100 starten, dann `node --env-file=.env.local e2e/<skript>.mjs` (`rls-check`, `cockpit-login`, `cockpit-prospekt`, `prospekt-viewer`, `cockpit-axe`, `public-qa`) |
| Tarif | Für den Livegang Supabase Pro (pausiert nicht, tägliche Sicherung); Vercel-Tarif auf kommerzielle Nutzung prüfen |
```

`docs/BETREIBER-CHECKLISTE.md` – neuer Abschnitt vor „Bildrechte“:

```markdown
## Markt-Cockpit und Prospekt

- [ ] **Prospekt-PDF**: Bekommt der Markt den Wochenprospekt als PDF (z. B. „KW41_2026_final_proof.pdf“ aus dem REWE-Werbemittelportal)? Freigabe, ihn auf der eigenen Website zu zeigen?
- [ ] **Cockpit-Konten**: E-Mail-Adressen von Ali Alamyaar und der Marktleitung.
- [ ] **Passwort vergessen**: Mail-Versand in Supabase einrichten (gleicher Weg wie für Bewerbungen).
```

`app/(site)/datenschutz/page.tsx` – nach dem Abschnitt „Teilen“ einfügen:

```tsx
          <h2>Markt-Cockpit</h2>
          <p>
            Mitarbeitende des Markts melden sich mit E-Mail-Adresse und Passwort an, um den Prospekt und Inhalte zu pflegen. Die Anmeldedaten,
            Prospektseiten und Inhalte speichert die Supabase Inc. als Auftragsverarbeiter auf Servern in Frankfurt am Main (Art. 28 DSGVO).
            Prospektseiten werden über diese Website ausgeliefert – dein Browser verbindet sich dabei nicht mit Supabase.
          </p>
```

`docs/superpowers/specs/2026-10-05-markt-cockpit-design.md` – in Abschnitt 3 den Satz „Prospekte älter als vier Wochen löscht ein täglicher Aufräum-Job (Vercel Cron, Abschnitt 10) samt Bildern.“ ersetzen durch „Beim Veröffentlichen löscht das Cockpit Prospekte, deren Woche länger als vier Wochen vorbei ist, und Entwürfe von gestern und früher – samt Bildern (kein Cron, kein Secret Key nötig; der Markt lädt ohnehin jede Woche hoch).“; in Abschnitt 10 „Aufräum-Job als täglicher Vercel Cron (`/api/cron/aufraeumen`, mit `CRON_SECRET` geschützt).“ ersetzen durch „Aufräumen der Prospekte beim Veröffentlichen (Abschnitt 3); Löschfristen für Feedback ab Stufe 3 per `pg_cron` in der Datenbank.“

- [ ] **Step 4: Gesamtprüfung**

```bash
npx tsc --noEmit -p . && npm run lint && npm test && npm run build
(npx next start -p 3100 > /tmp/rr-start.log 2>&1 &) ; sleep 4
node --env-file=.env.local e2e/rls-check.mjs
node --env-file=.env.local e2e/cockpit-login.mjs
node --env-file=.env.local e2e/cockpit-axe.mjs
node e2e/public-qa.mjs
KEEP=1 node --env-file=.env.local e2e/cockpit-prospekt.mjs
node --env-file=.env.local e2e/prospekt-viewer.mjs
node e2e/public-qa.mjs / /angebote
```

Screenshots 390/768/1024/1280 von `/` und `/angebote` mit Test-Prospekt (Ticket mit Titelseite, Viewer-Raster) und danach ohne (Rückfall-Ticket) ansehen; Lighthouse mobil für `/` und `/angebote` mit Test-Prospekt und mit den Werten aus `feinschliff-v5` vergleichen (lokal: Start 93, Angebote 96). Zum Schluss den Test-Prospekt entfernen:

```bash
node --env-file=.env.local e2e/cockpit-prospekt.mjs
```

Expected: alle Prüfungen `✓`; keine Drittanbieter-Anfragen; Lighthouse nicht schlechter als vorher.

- [ ] **Step 5: Commit, Push, Pull Request**

```bash
pkill -f "next start -p 3100"
git add -A
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Startseite: Ticket mit Titelseite des Prospekts; Doku, Datenschutz, Spec-Anpassung"
git push -u origin markt-cockpit
gh pr create --base feinschliff-v5 --head markt-cockpit --title "Markt-Cockpit + Prospekt auf der Website (Stufe 1–2)" --body "Spec: docs/superpowers/specs/2026-10-05-markt-cockpit-design.md · Plan: docs/superpowers/plans/2026-10-05-cockpit-prospekt.md · Vorschau: Vercel-Link im PR. Merge erst nach Freigabe der Agentur (vorher PR #4)."
```

Der Vercel-Build braucht nur Netzzugriff auf Supabase (öffentliche Werte stehen in `lib/supabase/config.ts`). Vorschau-Link der Agentur geben; nach `main` erst nach Freigabe.
