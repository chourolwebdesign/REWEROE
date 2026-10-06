# Design und Tempo (Stufe 5) – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die Website wird schneller (Lighthouse mobil ≥ 95 auf jeder öffentlichen Seite, Prospektseite ≤ 1 MB beim Laden), die Prospektseite bekommt eine Blätter-Ansicht, die Unterseiten rote Köpfe wie der Hero, und das Video läuft in voller Quellqualität mit modernen Codecs.

**Architecture:** Prospektbilder laufen über die vorhandene Next-Bildoptimierung (`next/image`, AVIF/WebP in passender Breite) – das geht schon heute über den Rewrite `/prospekt-bilder/*` (geprüft: Titelseite 184 KB → 28 KB, ganze Seite 993 KB → 104 KB). Die Blätter-Ansicht ist eine CSS-Scroll-Snap-Leiste in der bestehenden Client-Komponente `FlyerViewer`; die Vergrößerung bleibt PhotoSwipe. Rote Seitenköpfe sind eine Variante von `PageHeader`; die Kopfleiste entscheidet per Pfad (schon im Server-HTML), wo sie transparent startet. Das Video gibt es als AV1, HEVC und H.264 in 720×1280; der Browser nimmt die erste Fassung, die er abspielen kann.

**Tech Stack:** Next.js 16.3.8 (App Router), React 19, Tailwind 4, next/image, PhotoSwipe 5, ffmpeg (libsvtav1, libx265, libx264), Vitest, Puppeteer + axe, Lighthouse 13.5 (per npx).

**Spec:** `docs/superpowers/specs/2026-10-06-design-tempo-design.md`

**Branch:** `markt-design` (von `markt-inhalte`), eigener PR.

`$SCRATCH` in den Befehlen ist das Scratchpad-Verzeichnis der Sitzung (nur für Logs).

## Entscheidungen gegenüber Spec

Die Spec bleibt maßgeblich; diese Punkte entscheidet der Plan (beim Ausführen als Ruling ins Ledger):

1. **Kopfleiste per Pfadliste** (`hasHero` in `lib/site.ts`) statt per Attribut: Der Server muss es schon beim ersten HTML wissen, sonst
   blitzt die weiße Leiste auf. Wann sie beim Scrollen weiß wird, liest sie weiterhin am Element `[data-hero]` ab.
2. **KW, Gültigkeit und „Teilen“** stehen direkt unter dem roten Kopf in der Prospekt-Ansicht, nicht im Kopf selbst: Sie hängen am
   gewählten Wochen-Reiter (Zustand im Browser).
3. **Fotoqualität:** 85 für Story, große Fotos und die Vollbild-Galerie; die kleinen Galerie-Kacheln 75 (bisher 70) – 85 kostet dort
   Tempo ohne sichtbaren Gewinn bei 160–320 px.
4. **Video:** Es lädt schon heute erst nach dem `load`-Ereignis (`use-story.ts`) – das bleibt; neu sind Codecs und Auflösung.
5. **Vergrößerung:** PhotoSwipe lädt die Seiten ebenfalls über die Bildoptimierung (1 920 px, Qualität 85) statt der Originale (~1 MB je Seite).
6. **Messung** als Skript im Repo (`e2e/lighthouse.mjs`), Lighthouse per `npx lighthouse@13.5.0` – keine neue Projekt-Abhängigkeit.

## Global Constraints

- Design bleibt: roter Hero, Bänder, Farben, Bricolage Grotesque; keine neuen npm-Pakete (keine Slider-Bibliothek).
- WCAG 2.2 AA: axe ohne Befund (Desktop und Mobil), 320 px ohne Überlauf, sichtbarer Fokus; bei reduzierter Bewegung keine Animation und kein weiches Scrollen.
- Keine Drittanbieter-Anfragen auf öffentlichen Seiten; die Seiten bleiben statisch (ISR).
- Texte auf Deutsch in „du“; nur Belegtes.
- Dateien unter `/media` werden ein Jahr gecacht: geänderte Videos nur unter neuem Namen.
- Die Browser-Tests dieser Stufe lesen nur – Grundlage ist der echte Prospekt KW 41 (34 Seiten, JPEG) in der Datenbank. Sie schreiben nichts in Supabase.
- Commits mit `git -c user.name=Claude -c user.email=noreply@anthropic.com`; nichts nach `main`.

## Review Focus

- **Seitenzahl und Format:** gerade/ungerade Seitenzahl, ein einziges Blatt, Querformat – Doppelseiten (Titelseite allein, dann Paare,
  letzte Seite ggf. allein) ohne leere Hälften und ohne Sprung beim Blättern. Test: Unit-Tests `pagerTarget`, `pageLabel` (Task 3).
- **Tastatur und reduzierte Bewegung** in der Blätter-Ansicht: „Weiter“/„Zurück“ per Tab und Enter, Pfeiltasten auf einer Seite,
  sichtbarer Fokus, Seitenanzeige wird angesagt, kein weiches Scrollen. Test: E2E Tastatur-Schritt (Task 3).
- **Geteilter Link** `?kw=&seite=`: Vergrößerung öffnet an der Seite, die Leiste steht nach dem Schließen dort, der Fokus liegt auf
  dieser Seite, die Adresse ist wieder ohne Parameter. Test: E2E (Task 3).
- **Navigation im Browser** zwischen Seiten mit und ohne roten Kopf (Kopfleiste, Fußzeile): Leiste wechselt richtig zwischen
  transparent und weiß – auch ohne Neuladen. Test: E2E (Task 4).
- **Browser ohne AV1** (ältere Safari/Firefox) und **Datensparmodus**: HEVC bzw. H.264, im Datensparmodus nur das Standbild.
  Test: Unit `pickSource` und E2E mit abgeschaltetem AV1 und mit Save-Data (Task 5).

---

## Dateistruktur

| Datei | Aufgabe |
|---|---|
| `lib/data/flyers.ts` (ändern) | `currentFlyerLink()` – Ziel aller „Prospekt“-Knöpfe |
| `components/prospekt/flyer-image.tsx` | `FlyerImage` (Prospektseite über `next/image`), `flyerZoomSrc`, `flyerMiniSrc` |
| `lib/prospekt/pager.ts` (+test) | `pageLabel`, `nearPages`, `pagerTarget` – Logik der Blätter-Ansicht |
| `components/prospekt/flyer-pager.tsx` | Blätter-Leiste mit Pfeilen, Seitenanzeige, Vorschau-Leiste |
| `components/prospekt/flyer-viewer.tsx` (ändern) | Reiter, KW-Zeile mit „Teilen“, Blätter-Leiste, „Alle Seiten“, PhotoSwipe |
| `lib/site.ts` (+test) | `hasHero(pathname)` |
| `components/layout/page-header.tsx`, `site-header.tsx` (ändern) | roter Kopf (`tone="red"`), transparente Leiste |
| `lib/video.ts` (+test), `lib/media.ts`, `lib/resolve.ts`, `components/home/use-story.ts`, `components/media/gallery.tsx` (ändern) | Video-Fassungen AV1/HEVC/H.264 |
| `public/media/markt-rundgang-{av1,hevc,h264}.mp4` (neu), `-540/-720.mp4` (löschen) | Video |
| `e2e/start-ticket.mjs`, `e2e/prospekt-viewer.mjs` (ändern), `e2e/seitenkopf.mjs`, `e2e/medien.mjs`, `e2e/lighthouse.mjs` (neu) | Prüfungen |
| `README.md`, `docs/BETREIBER-CHECKLISTE.md`, Spec (Ergebnis) | Doku |

---

### Task 1: Titelseite nur bei Bedarf laden, Prospekt-Knöpfe überall gleich

**Files:**
- Modify: `components/home/flyer-ticket.tsx`, `lib/data/flyers.ts`, `app/(site)/layout.tsx`, `app/(site)/page.tsx`,
  `app/(site)/markt/page.tsx`, `app/(site)/kontakt/page.tsx`, `e2e/start-ticket.mjs`

**Interfaces:**
- Produces: `currentFlyerLink(): Promise<{ href: string; external: boolean }>` (React `cache`, `server-only`).

- [ ] **Step 1: Browser-Test erweitern (rot)**

In `e2e/start-ticket.mjs` vor `await b.close();` einfügen:

```js
// Unterseiten: keine Titelseite im Hintergrund (der Prefetch der Startseite lud sie bisher mit), Knöpfe wie Kopf und Leiste
const sub = await b.newPage();
await sub.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
const flyerLoads = [];
sub.on("request", (r) => {
  if (r.url().includes("prospekt-bilder")) flyerLoads.push(r.url());
});
await sub.goto(`${BASE}/kontakt`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 3000));
check(flyerLoads.length === 0, `/kontakt lädt keine Prospektbilder (${flyerLoads.length})`);
const kontaktBtn = await sub.evaluate(() => [...document.querySelectorAll("main a")].find((a) => a.textContent.trim().startsWith("Prospekt öffnen"))?.getAttribute("href"));
check(ok(kontaktBtn), `/kontakt „Prospekt öffnen“ → ${kontaktBtn}`);
await sub.goto(`${BASE}/markt`, { waitUntil: "networkidle0" });
const marktBtn = await sub.evaluate(() => [...document.querySelectorAll("main a")].find((a) => a.textContent.trim().startsWith("Prospekt der Woche"))?.getAttribute("href"));
check(ok(marktBtn), `/markt „Prospekt der Woche“ → ${marktBtn}`);
```

Run (Server läuft auf 3100 mit dem aktuellen Stand, KW 41 ist veröffentlicht): `node --env-file=.env.local e2e/start-ticket.mjs`
Expected: FAIL bei „/kontakt lädt keine Prospektbilder (1)“.

- [ ] **Step 2: Titelseite verzögert, ein gemeinsamer Link für alle Knöpfe**

`components/home/flyer-ticket.tsx`: im `<img … alt="Titelseite des aktuellen Prospekts" …>` nach `alt="…"` die Attribute
`loading="lazy" decoding="async"` ergänzen.

`lib/data/flyers.ts`: Imports ergänzen und anfügen:

```ts
import { markt } from "@/content/markt";
import { flyerLink, pickFlyers, shownFlyer, type FlyerRecord } from "@/lib/prospekt/select";
```

(der bisherige Import `import type { FlyerRecord } from "@/lib/prospekt/select";` entfällt dafür)

```ts
/** Ziel aller „Prospekt“-Knöpfe: der eigene Viewer, wenn ein Prospekt online ist – sonst der REWE-Prospekt. */
export const currentFlyerLink = cache(async () => flyerLink(shownFlyer(pickFlyers(await publishedFlyers(), new Date())), markt.links.flyer));
```

`app/(site)/layout.tsx`: `const [flyers, hours] = await Promise.all([publishedFlyers(), hoursConfig()]);` und die Zeile
`const flyer = flyerLink(shownFlyer(pickFlyers(flyers, new Date())), markt.links.flyer);` (samt Kommentar darüber) ersetzen durch:

```tsx
  // „Prospekt“-Knöpfe: zum eigenen Viewer, wenn der Markt einen Prospekt hochgeladen hat, sonst zu rewe.de
  const [flyer, hours] = await Promise.all([currentFlyerLink(), hoursConfig()]);
```

Imports dort: `publishedFlyers` → `currentFlyerLink` (aus `@/lib/data/flyers`); `flyerLink, pickFlyers, shownFlyer` und `markt` entfernen,
wenn sonst nicht genutzt (`npm run lint` meldet es).

`app/(site)/page.tsx`: `const flyer = flyerLink(shown, markt.links.flyer);` → `const flyer = await currentFlyerLink();`
(Import ergänzen; `flyerLink` aus dem Import entfernen).

`app/(site)/markt/page.tsx`: `export default function MarktPage() {` → `export default async function MarktPage() {`, als erste Zeile
`const flyer = await currentFlyerLink();`; im Seitenkopf `<ButtonLink href={markt.links.flyer} external size="sm">` →
`<ButtonLink href={flyer.href} external={flyer.external} size="sm">`. Import `import { currentFlyerLink } from "@/lib/data/flyers";`.

`app/(site)/kontakt/page.tsx`: ebenso `async`, `const flyer = await currentFlyerLink();` als erste Zeile; in der Karte „Angebote“
`<ButtonLink href={markt.links.flyer} external variant="ink">` → `<ButtonLink href={flyer.href} external={flyer.external} variant="ink">`.

- [ ] **Step 3: Grün sehen und Commit**

```bash
npx tsc --noEmit -p . && npm run lint && npm test
pkill -f "next start -p 3100"; npm run build >/dev/null && (npx next start -p 3100 > "$SCRATCH/rr-start.log" 2>&1 &) ; sleep 5
node --env-file=.env.local e2e/start-ticket.mjs
```

Expected: alle ✓, darunter „/kontakt lädt keine Prospektbilder (0)“ und beide Knöpfe → `/angebote#prospekt`.

```bash
git add components/home/flyer-ticket.tsx lib/data/flyers.ts "app/(site)" e2e/start-ticket.mjs
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Tempo: Titelseite erst bei Bedarf laden; alle Prospekt-Knöpfe führen auf den eigenen Viewer"
```

---

### Task 2: Prospektbilder über die Bildoptimierung

**Files:**
- Create: `components/prospekt/flyer-image.tsx`
- Modify: `components/prospekt/flyer-viewer.tsx`, `components/home/flyer-ticket.tsx`, `e2e/prospekt-viewer.mjs`

**Interfaces:**
- Consumes: `flyerImage(flyer, page, size)` aus `lib/prospekt/urls.ts`, `FlyerRecord`.
- Produces: `FlyerImage({ flyer, page, size: "thumb" | "full", sizes, priority?, alt?, className? })`,
  `flyerZoomSrc(flyer, page): string` (1 920 px, Qualität 85), `flyerMiniSrc(flyer, page): string` (384 px, Qualität 75).

- [ ] **Step 1: Browser-Test erweitern (rot)**

In `e2e/prospekt-viewer.mjs` direkt vor `await page.goto(`${BASE}/angebote`, { waitUntil: "networkidle0" });` einfügen:

```js
// Bildgewicht beim Laden: nur fertig übertragene Bilder zählen
const cdp = await page.createCDPSession();
await cdp.send("Network.enable");
const kinds = new Map();
const imageBytes = new Map();
cdp.on("Network.responseReceived", (e) => kinds.set(e.requestId, e.type));
cdp.on("Network.loadingFinished", (e) => {
  if (kinds.get(e.requestId) === "Image") imageBytes.set(e.requestId, e.encodedDataLength);
});
```

und direkt nach dem `page.goto(…/angebote…)`:

```js
await new Promise((r) => setTimeout(r, 1500));
check((await page.$eval("[data-flyer-page] img", (i) => i.currentSrc)).includes("/_next/image"), "Prospektseiten über die Bildoptimierung (AVIF/WebP)");
const imageKb = Math.round([...imageBytes.values()].reduce((a, b) => a + b, 0) / 1024);
check(imageKb <= 700, `Bilder beim Laden ${imageKb} KB (≤ 700)`);
```

Run: `node e2e/prospekt-viewer.mjs` – Expected: FAIL bei „Prospektseiten über die Bildoptimierung“.

- [ ] **Step 2: `FlyerImage`**

`components/prospekt/flyer-image.tsx`:

```tsx
import Image, { getImageProps } from "next/image";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { flyerImage } from "@/lib/prospekt/urls";

type FlyerPick = Pick<FlyerRecord, "id" | "format" | "page_count" | "page_width" | "page_height">;

const THUMB = 480;
const thumbHeight = (f: FlyerPick) => Math.round((f.page_height / f.page_width) * THUMB);

/**
 * Prospektseite über die Next-Bildoptimierung: AVIF/WebP in der angezeigten Breite statt der hochgeladenen JPEG/WebP-Dateien
 * (Vorschau ~200 KB → ~30 KB). Wirkt auch für schon hochgeladene Prospekte; die Quelle bleibt der Rewrite /prospekt-bilder.
 */
export function FlyerImage({
  flyer,
  page,
  size,
  sizes,
  priority = false,
  alt,
  className,
}: {
  flyer: FlyerPick;
  page: number;
  size: "thumb" | "full";
  sizes: string;
  priority?: boolean;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={flyerImage(flyer, page, size)}
      width={size === "thumb" ? THUMB : flyer.page_width}
      height={size === "thumb" ? thumbHeight(flyer) : flyer.page_height}
      sizes={sizes}
      quality={size === "thumb" ? 75 : 85}
      alt={alt ?? `Prospektseite ${page} von ${flyer.page_count}`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}

/** Große Fassung für die Vergrößerung (PhotoSwipe): bis 1 920 px, Qualität 85 */
export function flyerZoomSrc(flyer: FlyerPick, page: number) {
  return getImageProps({ src: flyerImage(flyer, page, "full"), width: flyer.page_width, height: flyer.page_height, sizes: "100vw", quality: 85, alt: "" }).props.src;
}

/** Kleine Fassung als Platzhalter in der Vergrößerung, bis die große geladen ist */
export function flyerMiniSrc(flyer: FlyerPick, page: number) {
  return getImageProps({ src: flyerImage(flyer, page, "thumb"), width: 192, height: Math.round((flyer.page_height / flyer.page_width) * 192), quality: 75, alt: "" }).props.src;
}
```

- [ ] **Step 3: Raster, Vergrößerung und Ticket umstellen**

`components/prospekt/flyer-viewer.tsx`:
- Import `import { flyerImage } from "@/lib/prospekt/urls";` ersetzen durch
  `import { FlyerImage, flyerMiniSrc, flyerZoomSrc } from "./flyer-image";`.
- Im `dataSource` von PhotoSwipe: `src: flyerImage(flyer, i + 1, "full"),` → `src: flyerZoomSrc(flyer, i + 1),` und
  `msrc: flyerImage(flyer, i + 1, "thumb"),` → `msrc: flyerMiniSrc(flyer, i + 1),`.
- Im Raster das `<img …>` samt `eslint-disable`-Kommentar ersetzen durch:

```tsx
              <FlyerImage
                flyer={flyer}
                page={i + 1}
                size="thumb"
                sizes={i === 0 ? "(min-width: 64rem) 46vw, (min-width: 40rem) 62vw, 92vw" : "(min-width: 64rem) 22vw, (min-width: 40rem) 30vw, 45vw"}
                priority={i === 0}
                className="h-auto w-full transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-[1.02]"
              />
```

`components/home/flyer-ticket.tsx`: Import `import Image from "next/image";`; das `<img src={cover.src} … />` samt
`eslint-disable`-Kommentar ersetzen durch:

```tsx
            <Image
              src={cover.src}
              width={cover.width}
              height={cover.height}
              sizes="(min-width: 80rem) 12rem, (min-width: 48rem) 9rem, 10rem"
              quality={75}
              alt="Titelseite des aktuellen Prospekts"
              className="h-auto w-full"
            />
```

(`next/image` lädt ohne Angabe verzögert – der Prefetch der Startseite lädt die Titelseite also weiter nicht mit.)

- [ ] **Step 4: Grün sehen und Commit**

```bash
npx tsc --noEmit -p . && npm run lint && npm test
pkill -f "next start -p 3100"; npm run build >/dev/null && (npx next start -p 3100 > "$SCRATCH/rr-start.log" 2>&1 &) ; sleep 5
node e2e/prospekt-viewer.mjs && node --env-file=.env.local e2e/start-ticket.mjs
```

Expected: alle ✓; „Bilder beim Laden … KB (≤ 700)“ mit deutlich unter 700 KB; Ticket zeigt und lädt die Titelseite weiter.

```bash
git add components/prospekt components/home/flyer-ticket.tsx e2e/prospekt-viewer.mjs
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Tempo: Prospektseiten und Titelseite über die Bildoptimierung (AVIF/WebP), Vergrößerung ohne 1-MB-Originale"
```

---

### Task 3: Prospektseite – Blätter-Ansicht

**Files:**
- Create: `lib/prospekt/pager.ts`, `lib/prospekt/pager.test.ts`, `components/prospekt/flyer-pager.tsx`
- Modify: `components/prospekt/flyer-viewer.tsx`, `app/(site)/angebote/page.tsx`, `e2e/prospekt-viewer.mjs`

**Interfaces:**
- Consumes: Task 2 (`FlyerImage`, `flyerZoomSrc`, `flyerMiniSrc`); `linkTarget`, `FlyerRecord` aus `lib/prospekt/select.ts`;
  `ShareButton({ url, title, text, label, size })` aus `components/ui/share-button.tsx`.
- Produces: `pageLabel(visible, total): string`, `nearPages(visible, total, radius = 2): number[]`,
  `pagerTarget(page, total, spreads): number`; `FlyerPager({ flyer, onOpen(page), ref })` mit `PagerHandle { show(page); focus(page) }`;
  `FlyerViewer({ weeks, defaultTab, shareUrl })` (neue Prop `shareUrl`); Test-Haken `[data-pager-page]`, `[data-flyer-page]`
  (Schaltfläche einer Seite in der Leiste), `[data-flyer-grid-page]` („Alle Seiten“), `[data-strip-page]`.

- [ ] **Step 1: Unit-Tests (rot)**

`lib/prospekt/pager.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { nearPages, pageLabel, pagerTarget } from "./pager";

describe("pageLabel", () => {
  it("eine Seite, Doppelseite, unsortiert, leer", () => {
    expect(pageLabel([3], 34)).toBe("Seite 3 von 34");
    expect(pageLabel([5, 4], 34)).toBe("Seite 4–5 von 34");
    expect(pageLabel([], 34)).toBe("Seite 1 von 34");
    expect(pageLabel([1], 1)).toBe("Seite 1 von 1");
  });
});

describe("nearPages", () => {
  it("sichtbare Seiten und zwei davor und danach, innerhalb des Prospekts", () => {
    expect(nearPages([1], 34)).toEqual([1, 2, 3]);
    expect(nearPages([4, 5], 34)).toEqual([2, 3, 4, 5, 6, 7]);
    expect(nearPages([34], 34)).toEqual([32, 33, 34]);
    expect(nearPages([1], 1)).toEqual([1]);
  });
});

describe("pagerTarget", () => {
  it("einzelne Seiten: die Seite selbst, begrenzt auf 1 bis Seitenzahl", () => {
    expect(pagerTarget(3, 34, false)).toBe(3);
    expect(pagerTarget(0, 34, false)).toBe(1);
    expect(pagerTarget(99, 34, false)).toBe(34);
  });
  it("Doppelseiten: Titelseite allein, ungerade Seiten springen zur geraden davor", () => {
    expect(pagerTarget(1, 34, true)).toBe(1);
    expect(pagerTarget(2, 34, true)).toBe(2);
    expect(pagerTarget(3, 34, true)).toBe(2);
    expect(pagerTarget(33, 34, true)).toBe(32);
    expect(pagerTarget(34, 34, true)).toBe(34);
    expect(pagerTarget(3, 3, true)).toBe(2);
    expect(pagerTarget(1, 1, true)).toBe(1);
  });
});
```

Run: `npx vitest run lib/prospekt/pager.test.ts` – Expected: FAIL (`Cannot find module './pager'`).

- [ ] **Step 2: Logik (grün)**

`lib/prospekt/pager.ts`:

```ts
/** „Seite 3 von 34“ bzw. „Seite 4–5 von 34“ für die gerade sichtbaren Seiten der Blätter-Leiste */
export function pageLabel(visible: readonly number[], total: number): string {
  const v = [...visible].sort((a, b) => a - b);
  if (!v.length) return `Seite 1 von ${total}`;
  const first = v[0];
  const last = v[v.length - 1];
  return first === last ? `Seite ${first} von ${total}` : `Seite ${first}–${last} von ${total}`;
}

/** Seiten, deren Bild geladen wird: die sichtbaren und `radius` Seiten davor und danach */
export function nearPages(visible: readonly number[], total: number, radius = 2): number[] {
  const out = new Set<number>();
  for (const p of visible) for (let q = p - radius; q <= p + radius; q++) if (q >= 1 && q <= total) out.add(q);
  return [...out].sort((a, b) => a - b);
}

/**
 * Seite, an deren Anfang die Leiste springt. Mit Doppelseiten (ab 1024 px) steht die Titelseite allein, danach beginnen
 * die Paare bei geraden Seiten – eine ungerade Seite > 1 liegt rechts in der Doppelseite davor.
 */
export function pagerTarget(page: number, total: number, spreads: boolean): number {
  const p = Math.min(Math.max(1, Math.round(page)), Math.max(1, total));
  return spreads && p > 1 && p % 2 === 1 ? p - 1 : p;
}
```

Run: `npx vitest run lib/prospekt/pager.test.ts` – Expected: PASS.

- [ ] **Step 3: Browser-Test für die Blätter-Ansicht (rot)**

`e2e/prospekt-viewer.mjs` (ganze Datei):

```js
// node e2e/prospekt-viewer.mjs – braucht einen veröffentlichten Prospekt der laufenden Woche (z. B. KW 41 aus dem Cockpit oder
// KEEP=1 node --env-file=.env.local e2e/cockpit-prospekt.mjs). Liest nur.
import { BASE, browser, check } from "./lib.mjs";

const b = await browser();
const third = new Set();
const watchThird = (p) =>
  p.on("request", (r) => {
    const u = new URL(r.url());
    if (!["localhost", "127.0.0.1"].includes(u.hostname) && u.protocol.startsWith("http")) third.add(u.hostname);
  });
const LABEL = '[aria-label="Prospektseiten"] [aria-live]';
const label = (p) => p.$eval(LABEL, (e) => e.textContent.trim());
const waitLabel = (p, text) => p.waitForFunction((s, t) => document.querySelector(s)?.textContent.includes(t), { timeout: 8000 }, LABEL, text).then(() => true, () => false);
const pressButton = (p, text) => p.evaluate((t) => [...document.querySelectorAll('[aria-label="Prospektseiten"] button')].find((x) => x.textContent.includes(t))?.click(), text);

const page = await b.newPage();
watchThird(page);
await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
// ohne Animationen: PhotoSwipe ignoriert Tasten bis zum Ende der Öffnungsanimation; die Leiste scrollt sofort
await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);

// Bildgewicht beim Laden: nur fertig übertragene Bilder zählen
const cdp = await page.createCDPSession();
await cdp.send("Network.enable");
const kinds = new Map();
const imageBytes = new Map();
cdp.on("Network.responseReceived", (e) => kinds.set(e.requestId, e.type));
cdp.on("Network.loadingFinished", (e) => {
  if (kinds.get(e.requestId) === "Image") imageBytes.set(e.requestId, e.encodedDataLength);
});

await page.goto(`${BASE}/angebote`, { waitUntil: "networkidle0" });
await new Promise((r) => setTimeout(r, 1500));
check((await page.$eval("[data-flyer-page] img", (i) => i.currentSrc)).includes("/_next/image"), "Prospektseiten über die Bildoptimierung (AVIF/WebP)");
const imageKb = Math.round([...imageBytes.values()].reduce((a, c) => a + c, 0) / 1024);
check(imageKb <= 700, `Bilder beim Laden ${imageKb} KB (≤ 700)`);

const total = Number((await label(page)).match(/von (\d+)/)?.[1]);
check((await label(page)) === `Seite 1 von ${total}`, `Blätter-Ansicht startet bei Seite 1 (${total} Seiten)`);
check((await page.$eval("[data-flyer-page] img", (i) => i.getAttribute("alt"))).startsWith("Prospektseite 1 von"), "Alt-Text „Prospektseite 1 von …“");

// „Weiter“ per Tastatur
await page.evaluate(() => [...document.querySelectorAll('[aria-label="Prospektseiten"] button')].find((x) => x.textContent.includes("Weiter"))?.focus());
await page.keyboard.press("Enter");
check(await waitLabel(page, "Seite 2 von"), "„Weiter“ per Tastatur → Seite 2");
// Wischen (waagerechtes Scrollen der Leiste)
await page.$eval('[aria-label="Prospektseiten"] ul', (u) => u.scrollBy({ left: u.clientWidth, behavior: "instant" }));
check(await waitLabel(page, "Seite 3 von"), "Wischen → Seite 3");
// Pfeiltaste auf einer Seite
await page.focus('[data-pager-page="3"] button');
await page.keyboard.press("ArrowLeft");
check(await waitLabel(page, "Seite 2 von"), "Pfeiltaste ← auf einer Seite → Seite 2");
// Vorschau-Leiste springt
await page.$eval('[data-strip-page="5"] button', (x) => x.click());
check(await waitLabel(page, "Seite 5 von"), "Vorschau-Leiste: Seite 5");

// Antippen öffnet die Vergrößerung an dieser Seite
await page.$eval('[data-pager-page="5"] button', (x) => x.click());
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /5\s*\/\s*\d+/.test(e.textContent)), "Antippen öffnet die Vergrößerung bei Seite 5");
check((await page.$eval(".pswp__img:not(.pswp__img--placeholder)", (i) => i.getAttribute("src")).catch(() => "")).includes("/_next/image"), "Vergrößerung lädt über die Bildoptimierung");
await page.keyboard.press("ArrowRight");
await page.waitForFunction(() => new URLSearchParams(location.search).get("seite") === "6");
const kw = await page.evaluate(() => new URLSearchParams(location.search).get("kw"));
const shownKw = await page.$eval("#prospekt", (e) => e.textContent.match(/KW (\d+) ·/)?.[1]);
check(kw === shownKw, `Pfeiltaste blättert, Adresse zeigt ?kw=${kw}&seite=6 (Woche im Link)`);
await page.keyboard.press("Escape");
await page.waitForFunction(() => !document.querySelector(".pswp--open"));
check(await waitLabel(page, "Seite 6 von"), "nach dem Schließen steht die Leiste auf Seite 6");
check(
  await page.evaluate(() => document.activeElement?.closest("[data-pager-page]")?.getAttribute("data-pager-page") === "6" && !location.search.includes("seite") && !location.search.includes("kw")),
  "Esc: Fokus auf Seite 6, Adresse ohne ?kw&seite",
);

// alle Seiten zum Aufklappen
await page.$eval("#prospekt details summary", (s) => s.click());
check((await page.$$("[data-flyer-grid-page]")).length === total, `„Alle Seiten“ zeigt ${total} Seiten`);

// geteilte Links
await page.goto(`${BASE}/angebote?seite=2`, { waitUntil: "load" });
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /2\s*\/\s*\d+/.test(e.textContent)), "Link mit ?seite=2 (ohne Woche, ältere Links) öffnet Seite 2");
// „load“ statt „networkidle0“: beim Wechsel weg von einem offenen Viewer meldet Puppeteer unter dem Service Worker
// sonst gelegentlich nie Netzruhe (Seite und Server antworten dabei normal)
await page.goto(`${BASE}/angebote?kw=${kw}&seite=3`, { waitUntil: "load" });
await page.waitForSelector(".pswp--open", { timeout: 10000 });
check(await page.$eval(".pswp__counter", (e) => /3\s*\/\s*\d+/.test(e.textContent)), `Link mit ?kw=${kw}&seite=3 öffnet Seite 3`);
await page.keyboard.press("Escape");
check(await waitLabel(page, "Seite 3 von"), "nach dem Link steht die Leiste auf Seite 3");
await page.goto(`${BASE}/angebote?kw=1&seite=2`, { waitUntil: "load" });
await page.waitForSelector("[data-flyer-page]");
await new Promise((r) => setTimeout(r, 2000)); // Zeit zum Hydrieren und für den Effekt, der Links öffnet
check(!(await page.$(".pswp--open")), "Link einer Woche, die nicht mehr online ist, öffnet keine fremde Seite");

// Desktop: Titelseite allein, danach Doppelseiten
const desk = await b.newPage();
watchThird(desk);
await desk.setViewport({ width: 1280, height: 900 });
await desk.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
await desk.goto(`${BASE}/angebote`, { waitUntil: "networkidle0" });
check((await label(desk)) === `Seite 1 von ${total}`, "Desktop: Titelseite allein");
await pressButton(desk, "Weiter");
check(await waitLabel(desk, `Seite 2–3 von ${total}`), "Desktop: „Weiter“ → Doppelseite 2–3");
await pressButton(desk, "Weiter");
check(await waitLabel(desk, `Seite 4–5 von ${total}`), "Desktop: „Weiter“ → Doppelseite 4–5");

check(third.size === 0, `keine Drittanbieter-Anfragen (${[...third].join(",") || "keine"})`);
await b.close();
```

Run: `node e2e/prospekt-viewer.mjs` – Expected: FAIL bei „Blätter-Ansicht startet bei Seite 1“ (die Leiste fehlt; `label` findet kein Element).

- [ ] **Step 4: Blätter-Leiste**

`components/prospekt/flyer-pager.tsx`:

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useImperativeHandle, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { nearPages, pageLabel, pagerTarget } from "@/lib/prospekt/pager";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { cn } from "@/lib/utils";
import { FlyerImage } from "./flyer-image";

export interface PagerHandle {
  /** Leiste ohne Animation auf diese Seite stellen (Seiten ab 1) */
  show(page: number): void;
  /** Fokus auf die Schaltfläche dieser Seite */
  focus(page: number): void;
}

const SPREADS = "(min-width: 64rem)";
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const NAV_BTN =
  "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-soft px-4 font-semibold transition-transform duration-150 active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100";

/**
 * Blätter-Ansicht: waagerechte Leiste mit Scroll-Snap. Bis 1024 px eine Seite je Schritt, darüber die Titelseite allein und
 * danach Doppelseiten wie im gedruckten Prospekt (nur CSS). Bilder laden nur in der Nähe der sichtbaren Seiten;
 * Antippen öffnet die Vergrößerung. Darunter Pfeile mit Seitenanzeige und eine Vorschau-Leiste zum Springen.
 */
export function FlyerPager({ flyer, onOpen, ref }: { flyer: FlyerRecord; onOpen: (page: number) => void; ref?: Ref<PagerHandle> }) {
  const total = flyer.page_count;
  const track = useRef<HTMLUListElement>(null);
  const strip = useRef<HTMLUListElement>(null);
  const [visible, setVisible] = useState<number[]>([1]);
  const [loaded, setLoaded] = useState<number[]>(() => nearPages([1], total));

  const scrollToPage = useCallback(
    (page: number, smooth: boolean) => {
      const t = track.current;
      const target = pagerTarget(page, total, window.matchMedia(SPREADS).matches);
      const item = t?.querySelector<HTMLElement>(`[data-pager-page="${target}"]`);
      if (t && item) t.scrollTo({ left: item.offsetLeft, behavior: smooth && !reduced() ? "smooth" : "auto" });
    },
    [total],
  );

  useImperativeHandle(
    ref,
    () => ({
      show: (page) => scrollToPage(page, false),
      focus: (page) => track.current?.querySelector<HTMLElement>(`[data-pager-page="${page}"] button`)?.focus({ preventScroll: true }),
    }),
    [scrollToPage],
  );

  // sichtbare Seiten (≥ 60 % in der Leiste) → Anzeige, Pfeile, Vorschau-Leiste und nachzuladende Bilder
  useEffect(() => {
    const t = track.current;
    if (!t) return;
    const shown = new Set<number>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const p = Number((e.target as HTMLElement).dataset.pagerPage);
          if (e.isIntersecting) shown.add(p);
          else shown.delete(p);
        }
        if (!shown.size) return;
        const now = [...shown].sort((a, b) => a - b);
        setVisible(now);
        setLoaded((prev) => [...new Set([...prev, ...nearPages(now, total)])]);
      },
      { root: t, threshold: 0.6 },
    );
    t.querySelectorAll("[data-pager-page]").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [total]);

  // aktuelle Seite in der Vorschau-Leiste sichtbar halten – nur waagerecht, die Seite selbst scrollt nicht
  useEffect(() => {
    const s = strip.current;
    const thumb = s?.querySelector<HTMLElement>(`[data-strip-page="${visible[0]}"]`);
    if (s && thumb) s.scrollTo({ left: thumb.offsetLeft - s.clientWidth / 2 + thumb.clientWidth / 2, behavior: reduced() ? "auto" : "smooth" });
  }, [visible]);

  const step = (dir: 1 | -1) => {
    const t = track.current;
    if (t) t.scrollBy({ left: dir * t.clientWidth, behavior: reduced() ? "auto" : "smooth" });
  };
  const onKeyDown = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    step(e.key === "ArrowRight" ? 1 : -1);
  };
  const pages = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <section aria-label="Prospektseiten" className="mt-6">
      <ul
        ref={track}
        onKeyDown={onKeyDown}
        className="relative flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {pages.map((p) => (
          <li
            key={p}
            data-pager-page={p}
            className={cn(
              "flex w-full shrink-0 snap-start justify-center px-1",
              p === 1 ? "lg:w-full" : "lg:w-1/2",
              p > 1 && (p % 2 === 0 ? "lg:justify-end" : "lg:snap-align-none lg:justify-start"),
            )}
          >
            <button
              type="button"
              data-flyer-page
              onClick={() => onOpen(p)}
              aria-label={`Prospektseite ${p} von ${total} vergrößern`}
              className="block w-full overflow-hidden rounded-xl bg-white ring-1 ring-line lg:w-auto"
            >
              {loaded.includes(p) ? (
                <FlyerImage
                  flyer={flyer}
                  page={p}
                  size="full"
                  sizes="(min-width: 64rem) 40vw, 92vw"
                  priority={p === 1}
                  className="h-auto w-full lg:h-[min(78svh,56rem)] lg:w-auto"
                />
              ) : (
                <span aria-hidden className="block w-full bg-soft lg:h-[min(78svh,56rem)] lg:w-auto" style={{ aspectRatio: `${flyer.page_width} / ${flyer.page_height}` }} />
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" onClick={() => step(-1)} disabled={visible[0] === 1} className={NAV_BTN}>
          <ChevronLeft className="size-5" aria-hidden /> Zurück
        </button>
        <p aria-live="polite" className="font-semibold tabular-nums">
          {pageLabel(visible, total)}
        </p>
        <button type="button" onClick={() => step(1)} disabled={visible.includes(total)} className={NAV_BTN}>
          Weiter <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <nav aria-label="Seiten im Überblick" className="mt-4">
        <ul ref={strip} className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]">
          {pages.map((p) => (
            <li key={p} data-strip-page={p} className="shrink-0">
              <button
                type="button"
                onClick={() => scrollToPage(p, true)}
                aria-current={visible.includes(p) ? "true" : undefined}
                aria-label={`Seite ${p}`}
                className={cn("block w-12 overflow-hidden rounded-md ring-2 sm:w-14", visible.includes(p) ? "ring-red" : "ring-transparent")}
              >
                <FlyerImage flyer={flyer} page={p} size="thumb" sizes="56px" alt="" className="h-auto w-full" />
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
```

- [ ] **Step 5: Viewer umbauen**

`components/prospekt/flyer-viewer.tsx`:
- Imports: `import { ChevronDown } from "lucide-react";`, `import { ShareButton } from "@/components/ui/share-button";`,
  `import { FlyerPager, type PagerHandle } from "./flyer-pager";` ergänzen.
- Signatur: `export function FlyerViewer({ weeks, defaultTab }: { weeks: ViewerWeek[]; defaultTab: "current" | "next" })` →
  `export function FlyerViewer({ weeks, defaultTab, shareUrl }: { weeks: ViewerWeek[]; defaultTab: "current" | "next"; shareUrl: string })`.
- `const buttons = useRef<(HTMLButtonElement | null)[]>([]);` → `const pager = useRef<PagerHandle>(null);`.
- Im `destroy`-Handler von PhotoSwipe `buttons.current[current]?.focus();` ersetzen durch:

```tsx
        pager.current?.show(current + 1);
        pager.current?.focus(current + 1);
```

- Im Effekt für geteilte Links `if (linked && target.page) void open(linked, target.page - 1);` ersetzen durch:

```tsx
    if (linked && target.page) {
      pager.current?.show(target.page);
      void open(linked, target.page - 1);
    }
```

- Den ganzen Block ab `<p className="mt-5 font-semibold">` bis zum Ende des Rasters (`</ul>`) ersetzen durch:

```tsx
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold">
          KW {week.kw} · {week.range}
        </p>
        <ShareButton url={shareUrl} title="Prospekt der Woche – REWE Rödelheim" text={`Die Angebote bei REWE Rödelheim (KW ${week.kw}):`} label="Teilen" size="sm" />
      </div>
      <FlyerPager key={flyer.id} ref={pager} flyer={flyer} onOpen={(p) => void open(week, p - 1)} />
      <details className="group mt-8 rounded-[1.5rem] bg-soft p-4 md:p-6">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
          Alle {flyer.page_count} Seiten ansehen
          <ChevronDown className="size-5 transition-transform group-open:rotate-180 motion-reduce:transition-none" aria-hidden />
        </summary>
        <ul className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:gap-3 lg:grid-cols-6">
          {Array.from({ length: flyer.page_count }, (_, i) => (
            <li key={`${flyer.id}-${i}`}>
              <button
                type="button"
                data-flyer-grid-page
                onClick={() => void open(week, i)}
                className="block w-full overflow-hidden rounded-xl bg-white ring-1 ring-line transition-transform duration-150 active:scale-[0.98]"
                aria-label={`Prospektseite ${i + 1} von ${flyer.page_count} vergrößern`}
              >
                <FlyerImage flyer={flyer} page={i + 1} size="thumb" sizes="(min-width: 64rem) 15vw, (min-width: 40rem) 23vw, 31vw" className="h-auto w-full" />
              </button>
            </li>
          ))}
        </ul>
      </details>
```

- Den Kopfkommentar der Komponente anpassen: „Prospekt als Blätter-Ansicht (FlyerPager), Übersicht aller Seiten zum Aufklappen und
  Vollbild-Viewer (PhotoSwipe, erst beim Öffnen geladen) …“.

`app/(site)/angebote/page.tsx`: `<FlyerViewer weeks={weeks} defaultTab={choice.defaultTab} />` →
`<FlyerViewer weeks={weeks} defaultTab={choice.defaultTab} shareUrl={absoluteUrl("/angebote")} />`.

- [ ] **Step 6: Grün sehen und Commit**

```bash
npx tsc --noEmit -p . && npm run lint && npm test
pkill -f "next start -p 3100"; npm run build >/dev/null && (npx next start -p 3100 > "$SCRATCH/rr-start.log" 2>&1 &) ; sleep 5
node e2e/prospekt-viewer.mjs && node e2e/public-qa.mjs /angebote
```

Expected: Unit-Tests grün; Viewer-Test alle ✓ (Mobil: Tastatur, Wischen, Pfeiltaste, Vorschau-Leiste, Vergrößerung, Links;
Desktop: Titelseite allein, dann 2–3 und 4–5); `public-qa` für `/angebote` ohne axe-Befund, ohne Überlauf bei 320 px.

```bash
git add lib/prospekt/pager.ts lib/prospekt/pager.test.ts components/prospekt "app/(site)/angebote/page.tsx" e2e/prospekt-viewer.mjs
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Prospektseite: Blätter-Ansicht (Doppelseiten ab 1024 px), Vorschau-Leiste, alle Seiten zum Aufklappen"
```

---

### Task 4: Rote Seitenköpfe und transparente Kopfleiste

**Files:**
- Create: `lib/site.test.ts`, `e2e/seitenkopf.mjs`
- Modify: `lib/site.ts`, `components/layout/page-header.tsx`, `components/layout/site-header.tsx`, `components/home/story-hero.tsx`,
  `app/(site)/markt/page.tsx`, `app/(site)/kontakt/page.tsx`, `app/(site)/karriere/page.tsx`, `app/(site)/aktuelles/page.tsx`,
  `app/(site)/aktuelles/[slug]/page.tsx`, `app/(site)/angebote/page.tsx`

**Interfaces:**
- Consumes: Task 1 (`currentFlyerLink` in `/markt`).
- Produces: `hasHero(pathname): boolean` (`lib/site.ts`); `PageHeader` mit `tone?: "plain" | "red"` und `mark?: string`;
  roter Kopf trägt `data-hero`.

- [ ] **Step 1: Tests (rot)**

`lib/site.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { hasHero } from "./site";

describe("hasHero", () => {
  it("rote Köpfe: Startseite, Angebote, Markt, Kontakt, Karriere, Aktuelles und Beiträge", () => {
    for (const p of ["/", "/angebote", "/markt", "/kontakt", "/karriere", "/aktuelles", "/aktuelles/resilienzwoche-2026"]) expect(hasHero(p)).toBe(true);
  });
  it("schlichte Seiten bleiben weiß", () => {
    for (const p of ["/impressum", "/datenschutz", "/karriere/bewerben", "/feedback", "/aushang", "/cockpit", "/gibts-nicht", "/aktuelles/a/b"]) expect(hasHero(p)).toBe(false);
  });
});
```

`e2e/seitenkopf.mjs`:

```js
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
```

Run: `npx vitest run lib/site.test.ts` – Expected: FAIL (`hasHero is not a function`).
Run: `node e2e/seitenkopf.mjs` – Expected: FAIL bei „/angebote 390px: roter Kopf, Leiste transparent“.

- [ ] **Step 2: `hasHero`**

In `lib/site.ts` anfügen:

```ts
/** Seiten mit rotem Kopf: Die Kopfleiste liegt dort anfangs transparent darüber – schon im Server-HTML, ohne Aufblitzen. */
const HERO_PAGES = new Set(["/", "/angebote", "/markt", "/kontakt", "/karriere", "/aktuelles"]);
export const hasHero = (pathname: string) => HERO_PAGES.has(pathname) || /^\/aktuelles\/[^/]+$/.test(pathname);
```

Run: `npx vitest run lib/site.test.ts` – Expected: PASS.

- [ ] **Step 3: Roter Seitenkopf**

`components/layout/page-header.tsx` (ganze Datei):

```tsx
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Kopf einer Unterseite: Brotkrumen, Dachzeile, H1, Einleitung, optional Inhalt darunter. `tone="red"` wie der Hero der
 * Startseite (weiße Schrift, großes blasses Wort `mark`); er liegt unter der transparenten Kopfleiste (`data-hero`, lib/site.ts → hasHero).
 */
export function PageHeader({
  eyebrow,
  title,
  lede,
  crumbs = [],
  children,
  className,
  tone = "plain",
  mark,
}: {
  eyebrow?: string;
  title: ReactNode;
  lede?: ReactNode;
  crumbs?: { href: string; label: string }[];
  children?: ReactNode;
  className?: string;
  tone?: "plain" | "red";
  mark?: string;
}) {
  const red = tone === "red";
  const link = red ? "underline-offset-4 hover:underline" : "hover:text-ink hover:underline";
  const inner = (
    <div className={cn("wrap", red ? "relative pt-28 pb-14 md:pt-36 md:pb-20" : "pt-12 pb-14 md:pt-20 md:pb-20", className)}>
      {crumbs.length > 0 && (
        <nav aria-label="Brotkrumen" className={cn("mb-9 text-[0.875rem]", red ? "text-white" : "text-muted")}>
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href="/" className={link}>
                Start
              </Link>
            </li>
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-2">
                <span aria-hidden>/</span>
                {i === crumbs.length - 1 ? (
                  <span aria-current="page" className={red ? "font-semibold" : "text-ink"}>
                    {c.label}
                  </span>
                ) : (
                  <Link href={c.href} className={link}>
                    {c.label}
                  </Link>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {eyebrow && (
        <p className={cn("text-eyebrow mb-4 flex items-center gap-2.5", red ? "text-white" : "text-red")}>
          <span aria-hidden className={cn("h-px w-6 shrink-0", red ? "bg-white/60" : "bg-red/45")} />
          {eyebrow}
        </p>
      )}
      <h1 className="max-w-[18ch] text-h1">{title}</h1>
      {lede && <p className={cn("mt-5 max-w-[56ch] text-lede", red ? "text-white" : "text-muted")}>{lede}</p>}
      {children}
    </div>
  );
  if (!red) return inner;
  return (
    <section data-hero className="on-dark relative isolate -mt-[4.5rem] mb-12 overflow-hidden bg-red text-white md:mb-20">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-48 -left-48 size-[38rem] rounded-full bg-red-bright/35 blur-[120px]" />
        <div className="absolute -right-40 -bottom-56 size-[44rem] rounded-full bg-red-deep blur-[120px]" />
        {mark && (
          <p className="absolute inset-x-0 -bottom-[0.2em] font-display text-[26vw] leading-none font-extrabold tracking-[-0.06em] whitespace-nowrap text-white/[0.07] select-none lg:text-[16vw]">
            {mark}
          </p>
        )}
      </div>
      {inner}
    </section>
  );
}
```

- [ ] **Step 4: Kopfleiste**

`components/layout/site-header.tsx`:
- `import { NAV } from "@/lib/site";` → `import { hasHero, NAV } from "@/lib/site";`
- Kommentar „Auf der Startseite liegt sie transparent über der Story …“ → „Über roten Köpfen (Startseite, `hasHero`) liegt sie
  transparent, bis der Kopf (`[data-hero]`) weggescrollt ist; sonst weiß.“
- `const overHero = pathname === "/" && atTop;` → `const overHero = hasHero(pathname) && atTop;`
- Im Scroll-Effekt `const onScroll = () => setAtTop(window.scrollY < window.innerHeight - 96);` ersetzen durch:

```tsx
    // transparent, solange der rote Kopf unter der Leiste liegt (Höhe je Seite verschieden)
    const onScroll = () => {
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      setAtTop(hero ? window.scrollY < hero.offsetTop + hero.offsetHeight - 96 : false);
    };
```

  und die Abhängigkeiten dieses Effekts von `[]` auf `[pathname]` ändern (nach einer Navigation gehört ein anderer Kopf dazu).

`components/home/story-hero.tsx`: im `<section ref={sectionRef} …>` das Attribut `data-hero` ergänzen.

- [ ] **Step 5: Seiten umstellen**

- `app/(site)/markt/page.tsx`: `<PageHeader` → `<PageHeader tone="red" mark="Markt"`; `<OpenStatus tone="soft" />` → `<OpenStatus tone="dark" />`;
  der Prospekt-Knopf bekommt `variant="white"`.
- `app/(site)/kontakt/page.tsx`: `<PageHeader` → `<PageHeader tone="red" mark="Kontakt"`.
- `app/(site)/karriere/page.tsx`: `<PageHeader` → `<PageHeader tone="red" mark="Karriere"`; im `cta-row` des Kopfs
  `<ButtonLink href="/karriere/bewerben" size="lg">` → `<ButtonLink href="/karriere/bewerben" variant="white" size="lg">` und
  `<ButtonLink href={markt.links.jobs} external variant="soft" size="lg">` → `… variant="glass" size="lg">`.
- `app/(site)/aktuelles/page.tsx`: `<PageHeader` → `<PageHeader tone="red" mark="Aktuell"`.
- `app/(site)/aktuelles/[slug]/page.tsx`: `<PageHeader` → `<PageHeader tone="red" mark="Aktuell"`; im Kopf
  `className="mt-6 text-[0.9375rem] font-semibold text-red"` → `className="mt-6 text-[0.9375rem] font-semibold text-white"`.
- `app/(site)/angebote/page.tsx`: `<PageHeader` → `<PageHeader tone="red" mark="Prospekt"`.

- [ ] **Step 6: Grün sehen und Commit**

```bash
npx tsc --noEmit -p . && npm run lint && npm test
pkill -f "next start -p 3100"; npm run build >/dev/null && (npx next start -p 3100 > "$SCRATCH/rr-start.log" 2>&1 &) ; sleep 5
node e2e/seitenkopf.mjs && node e2e/public-qa.mjs && node --env-file=.env.local e2e/start-ticket.mjs
```

Expected: `seitenkopf` alle ✓ (7 rote Seiten × 2 Breiten transparent → weiß, 3 schlichte weiß, Navigation in beide Richtungen);
`public-qa` 77 ✓ (axe ohne Befund auf allen Seiten, kein Überlauf bei 320 px); Ticket-Test ✓.

```bash
git add lib/site.ts lib/site.test.ts components/layout components/home/story-hero.tsx "app/(site)" e2e/seitenkopf.mjs
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Design: rote Seitenköpfe wie der Hero für Markt, Kontakt, Karriere, Aktuelles und Angebote; Kopfleiste transparent darüber"
```

---

### Task 5: Video in Quellqualität – AV1, HEVC, H.264

**Files:**
- Create: `public/media/markt-rundgang-av1.mp4`, `public/media/markt-rundgang-hevc.mp4`, `public/media/markt-rundgang-h264.mp4`,
  `lib/video.test.ts`, `e2e/medien.mjs`
- Modify: `lib/video.ts`, `lib/media.ts`, `lib/resolve.ts`, `components/home/use-story.ts`, `components/home/story-hero.tsx`
  (Typ), `components/media/gallery.tsx`, `README.md`
- Delete: `public/media/markt-rundgang-720.mp4`, `public/media/markt-rundgang-540.mp4`

**Interfaces:**
- Produces: `VideoSource { src: string; type: string }`, `pickSource(sources, canPlay): string | null`,
  `autoplaySource(sources): string | null` (`lib/video.ts`); `clips[key].sources: readonly VideoSource[]` statt `src`/`srcSmall`;
  Clip-Einträge in Story und Galerie tragen `sources`.

Quelle: Instagram-Download im Projektordner über dem Repo, 720×1280, 30 fps, 20 s, H.264 1,95 Mbit/s:
`../SaveClip.App_AQPgzMw9J8kzoetdSqfosnoYcD4kyhgkAi7FPqQk4rFgJ80hYsmOOAeAhMjLTRcxYslZ1hagjZsKiZHqn1s3RQlmuYIhJtTO6cKIHt8.mp4`.
Gemessen (SSIM gegen die Quelle): heutige Fassung 720 = 0,967 (2,1 MB), 540 = 0,943 (1,45 MB, hochskaliert verglichen).

- [ ] **Step 1: Unit-Test (rot)**

`lib/video.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pickSource } from "./video";

const sources = [
  { src: "/av1.mp4", type: 'video/mp4; codecs="av01.0.08M.08"' },
  { src: "/hevc.mp4", type: 'video/mp4; codecs="hvc1.1.6.L93.B0"' },
  { src: "/h264.mp4", type: 'video/mp4; codecs="avc1.640028"' },
];

describe("pickSource", () => {
  it("nimmt die erste Fassung, die der Browser abspielen kann", () => {
    expect(pickSource(sources, () => "probably")).toBe("/av1.mp4");
    expect(pickSource(sources, (t) => (t.includes("av01") ? "" : "maybe"))).toBe("/hevc.mp4");
    expect(pickSource(sources, (t) => (t.includes("avc1") ? "maybe" : ""))).toBe("/h264.mp4");
  });
  it("ohne passende Fassung kein Video – das Standbild bleibt", () => {
    expect(pickSource(sources, () => "")).toBeNull();
  });
});
```

Run: `npx vitest run lib/video.test.ts` – Expected: FAIL (`pickSource is not a function`).

- [ ] **Step 2: Browser-Test (rot)**

`e2e/medien.mjs`:

```js
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
```

Run (Server mit dem Stand von Task 4): `node e2e/medien.mjs` – Expected: FAIL bei „Desktop: AV1 720 × 1280 (markt-rundgang-720.mp4 …)“.

- [ ] **Step 3: Kodieren und messen**

```bash
SRC="../SaveClip.App_AQPgzMw9J8kzoetdSqfosnoYcD4kyhgkAi7FPqQk4rFgJ80hYsmOOAeAhMjLTRcxYslZ1hagjZsKiZHqn1s3RQlmuYIhJtTO6cKIHt8.mp4"
ffmpeg -hide_banner -loglevel error -y -i "$SRC" -an -c:v libsvtav1 -preset 4 -crf 46 -g 150 -pix_fmt yuv420p -movflags +faststart public/media/markt-rundgang-av1.mp4
ffmpeg -hide_banner -loglevel error -y -i "$SRC" -an -c:v libx265 -preset slow -crf 31 -pix_fmt yuv420p -tag:v hvc1 -x265-params log-level=error -movflags +faststart public/media/markt-rundgang-hevc.mp4
ffmpeg -hide_banner -loglevel error -y -i "$SRC" -an -c:v libx264 -preset slow -crf 28 -profile:v high -level 4.0 -pix_fmt yuv420p -movflags +faststart public/media/markt-rundgang-h264.mp4
for f in av1 hevc h264; do
  echo "$f $(du -k public/media/markt-rundgang-$f.mp4 | cut -f1) KB $(ffmpeg -hide_banner -i public/media/markt-rundgang-$f.mp4 -i "$SRC" -lavfi '[0:v][1:v]ssim' -f null - 2>&1 | grep -o 'All:[0-9.]*') $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,profile,level -of csv=p=0 public/media/markt-rundgang-$f.mp4)"
done
```

Expected (Probelauf 2026-10-06): AV1 ≈ 2 050 KB, SSIM ≈ 0,978, `720,1280,Main,…`; HEVC ≈ 3 080 KB, SSIM ≈ 0,975, `Main,93`;
H.264 SSIM ≥ 0,97, `High,40`. Jede Fassung muss SSIM ≥ 0,97 erreichen (Spec) – sonst CRF um 2 senken und neu kodieren.

```bash
git rm -q public/media/markt-rundgang-720.mp4 public/media/markt-rundgang-540.mp4
```

- [ ] **Step 4: Fassung nach Browser wählen**

`lib/video.ts` (ganze Datei):

```ts
/** Eine Videofassung mit MIME-Typ und Codec, z. B. `video/mp4; codecs="av01.0.08M.08"` */
export interface VideoSource {
  src: string;
  type: string;
}

/** Erste Fassung, die der Browser abspielen kann (Reihenfolge = Vorzug), sonst null */
export function pickSource(sources: readonly VideoSource[], canPlay: (type: string) => string): string | null {
  return sources.find((s) => canPlay(s.type) !== "")?.src ?? null;
}

/**
 * Welche Videodatei automatisch laufen darf: die erste, die der Browser abspielen kann (AV1, HEVC, H.264) – bei aktivem
 * Datensparmodus keine (dann bleibt das Standbild). Nur im Browser aufrufen (Effekte, Event-Handler).
 */
export function autoplaySource(sources: readonly VideoSource[]): string | null {
  const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (connection?.saveData || window.matchMedia("(prefers-reduced-data: reduce)").matches) return null;
  const probe = document.createElement("video");
  return pickSource(sources, (type) => probe.canPlayType(type));
}
```

Run: `npx vitest run lib/video.test.ts` – Expected: PASS.

`lib/media.ts`: den Kommentar über `export const clips` und den Eintrag ersetzen:

```ts
/**
 * Video-Dateien liegen in public/media: ohne Ton, 720 × 1280 wie die Quelle, „faststart“ – AV1 (Chrome, Firefox, neue iPhones),
 * HEVC (Safari), H.264 als Rückfall. Der Browser nimmt die erste Fassung, die er abspielen kann (lib/video.ts). Kodieren: README
 * „Neue Clips“. /media wird ein Jahr lang gecacht – geänderte Videos immer unter neuem Dateinamen ablegen.
 */
export const clips = {
  "markt-rundgang": {
    sources: [
      { src: "/media/markt-rundgang-av1.mp4", type: 'video/mp4; codecs="av01.0.08M.08"' },
      { src: "/media/markt-rundgang-hevc.mp4", type: 'video/mp4; codecs="hvc1.1.6.L93.B0"' },
      { src: "/media/markt-rundgang-h264.mp4", type: 'video/mp4; codecs="avc1.640028"' },
    ],
    poster: "markt-rundgang-poster" as MediaKey,
    label: "Rundgang durch den Markt",
    credit: instagram,
  },
} as const;
```

`lib/resolve.ts`: beide Stellen `src: c.src, srcSmall: c.srcSmall,` → `sources: c.sources,`.

`components/home/use-story.ts`: im Typ `| { type: "clip"; src: string; srcSmall: string; …` → `| { type: "clip"; sources: readonly VideoSource[]; …`
(Import `import { autoplaySource, type VideoSource } from "@/lib/video";`); in `sourceOf` `autoplaySource(it)` → `autoplaySource(it.sources)`;
Kommentar „auf Handys in kleiner Auflösung“ → „in der besten Fassung, die der Browser abspielen kann“.

`components/media/gallery.tsx`: im Typ `GalleryMedia` ebenso `src: string; srcSmall: string;` → `sources: readonly VideoSource[];`
(Import ergänzen); `function TileClip({ src, srcSmall }: { src: string; srcSmall: string })` →
`function TileClip({ sources }: { sources: readonly VideoSource[] })`; darin `autoplaySource({ src, srcSmall })` → `autoplaySource(sources)`
und die Effekt-Abhängigkeiten `[src, srcSmall]` → `[sources]`; Aufruf `<TileClip src={it.src} srcSmall={it.srcSmall} />` →
`<TileClip sources={it.sources} />`. Im Vollbild der Galerie (der Besucher hat den Clip selbst geöffnet – dort gilt kein
Datensparmodus) `<video key={open} src={current.src} controls autoPlay muted playsInline loop className=… aria-label={current.alt} />`
ersetzen durch dasselbe Element ohne `src`, mit den Fassungen als `<source>` – der Browser wählt selbst:

```tsx
                <video key={open} controls autoPlay muted playsInline loop className="mx-auto h-full max-w-full rounded-xl" aria-label={current.alt}>
                  {current.sources.map((s) => (
                    <source key={s.src} src={s.src} type={s.type} />
                  ))}
                </video>
```

`npx tsc --noEmit -p .` muss danach ohne Befund sein (der Typ in `story-hero.tsx` kommt aus `use-story.ts`).

README, Zeile „Neue Clips“ in „Inhalte pflegen“ ersetzen:

```
| Neue Clips | Quelle (am besten das Original vom Handy, nicht aus Instagram) dreimal kodieren, ohne Ton, `faststart`: AV1 `-c:v libsvtav1 -preset 4 -crf 46 -g 150`, HEVC `-c:v libx265 -preset slow -crf 31 -tag:v hvc1`, H.264 `-c:v libx264 -preset slow -crf 28 -profile:v high -level 4.0`, jeweils `-pix_fmt yuv420p -an -movflags +faststart`; Ziel SSIM ≥ 0,97 gegen die Quelle. Dateien nach `public/media/` unter neuem Namen, Posterbild nach `assets/media/`, Eintrag in `lib/media.ts → clips` (`sources` in dieser Reihenfolge) |
```

- [ ] **Step 5: Grün sehen und Commit**

```bash
npx tsc --noEmit -p . && npm run lint && npm test
pkill -f "next start -p 3100"; npm run build >/dev/null && (npx next start -p 3100 > "$SCRATCH/rr-start.log" 2>&1 &) ; sleep 5
node e2e/medien.mjs && node e2e/public-qa.mjs / /markt
```

Expected: alle ✓ (Desktop und Handy AV1 720 × 1280, ohne AV1 HEVC/H.264, Datensparmodus ohne Video); `public-qa` ✓.

```bash
git add -A public/media lib/video.ts lib/video.test.ts lib/media.ts lib/resolve.ts components/home components/media e2e/medien.mjs README.md
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Video: Rundgang in Quellqualität (720 × 1280) als AV1, HEVC und H.264 – der Browser nimmt die beste Fassung"
```

---

### Task 6: Fotoqualität

**Files:**
- Modify: `components/home/story-hero.tsx`, `components/media/gallery.tsx`, `components/news/post-card.tsx`,
  `components/home/regional-band.tsx`, `components/home/highlights.tsx`, `app/(site)/markt/page.tsx`, `next.config.ts`, `e2e/medien.mjs`

**Interfaces:**
- Consumes: Task 5 (`e2e/medien.mjs`).

- [ ] **Step 1: Browser-Test erweitern (rot)**

In `e2e/medien.mjs` vor `await b.close();` einfügen:

```js
// Fotos: Qualität der Bildoptimierung (Parameter q= in der Bildadresse)
const photos = await b.newPage();
await photos.setViewport(desktop);
await photos.goto(`${BASE}/`, { waitUntil: "load" });
const param = (sel, name) => photos.$eval(sel, (i, n) => new URL(i.currentSrc || i.src, location.href).searchParams.get(n), name).catch(() => null);
const STORY_IMG = 'section[aria-roledescription="Story"] img';
const TILE_IMG = 'button[aria-label^="Foto vergrößern"] img';
const MARKT_IMG = 'section[aria-label="Bilder aus dem Markt"] img';
check((await param(STORY_IMG, "q")) === "85", "Story: Qualität 85");
check((await param(TILE_IMG, "q")) === "75", "Galerie-Kachel: Qualität 75");
await photos.goto(`${BASE}/markt`, { waitUntil: "load" });
check((await param(MARKT_IMG, "q")) === "85", "/markt: großes Foto Qualität 85");
// Retina-Handy (3×): die Bildoptimierung liefert genug Pixel (sizes passt zur angezeigten Breite)
await photos.setViewport({ ...mobile, deviceScaleFactor: 3 });
await photos.goto(`${BASE}/`, { waitUntil: "load" });
check(Number(await param(STORY_IMG, "w")) >= 1080, `Story auf Retina-Handy ≥ 1080 px (${await param(STORY_IMG, "w")})`);
check(Number(await param(TILE_IMG, "w")) >= 384, `Galerie-Kachel auf Retina-Handy ≥ 384 px (${await param(TILE_IMG, "w")})`);
await photos.goto(`${BASE}/markt`, { waitUntil: "load" });
check(Number(await param(MARKT_IMG, "w")) >= 1080, `/markt-Foto auf Retina-Handy ≥ 1080 px (${await param(MARKT_IMG, "w")})`);
await photos.close();
```

Die Galerie-Kacheln mit Foto tragen `aria-label="Foto vergrößern: …"` (die mit Clip „Clip abspielen: …“).

Run: `node e2e/medien.mjs` – Expected: FAIL bei „Story: Qualität 85“ (heute 70).

- [ ] **Step 2: Qualität setzen**

- `components/home/story-hero.tsx`: beide `quality={70}` → `quality={85}`.
- `components/media/gallery.tsx`: Kachel `quality={70}` → `quality={75}` (Vollbild bleibt 85).
- `components/news/post-card.tsx`: `quality={70}` → `quality={85}`.
- `components/home/regional-band.tsx`, `components/home/highlights.tsx`: `quality={72}` → `quality={85}`.
- `app/(site)/markt/page.tsx`: beide `quality={75}` der großen Fotos → `quality={85}`.
- `next.config.ts`: `qualities: [70, 75, 85]` → `qualities: [75, 85]`.

- [ ] **Step 3: Grün sehen und Commit**

```bash
grep -rn "quality={7[02]}" components app || echo "keine alten Qualitätswerte"
npx tsc --noEmit -p . && npm run lint && npm test
pkill -f "next start -p 3100"; npm run build >/dev/null && (npx next start -p 3100 > "$SCRATCH/rr-start.log" 2>&1 &) ; sleep 5
node e2e/medien.mjs && node e2e/public-qa.mjs
```

Expected: „keine alten Qualitätswerte“; alle ✓.

```bash
git add components "app/(site)/markt/page.tsx" next.config.ts e2e/medien.mjs
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Fotos: Qualität 85 für Story und große Bilder, 75 für Galerie-Kacheln"
```

---

### Task 7: Messung, Doku, Abschluss

**Files:**
- Create: `e2e/lighthouse.mjs`
- Modify: `docs/superpowers/specs/2026-10-06-design-tempo-design.md` (Abschnitt „Ergebnis“), `docs/BETREIBER-CHECKLISTE.md`, `README.md`

- [ ] **Step 1: Messskript**

`e2e/lighthouse.mjs`:

```js
// node e2e/lighthouse.mjs [/pfad …] – Lighthouse mobil, 3 Läufe je Seite, Median (Server auf Port 3100). Lighthouse kommt per npx
// (13.5.0), keine Abhängigkeit im Projekt. Ziele (Spec Stufe 5): Leistung ≥ 95 und CLS 0 überall, /angebote ≤ 1 MB, Startseite ohne Video ≤ 700 KB.
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
  rows.push({ path, perf: Math.round(m("perf")), lcp: `${(m("lcp") / 1000).toFixed(1)} s`, cls: +m("cls").toFixed(3), kb: Math.round(m("kb")), ohneVideo: Math.round(m("kb") - m("media")) });
}
console.table(rows);
const bad = rows.filter((r) => r.perf < 95 || r.cls > 0 || (r.path === "/angebote" && r.kb > 1024) || (r.path === "/" && r.ohneVideo > 700));
if (bad.length) {
  console.log(`✗ unter Ziel: ${bad.map((r) => r.path).join(", ")}`);
  process.exit(1);
}
console.log("✓ alle Ziele erreicht");
```

- [ ] **Step 2: Messen**

```bash
pkill -f "next start -p 3100"; npm run build >/dev/null && (npx next start -p 3100 > "$SCRATCH/rr-start.log" 2>&1 &) ; sleep 5
node e2e/lighthouse.mjs | tee "$SCRATCH/lh-final.txt"
```

Expected: „✓ alle Ziele erreicht“. Verfehlt eine Seite ein Ziel, die Ursache im Bericht suchen (`$LH_OUT`, Audits
`lcp-breakdown-insight`, `network-requests`), beheben und in Task 7 als Ruling festhalten – kein Ziel stillschweigend senken.

- [ ] **Step 3: Doku**

Spec, am Ende anfügen (Werte aus `$SCRATCH/lh-final.txt`):

```markdown
## Ergebnis (gleiche Messung wie oben)

| Seite | Perf vorher → nachher | LCP vorher → nachher | Übertragung vorher → nachher |
|---|---|---|---|
```

Darunter je Seite eine Zeile: die Werte „vorher“ aus der Tabelle „Ausgangslage“ dieser Spec, „nachher“ aus `$SCRATCH/lh-final.txt`
(Spalten `perf`, `lcp`, `kb`), dazu das Messdatum in der Überschrift (JJJJ-MM-TT).

`docs/BETREIBER-CHECKLISTE.md`, Abschnitt „Bildrechte“, anfügen:

```
- [ ] **Originaldateien**: Video und Fotos in Originalqualität – direkt vom Handy oder der Kamera, nicht aus Instagram (z. B. per AirDrop, USB-Stick oder Cloud-Link). Instagram liefert höchstens 720 × 1280; mit dem Original wird der Rundgang in 1080p kodiert.
```

`README.md`, Zeile „Tests“: die Skripte `seitenkopf`, `medien` und `lighthouse` ergänzen; `prospekt-viewer` braucht einen
veröffentlichten Prospekt der laufenden Woche.

- [ ] **Step 4: Ganze Prüfreihe und Commit**

```bash
npx tsc --noEmit -p . && npm run lint && npm test
node e2e/public-qa.mjs && node e2e/seitenkopf.mjs && node e2e/medien.mjs && node e2e/prospekt-viewer.mjs && node --env-file=.env.local e2e/start-ticket.mjs
node --env-file=.env.local e2e/cockpit-axe.mjs
```

Expected: alle ✓. (Die schreibenden Cockpit-Tests laufen nur, solange die Live-Website noch nicht aus Supabase liest – siehe
README „Tests“; sonst vorher die Entscheidung zum Test-Projekt abwarten.)

```bash
git add e2e/lighthouse.mjs docs README.md
git -c user.name=Claude -c user.email=noreply@anthropic.com commit -m "Stufe 5: Lighthouse-Messung im Repo, Ergebnis in der Spec, Checkliste fragt nach Originaldateien"
```

---

## Abschluss

Abschluss-Review nach superpowers:executing-plans (frischer Reviewer, stärkstes Modell), dann PR. Nach `main` nur mit Freigabe der Agentur.
Screenshots 390/768/1024/1280 der geänderten Seiten für den PR.
