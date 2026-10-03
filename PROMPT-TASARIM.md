# REWE Rödelheim · Tasarım & Mimari Dokümanı (PROMPT-TASARIM)

> Proje: **REWE Alamyaar – Frankfurt-Rödelheim** (selbstständiger REWE-Kaufmann: Ali Alamyaar)
> Durum: 2026-10-03 · v1 · Henüz müşteri içeriği gelmedi → tüm içerik **placeholder**, tamamı veri dosyalarından.
> Slogan katmanı: "Wir lieben Lebensmittel." (marka) + **"Frische, zelebriert."** (premium katman)

---

## 0. Brief'ten anladığım & varsayımlarım (düzeltmen için)

**Brief'te açıkça söylenen**
- Ultra-premium, butik hissi, 18+ sayfa, Almanya pazarı (düzen, yasal ciddiyet, bölgesellik, tazelik).
- Content-ready mimari: kodda sabit metin yok (slogan hariç); yasal sayfalar `pending` → zarif placeholder.
- Placeholder görsel sistemi: isimlendirilmiş dosyalar, dosya değişince site otomatik güncellenir.
- Next.js App Router + TS + Tailwind + shadcn/ui + Framer Motion + next-intl (de/en).
- 7 imza özellik: Produktreise-Karte, Alle Zutaten in den Warenkorb, Pfand-Kompass, Meine Filiale, Frische-Uhr, Sepet ağırlık+Pfand satırı, PAYBACK-Rechner.

**Benim varsayımlarım (onay bekler)**
1. **Tek şube**: Site REWE Rödelheim için → `stores.json` tek kayıt içerir, mimari N şubeyi destekler. "Filialen" sayfası bu şubeyi harita + Pfand-Kompass ile sunar; "Meine Filiale" varsayılanı Rödelheim'dır.
2. **Adres/saat/telefon**: Müşteriden gelmedi → `stores.json` içinde `status: "pending"` alanları ve Rödelheim semt merkezi koordinatı (yaklaşık) kullanıldı. UI'da "Adresse folgt" gösterilir.
3. **Veri katmanı**: Supabase yerine `/content/*.json` + tipli loader (`lib/content`). Supabase'e geçiş sadece loader'ı değiştirmekle yapılır (sayfalar API'yi bilmez).
4. **İngilizce**: UI metinleri (`messages/en.json`) tam çevrili; ürün/tarif adları gibi içerik alanları `string | {de,en}` tipinde — İngilizce verilmemişse Almanca gösterilir.
5. **Harita**: Leaflet + OpenStreetMap (API anahtarı gerekmez). Mapbox istenirse tile URL değişir.
6. **Sepet/Checkout/Konto**: Gerçek ödeme/giriş entegrasyonu yok; tam UI akışı + localStorage durumu. Ödeme sağlayıcı bağlanınca `checkout` adımındaki `submit` fonksiyonu değişir.
7. **Görseller**: Higgsfield (gpt_image_2_5) ile üretilen, aynı tonda (orman yeşili/krem, yumuşak gün ışığı) editorial fotoğraflar. Gerçek fotoğraf gelince aynı adla değiştir.
8. **Marka kullanımı**: REWE logosu telif/marka hakkı nedeniyle **tipografik "REWE" imzası** olarak işlenir (kurumsal logo dosyası müşteriden gelince `public/brand/` altına konur, `settings.json → logo` alanı yolunu gösterir).

---

## 1. Design Token'ları

```css
/* Renk */
--brand-forest:   #0E3B2E;  /* koyu zemin: header, footer, hero overlay */
--brand-rewe:     #7FBF3F;  /* canlı REWE yeşili: CTA, rozet, imza */
--brand-emerald:  #1B7A4C;  /* ikincil yeşil: hover, link */
--accent-gold:    #C9A227;  /* şampanya altını: SADECE eyebrow, ince çizgi, ödül ikonu (≤8%) */
--surface-cream:  #FAF7F2;  /* açık zemin */
--surface-dark:   #0A1210;  /* dark zemin */
--ink:            #1A1A1A;  /* light metin */   /* dark: #F2EFE8 */
--price-red:      #D0021B;  /* fiyat */
--muted:          #6B6F6A;  /* ikincil metin */
--line:           rgba(14,59,46,.12);

/* Radius */  --r-card: 12px; --r-btn: 10px; --r-pill: 999px;
/* Shadow */  --shadow-card: 0 1px 2px rgba(14,59,46,.06), 0 12px 32px -12px rgba(14,59,46,.18);
              --shadow-lift: 0 2px 4px rgba(14,59,46,.08), 0 28px 56px -20px rgba(14,59,46,.32);
/* Motion */  --ease-out-expo: cubic-bezier(.22,1,.36,1); --dur-reveal: 800ms; --dur-hover: 700ms;
```

Dark mode: `prefers-color-scheme` + `data-theme` override. Gradyan yalnızca "altın ışık" (hero üst parıltı) ve "tazelik parıltısı" (kart hover) için.

## 2. Tipografi

| Rol | Font | Boyut (clamp) | Not |
|---|---|---|---|
| Display / H1 | Fraunces (opsz, SOFT axis) | `clamp(2.75rem, 6vw + 1rem, 6rem)` | letter-spacing −0.02em, line-height .95 |
| H2 | Fraunces | `clamp(2rem, 3vw + 1rem, 3.5rem)` | −0.015em |
| H3 | Fraunces | `clamp(1.375rem, 1vw + 1rem, 1.75rem)` | |
| Gövde | Inter | `clamp(1rem, .2vw + .95rem, 1.125rem)` | lh 1.6 |
| Mono (fiyat, saat, mağaza no, rozet) | Space Grotesk | 0.75–2rem | tabular-nums |
| Eyebrow | Space Grotesk | 0.75rem | uppercase, +0.18em, altın |

Örnek: `— 01 · FRISCHE` (eyebrow) → "Frische, zelebriert." (H1) → açıklama (gövde).
Tüm fontlar `next/font/google`, `latin-ext` subset (Ä Ö Ü ß).

## 3. Sayfa Haritası (route → dosya)

| # | Route | Dosya | Veri |
|---|---|---|---|
| 1 | `/` | `app/[locale]/page.tsx` | settings, categories, campaigns, recipes, stores, stats |
| 2 | `/kategorien` `/kategorien/[slug]` | `kategorien/…` | categories, products |
| 3 | `/produkt/[slug]` | `produkt/[slug]` | products, producers, recipes |
| 4 | `/rezepte` | `rezepte/page.tsx` | recipes |
| 5 | `/rezepte/[slug]` | `rezepte/[slug]` | recipes, products (Zutaten↔Produkt eşleme) |
| 6 | `/filialen` | `filialen/page.tsx` | stores, pfand |
| 7 | `/filialen/[slug]` | `filialen/[slug]` | stores, products(regional) |
| 8 | `/ueber-uns` | `ueber-uns` | about (timeline, values, team) |
| 9 | `/nachhaltigkeit` | `nachhaltigkeit` | sustainability |
| 10 | `/karriere` | `karriere` | jobs |
| 11 | `/bonus` | `bonus` | bonus |
| 12 | `/angebote` | `angebote` | campaigns |
| 13 | `/magazin` `/magazin/[slug]` | `magazin/…` | articles |
| 15 | `/kontakt` | `kontakt` | settings, faq |
| 16 | `/impressum` `/datenschutz` `/agb` `/widerruf` | `[legal]` (tek dinamik sayfa) | legalPages |
| 17 | `/konto` `/login` | `konto`, `login` | account(mock) |
| 18 | `/warenkorb` `/checkout` `/checkout/bestaetigung` | … | cart store, settings.delivery |
| 19 | 404 | `not-found.tsx` | products(popular) |

Locale: `de` kök (`/`), `en` → `/en/...` (`localePrefix: as-needed`). hreflang otomatik.

## 4. Veri Şemaları (`/content/*.json`)

```ts
type L10n = string | { de: string; en?: string };
type Img = { src: string; alt: L10n; ratio?: "4:5" | "16:9" | "1:1" };

settings.json   { brand: {name, merchant, claim, premiumClaim, logo?}, contact:{phone,email,status},
                  social[], freshnessClock:[{from,to,message:L10n}], marquee:L10n[],
                  newsletter:{discount}, payments:string[], delivery:{slots:[{id,label,price}], pickup:boolean},
                  pfand:{types:[{id,label,amount}]}, payback:{pointsPerEuro, centPerPoint} }
categories.json [{ slug, name:L10n, teaser:L10n, image:Img, order, parent? }]
products.json   [{ slug, name:L10n, category, price, unit:{amount,unit}, basePrice:{per,amount},
                  pfand?:{type,amount}, badges:["bio"|"regional"|"neu"|"vegan"|"glutenfrei"|"angebot"],
                  discount?:{percent,until}, rating, reviews, weightGrams, images:Img[], origin:{producer, region,
                  story:L10n, coords:[lat,lng]}, nutrition:{kcal,fat,carbs,sugar,protein,salt}, tags[], recipes:[slug] }]
producers.json  [{ slug, name, region, image:Img, story:L10n, coords:[lat,lng], distanceKm }]
recipes.json    [{ slug, title:L10n, image:Img, time, servings, difficulty, season, diet[], rating,
                  ingredients:[{name:L10n, amount, unit, productSlug?}], steps:L10n[], tips:L10n[], nutrition, featured? }]
stores.json     [{ slug, name, merchant, address:{street,zip,city,status}, coords, phone, email,
                  hours:{mon..sun:[open,close]|null}, services:[], images:Img[], status }]
campaigns.json  [{ slug, title:L10n, productSlug, oldPrice, newPrice, percent, validFrom, validUntil, image?, page }]
articles.json   [{ slug, title:L10n, category, excerpt:L10n, author, readMinutes, publishedAt, cover:Img, body:L10n(md) }]
jobs.json       [{ slug, title, location, type, department, teaser:L10n, description:L10n, validThrough }]
legalPages.json [{ slug, title:L10n, status:"pending"|"published", body?:L10n(md), updatedAt? }]
about.json      { timeline:[{year,title:L10n,text:L10n}], values[], stats[], team:[{name?,role,image,status}] }
sustainability.json { goals:[{label,progress,target}], certificates[], sections[] }
bonus.json      { steps[], benefits[] }
faq.json        [{ q:L10n, a:L10n }]
```

Supabase'e geçiş: `lib/content/source.ts` içindeki `readCollection(name)` fonksiyonu `fs` yerine Supabase client ile aynı şemayı döner.

## 5. Placeholder Görsel Sistemi

`public/images/placeholders/<ad>.jpg` — adlandırma sabit, veri dosyası `image.src` ile referans verir.
Üretim: Higgsfield `gpt_image_2_5`, ortak stil: *"editorial food photography, soft natural window light, deep forest green & cream palette, shallow depth of field, premium magazine look, no text, no logos"*.
Oranlar: kart/ürün/tarif/portre **4:5**, hero/makale/filiale **16:9**.
Blur-up: `scripts/blur.mjs` → `content/blur.json` (base64 10px LQIP); `<SmartImage>` bunu otomatik kullanır.

## 6. Bileşen Kütüphanesi (ui/ + components/)

- **Layout**: `SiteHeader` (sticky, scroll'da glass + altın alt çizgi, mega menü, dil, arama, favori, sepet), `MobileMenu` (tam ekran), `SiteFooter` (4 sütun + ödeme ikonları + büyük imza), `ScrollProgress`, `CookieConsent` (3 katman), `PageTransition`, `MobileCartBar`.
- **Tipografi**: `Eyebrow`, `SectionHeading`, `Display`.
- **Kartlar**: `ProductCard` (+QuickView), `CategoryCard`, `RecipeCard`, `ArticleCard`, `StoreCard`, `JobCard`.
- **Ticaret**: `PriceTag`, `Badges`, `PfandChip`, `AddToCartButton`, `QuantityStepper`, `CartDrawer`, `CartSummary` (ağırlık + Pfand), `Countdown`, `SlotPicker`, `PaymentPicker`.
- **Motion**: `Reveal`, `Counter`, `Marquee`, `KenBurns`, `CharReveal`.
- **İmza**: `FreshnessClock`, `JourneyMap` (SVG Almanya), `BulkAddIngredients`, `PfandKompass`, `StoreSelector`, `PointsCalculator`, `FlipBrochure`.
- **shadcn**: button, badge, accordion, dialog, sheet, slider, checkbox, select, tabs, input, label, textarea, progress, tooltip, radio-group, separator, skeleton, switch, popover, dropdown-menu, scroll-area, sonner.

## 7. Motion Spesifikasyonu

| Öğe | Değer |
|---|---|
| Section reveal | y 24→0, blur 8→0, opacity 0→1, 800ms, `[0.22,1,0.36,1]` |
| Hero char reveal | stagger 60ms (sadece hero) |
| Kart hover | lift −6px, shadow-lift, img scale 1.05 / 700ms ease-out |
| Buton | hover: koyulaşır + ok +8px; active scale .98 |
| Sepet | ikon spring (stiffness 500, damping 18), rozet sayacı spring 300ms |
| Sayaç | 1.5s ease-out |
| Marquee | 40s linear, hover → `animation-play-state` yavaşlatma (80s) |
| Modal | backdrop blur, scale .96→1 spring |
| Accordion | height auto animasyonu, ikon 180° |
| Journey map | path draw 2s, nokta pulse |
| Countdown | 1s tick, bitiş → "Vorbei" |
| Reduced motion | tüm Framer variants `useReducedMotion` → instant |

## 8. SEO / Erişilebilirlik / Performans

- Metadata API + OG + `alternates.languages` (hreflang de/en/x-default), `sitemap.ts`, `robots.ts`.
- JSON-LD: `Organization/GroceryStore` (layout), `Product`, `Recipe`, `JobPosting`, `Article`, `BreadcrumbList`, `FAQPage`.
- WCAG 2.2 AA: skip-link, focus ring (altın 2px), `aria-live` toast, form label+hata, kontrast testli, semantic landmarks.
- Perf: `next/image`, font `display: swap`, `dynamic()` Leaflet/FlipBrochure, animasyonlar `transform/opacity` only. Hedef Lighthouse ≥95.

## 9. Çalışma Sırası (brief §10) ve durum

1. ✅ PROMPT-TASARIM.md
2. ⏳ İskelet + content + placeholder görseller
3. ⏳ Tasarım sistemi bileşenleri
4. ⏳ Ana sayfa  → *(brief'e göre onay noktası; otonom çalışmada onay beklenmeden devam edildi — geri bildirimle revize edilir)*
5. ⏳ Kategoriler → Ürün detay (Produktreise) → Rezepte (Alle Zutaten) → Filialen (Pfand-Kompass) → Angebote → diğerleri
6. ⏳ Yasal placeholder sistemi
7. ⏳ Build + Lighthouse + mobil test raporu (`docs/QA-REPORT.md`)
