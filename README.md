# REWE Rödelheim · Alamyaar — Website

Ultra-premium, content-ready website for the REWE store in Frankfurt-Rödelheim (independent merchant Ali Alamyaar).
Next.js 16 · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Framer Motion · next-intl (de/en) · Leaflet.

Design document and decisions: [`PROMPT-TASARIM.md`](PROMPT-TASARIM.md). QA results: [`docs/QA-REPORT.md`](docs/QA-REPORT.md).

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

## Content-ready architecture (no code changes needed for client content)

| What the client delivers | Where it goes |
|---|---|
| Store address, phone, email, opening hours | `content/stores.json` → set `address.status` / `hoursStatus` to `"published"` |
| Impressum, Datenschutz, AGB, Widerruf | `content/legalPages.json` → `status: "published"`, `body` (Markdown), `updatedAt` |
| Team names & portraits | `content/about.json` → `team[]`, images in `public/images/placeholders/ekip-*.jpg` |
| Official logo | put file in `public/brand/`, set `content/settings.json → brand.logo` |
| Products, prices, Pfand, origin stories | `content/products.json`, `content/producers.json` |
| Weekly offers (countdowns, brochure pages) | `content/campaigns.json` |
| Recipes (ingredients map to product slugs) | `content/recipes.json` |
| Magazine articles (Markdown body) | `content/articles.json` |
| Jobs | `content/jobs.json` |
| Freshness-clock messages, marquee, delivery slots, PAYBACK rules | `content/settings.json` |

Every text field accepts either a plain string or `{ "de": "...", "en": "..." }`. German is the fallback.
UI chrome strings live in `messages/de.json` and `messages/en.json`.

## Placeholder images → real photos

1. Replace the file in `public/images/placeholders/` **keeping the same file name** (e.g. `produkt-apfel.jpg`).
2. Run `node scripts/blur.mjs` to regenerate the blur-up placeholders (`content/blur.json`).

Recommended ratios: products/categories/recipes/portraits 4:5, heroes/articles/store 16:9.

## Swapping JSON for Supabase / Prisma

Only `lib/content/source.ts` reads data. Replace `readCollection()` / `readSingle()` with database queries returning the same shapes (`lib/content/types.ts`) and every page keeps working.

## Signature features

- **Produktreise** (`/produkt/[slug]`): farm-to-shelf route on a stylised Germany map with draw animation.
- **Alle Zutaten in den Warenkorb** (`/rezepte/[slug]`): one-click bulk add, "Habe ich schon" skipping.
- **Pfand-Kompass** (`/filialen`): deposit calculator with legal amounts.
- **Meine Filiale**: choosing the store personalises the homepage with regional products.
- **Frische-Uhr**: hero message changes with the time of day in Berlin.
- **Cart**: total weight + total Pfand lines; delivery-slot picker in checkout.
- **PAYBACK-Rechner** (`/bonus`): monthly spend → yearly points → voucher value.

## Routes

`/` · `/kategorien[/slug]` · `/produkt/[slug]` · `/rezepte[/slug]` · `/filialen[/slug]` · `/angebote` · `/magazin[/slug]` · `/ueber-uns` · `/nachhaltigkeit` · `/karriere[/slug]` · `/bonus` · `/kontakt` · `/impressum` `/datenschutz` `/agb` `/widerruf` · `/konto` · `/login` · `/warenkorb` · `/checkout` · `/checkout/bestaetigung` · 404.
English versions under `/en/...`. Sitemap at `/sitemap.xml`, robots at `/robots.txt`.
