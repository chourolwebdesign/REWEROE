# REWE Rödelheim · Alamyaar — Website

Content-ready website for the REWE store in Frankfurt-Rödelheim (independent merchant Ali Alamyaar), set in the REWE identity: white paper, anthracite ink, one red (`#CC071E`), Schibsted Grotesk headlines — "Swiss precision, warmly set". REWE Regional and REWE Bio are first-class sections.
Next.js 16 · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Framer Motion · next-intl (de/en) · Leaflet · zustand.

Design document and decisions: [`PROMPT-TASARIM.md`](PROMPT-TASARIM.md) (v2, 2026-10-04). QA results: [`docs/QA-REPORT.md`](docs/QA-REPORT.md) (v1 measurement; the v2 run is pending).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Content-ready architecture (no code changes needed for client content)

| What the client delivers | Where it goes |
|---|---|
| Store address, phone, email, opening hours | `content/stores.json` → set `address.status` / `hoursStatus` to `"published"` (the header chip, Frische-Uhr, store page and footer then show the live open/closed state); `content/settings.json → contact.status` |
| Impressum, Datenschutz, AGB, Widerruf | `content/legalPages.json` → `status: "published"`, `body` (Markdown), `updatedAt` |
| Team names & portraits | `content/about.json` → `team[]`, images in `public/images/placeholders/ekip-*.jpg` |
| Official REWE logo | put the file in `public/brand/`, set `content/settings.json → brand.logo` (replaces the SVG wordmark block at the same height) |
| Official REWE Bio / REWE Regional / "Aus deiner Region" marks | `public/brand/`, set `brand.subLogos.{bio,regional,regionSign}` (replaces the typographic lockups) |
| Assortment size shown in the hero data strip | `brand.assortmentSize` |
| Products, prices, Grundpreis, Pfand, badges (`bio`, `regional`, `neu`, `vegan`, `glutenfrei`, `angebot`, `knaller`, `bonus`), origin stories | `content/products.json`, `content/producers.json` (producers within 100 km count as regional) |
| Weekly offers (countdowns, brochure pages, hero deal) | `content/campaigns.json` |
| Recipes (ingredients map to product slugs) | `content/recipes.json` |
| Magazine articles (Markdown body, optional photo `gallery` and vertical `video`) | `content/articles.json` |
| Store photos and the store walkthrough clip | `content/stores.json → images[]`, `video` (`{ src, poster, ratio: "9:16" \| "16:9", caption }`) |
| REWE Regional page (promises, Hessen season calendar, Regionalfenster, FAQ) | `content/regional.json` |
| REWE Bio page (standards, seals comparison table, green band, FAQ) | `content/bio.json` |
| Jobs | `content/jobs.json` |
| Freshness-clock messages, marquee words, delivery slots, Pfand types, REWE Bonus rules (`bonus.eurosPerPoint`, `centPerPoint`, `welcomePoints`) | `content/settings.json` |

Every text field accepts either a plain string or `{ "de": "...", "en": "..." }`. German is the fallback.
UI chrome strings live in `messages/de.json` and `messages/en.json` (identical key sets).

## Placeholder images → real photos

Two image folders, one blur script:

- `public/images/placeholders/` — generated placeholders, referenced by name from the JSON files.
- `public/images/store/` — real photos delivered by the client (currently the four Resilienzwoche 2026 photos, 3:2). The clip lives in `public/video/`.

1. Replace or add the file **keeping the same file name** (e.g. `produkt-apfel.jpg`).
2. Run `node scripts/blur.mjs` — it scans both folders and regenerates the blur-up placeholders in `content/blur.json`.

**Generated REWE Regional / REWE Bio imagery**: `hero-home.jpg`, `hero-regional.jpg`, `hero-bio.jpg`, `regional-hof.jpg`, `bio-regal.jpg` (16:9) and `regional-apfelgarten.jpg`, `regional-kaeserei.jpg`, `bio-gemuesekiste.jpg`, `bio-milch.jpg`, `bio-brot.jpg` (4:5) were generated and approved in the Higgsfield library (job IDs in the design scratchpad's `IMAGE-PLAN.md`) but could not be downloaded into the repo. The files with these names in `public/images/placeholders/` are **stand-in copies** of existing placeholders — download the real renders, drop them in under the same names, run `node scripts/blur.mjs`.

Ratios: products/categories/recipes/hero plate 4:5, articles 3:2, brand-world tiles/galleries 16:9, page-hero plate 21:9. Photos sit inside a 1 px frame, never carry text.

## Swapping JSON for Supabase / Prisma

Only `lib/content/source.ts` reads data. Replace `readCollection()` / `readSingle()` with database queries returning the same shapes (`lib/content/types.ts`) and every page keeps working.

## Signature features

- **REWE Regional** (`/regional`): producer map (Leaflet, 100 km radius, fly-to from the list), Hessen season calendar (15 crops × 12 months, current month highlighted), Regionalfenster explainer, FAQ.
- **REWE Bio** (`/bio`): four standards, seals comparison table (EU-Bio · Naturland · Bioland · Demeter × 5 criteria), green band, Bio range, FAQ.
- **Markenwelten** (home section 02): two brand-world tiles with the official-style REWE Regional / REWE Bio lockups and proof points.
- **Live store chip** (header, store page, store teaser): "Geöffnet · bis 22:00" / "schließt in 2 h 14 min" / "Geschlossen · öffnet Mo 07:00", Europe/Berlin, Hessen public holidays, one `openState()` in `lib/hours.ts`.
- **Frische-Uhr**: time-of-day message plus the live open state dot.
- **Produktreise** (`/produkt/[slug]`): farm-to-shelf route on a stylised Germany map with draw animation.
- **PDP mobile bar**: sticky buy rail on desktop, bottom price/add bar on mobile; add-to-cart morphs into a persistent quantity stepper with an undo toast.
- **Alle Zutaten in den Warenkorb** (`/rezepte/[slug]`): one-click bulk add, "Habe ich schon" skipping.
- **Digital Prospekt** (`/angebote`): page flip with hero deal, product links and a legal **list view** table.
- **Pfand-Kompass** (`/filialen`): deposit calculator with legal amounts.
- **Meine Filiale**: choosing the store personalises the homepage with regional products.
- **Cart**: total weight + total Pfand lines; delivery-slot picker in checkout.
- **REWE-Bonus-Rechner** (`/bonus`): monthly spend → yearly points → credit.

## Routes

`/` · `/kategorien[/slug]` · `/produkt/[slug]` · `/rezepte[/slug]` · `/regional` · `/bio` · `/filialen[/slug]` · `/angebote` · `/magazin[/slug]` · `/ueber-uns` · `/nachhaltigkeit` · `/karriere[/slug]` · `/bonus` · `/kontakt` · `/impressum` `/datenschutz` `/agb` `/widerruf` · `/konto` · `/login` · `/warenkorb` · `/checkout` · `/checkout/bestaetigung` · 404.
English versions under `/en/...`. Sitemap at `/sitemap.xml`, robots at `/robots.txt`.

## Design system

Tokens, type scale, component library and motion rules are documented in [`PROMPT-TASARIM.md`](PROMPT-TASARIM.md); the CSS lives in `app/globals.css`, the fonts in `app/fonts.ts`. Five rules that matter when editing content:

1. **One red.** REWE red is for the logo block, one primary button per screen, offer prices/badges and active states — never for links, icons or backgrounds.
2. **No gold, no green outside Bio / Regional / Nachhaltigkeit.** Pfand lines are grey, never green; yellow only as the "Aus deiner Region" mark; petrol only in the REWE Bonus module.
3. **Sentence case.** No uppercase headlines or labels in content (the small mono data chips are the only exception).
4. **Legal price lines.** Every price shows a Grundpreis, Pfand articles show "zzgl. 0,25 € Pfand", offers show "statt", validity and "−20 %"; offers carry "Abgabe nur in haushaltsüblichen Mengen".
5. **No text on photos.** Photographs sit in a hairline frame with the caption underneath; only the magazine article, recipe detail and 404 heroes use an ink scrim.
