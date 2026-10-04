# REWE Rödelheim · Tasarım & Mimari Dokümanı (PROMPT-TASARIM)

> Proje: **REWE Alamyaar – Frankfurt-Rödelheim** (selbstständiger REWE-Kaufmann: Ali Alamyaar)
> Durum: 2026-10-04 · **v2 (REWE-Redesign)** · Müşteri içeriği hâlâ büyük ölçüde placeholder; gerçek medya olarak Resilienzwoche-2026 fotoğrafları + mağaza turu klibi geldi.
> Slogan katmanı: **„REWE. Dein Markt."** (marka, `settings.brand.claim`) + **„Frisch. Regional. Rödelheim."** (premiumClaim, hero h1) + „Dein Markt in Rödelheim" (tagline, eyebrow)
> Tasarım yönü: **„Schweizer Präzision, warm gesetzt"** — beyaz kâğıt, antrasit mürekkep, tek kırmızı. Bağlayıcı spesifikasyon: `DESIGN-SPEC.md` (scratchpad); bu doküman onun koddaki karşılığını özetler.

---

## 0. Brief'ten anladığım & varsayımlarım (v2'de ne değişti)

**v1'de yanlış olan ve v2'de düzelen**
- v1 „ultra-premium butik" okunuyordu: orman yeşili / krem / şampanya altını, Fraunces serif, glass header, Ken Burns, hareketli marquee. **Hiçbiri REWE değildi.** v2 REWE kimliğidir: resmî REWE kırmızısı `#CC071E` **tek doygun renk**, beyaz yüzeyler, antrasit mürekkep, Schibsted Grotesk 800 başlıklar.
- Header'daki „Wir lieben Lebensmittel." **EDEKA'nın sloganıydı** → silindi. Marka iddiası `„REWE. Dein Markt."` (settings + `nav.claim` + `footer.claim`).
- PAYBACK → **REWE Bonus** (REWE 28.12.2024'te PAYBACK'ten ayrıldı): `settings.bonus`, `content/bonus.json`, `nav.bonus`, `common.services.payback = "REWE Bonus"` (servis **id**'si `payback` olarak kalır), `common.badges.bonus = "Mit REWE Bonus"`. Repo genelinde `PAYBACK` ve `lieben Lebensmittel` grep'i sıfır.
- **REWE Regional ve REWE Bio first-class**: iki yeni rota (`/regional`, `/bio`), ana navigasyonda ikinci/üçüncü madde, mega menüde „Markenwelten" satırı, ana sayfada 02 numaralı „Markenwelten" bölümü, footer'da linkler, kendi JSON dosyaları ve tipleri.
- Logo tipografik `<span>` değil, ölçülmüş **REWE wordmark path'li SVG blok** (`components/brand/logo.tsx`, `app/icon.svg`); `#d0021b` artık yok.

**Brief'te açıkça söylenen (hâlâ geçerli)**
- Content-ready mimari: kodda sabit metin yok; tüm UI metinleri `messages/de.json` + `en.json` (726 anahtar, iki dilde birebir eşit); yasal sayfalar `pending` → placeholder.
- Placeholder görsel sistemi: isimlendirilmiş dosyalar, dosya değişince site otomatik güncellenir.
- Next.js 16 App Router + TS + Tailwind 4 (`@theme inline`) + shadcn/ui + Framer Motion (`LazyMotion` / `m`) + next-intl (de/en) + Leaflet + zustand.
- İmza özellikler korunur: Produktreise-Karte, Alle Zutaten in den Warenkorb, Pfand-Kompass, Meine Filiale, Frische-Uhr, Sepet ağırlık+Pfand satırı, REWE-Bonus-Rechner, FlipBrochure.

**Benim varsayımlarım (onay bekler)**
1. **Tek şube**: `stores.json` tek kayıt; mimari N şubeyi destekler. „Meine Filiale" varsayılanı Rödelheim.
2. **Adres/saat/telefon**: Hâlâ gelmedi → `address.status: "pending"`, `hoursStatus: "pending"`, `contact.status: "pending"`. UI „Adresse folgt" / „Öffnungszeiten folgen" gösterir; saat tablosu (Mo–Sa 07:00–22:00, So kapalı) **tahmindir** ve `published` yapılmadan canlı açık/kapalı durumu hesaplanmaz.
3. **Veri katmanı**: `/content/*.json` + tipli loader (`lib/content`). Supabase'e geçiş sadece `lib/content/source.ts` değişikliğidir.
4. **İngilizce**: UI tam çevrili; içerik alanları `string | {de,en}`; İngilizce yoksa Almanca gösterilir. `RegionSign` metni /en'de de Almanca kalır (mağazadaki fiziksel tabela).
5. **Harita**: Leaflet + OpenStreetMap, gri tonlu tile'lar (kırmızı mağaza işareti haritadaki tek renk). Renkler `getComputedStyle` ile token'lardan okunur.
6. **Sepet/Checkout/Konto**: Gerçek ödeme/giriş yok; tam UI akışı + zustand/localStorage.
7. **Görseller**: v1 Higgsfield placeholder'ları (yeşil/krem tonlu) yerinde duruyor; Regional/Bio için **nötr gradeli 10 yeni görsel** Higgsfield'da üretildi ve onaylandı (job id'leri `IMAGE-PLAN.md`), ancak konteynerin egress politikası CDN'i engellediği için repoya **dosya olarak inmedi** → aynı adlarla stand-in kopyalar duruyor (bkz. §5). Tek fotoğraf gradesi `.img-grade`.
8. **Marka kullanımı**: Resmî logo dosyası gelmedi → SVG wordmark bloğu (`settings.brand.logo` null). Alt markalar müşterinin referans görsellerinden tipografik olarak yeniden üretildi (`BrandLockup`, `RegionSign`); resmî dosyalar gelince `settings.brand.subLogos.{bio,regional,regionSign}` → `public/brand/` ile aynı yükseklikte `<img>` olarak devreye girer.
9. **REWE Bonus koşulları**: `settings.bonus = { eurosPerPoint: 2, centPerPoint: 1, welcomePoints: 200 }` **varsayımdır**; `bonus.json` metinleri oran içermez.
10. **Dark mode**: Yalnızca `prefers-color-scheme` (toggle yok, `data-theme` yok). Tasarlanmış, tersine çevrilmemiş: kırmızı dolgu `#D9102A`'ya kalkar, kırmızı metin `#F4566A` sinyal kırmızısına döner, antrasit bloklar sayfadan **açık** (`#1F1F1F` > `#111111`) ve 1 px dikişli.

---

## 1. Design Token'ları (`app/globals.css` — gerçek değerler)

```css
/* Yüzeyler */        --paper #FFFFFF  --surface #F5F5F4  --surface-2 #ECECEB  --card #FFFFFF
/* Mürekkep */        --ink #141414  --ink-2 #2A2A2A (uzun metin)  --ink-muted #5C5C5C (Grundpreis, Pfand, caption)
/* Çizgiler */        --line #CFCFCC (1 px)  --line-strong #141414 (2 px)  --line-input #767676 (≥ 3:1 sınır)
/* Kırmızı — DOLGU ve METİN ayrı işler */
--red #CC071E (fill: CTA, rozet, Dot, progress, marker)  --red-hover #A80619  --red-deep #800413  --red-tint #FBE9EB
--red-text #CC071E (metin/stroke; dark + .on-block içinde #F4566A'ya döner)  --red-brand #CC071E (logo bloğu, asla değişmez)
/* Yeşil — çitli: Bio · Regional · Nachhaltigkeit · Mehrweg · açık durumu */
--bio #0E6B34 (fill, beyaz 6.62:1)  --bio-text #0E6B34 (dark: #5FC68A)  --bio-tint #E7F1EA
/* Alt-marka aksanları */
--regional #FFCC00 (Regional alanı, 8×8 kare — üstünde yalnızca mürekkep)  --petrol #0B5E6B + --bonus-yellow #FBE8A6 (yalnızca REWE Bonus modülü)
/* Semantik */        --error #B3261E (her zaman ikon + metin ile)  --price = ink  --price-offer = red-text  --focus = ink (2 px, offset 3 px)
/* Antrasit blok */   --block #141414  --block-ink #FFF  --block-muted #A6A6A6  --block-line #333  --block-red #F4566A  --block-bio #5FC68A
/* Radius */          --radius 0.125rem → kart/görsel/sheet/panel 0 · buton/input/rozet/çip 2 px · rounded-full yalnızca ikon buton + nokta
/* Shadow */          --shadow-card none · --shadow-lift none · --shadow-pop (yalnızca overlay: mega menü, dialog, toast, popup)
/* Motion */          --ease-out-expo cubic-bezier(.22,1,.36,1) · --ease-ui cubic-bezier(.2,0,0,1)
                      --dur-ui 180ms · --dur-move 240ms · --dur-reveal 600ms · --dur-hover 500ms · --dur-page 400ms
```

**Dark (`@media (prefers-color-scheme: dark)`)**: paper `#111111`, surface `#1A1A1A`, surface-2 `#222222`, card `#171717`, ink `#F2F2F2`, ink-muted `#A6A6A6`, line `#3A3A3A`, line-input `#8A8A8A`, red `#D9102A` (hover = inset ring, dolgu adımı yok), red-text `#F4566A`, bio-text `#5FC68A`, petrol-text `#3FA3B2`, error `#FF7A85`, block `#1F1F1F`, `--fw-display 700`.

**Bağlam anahtarları**: `.on-block` (antrasit blok: footer, manifesto, mobil sheet, MobileCartBar, Pfand/Bonus sonuç paneli, CTA blokları) tüm token'ları blok değerlerine çevirir — üstüne düşen bileşen otomatik doğru olur. `.on-paper` blok içindeki beyaz ada (Prospekt sayfası, quick view, foto üstü çipler). **Uygulama kodunda `dark:` renk utility'si yok** (tek istisna: Bio rozetinin dark varyantı, dosya başında belgeli).

**Kırmızı bütçesi**: 1440×900 ana sayfa ekran görüntüsünde kırmızı piksel < %4 (sert sınır < %10, alt sınır ≥ %1). Kırmızı yalnızca: logo bloğu, viewport başına ≤ 1 primary CTA, kampanya fiyatı/rozeti, eyebrow numarası, aktif nav çizgisi, countdown + progress, harita işareti, 2 px footer çizgisi, scroll-progress. Asla link rengi, ikon rengi, hover zemin, gradyan, bant.

## 2. Tipografi (`app/fonts.ts`)

| Rol | Font (next/font/google, `latin`, `weight: "variable"`) | Yük |
|---|---|---|
| Display: h1–h3, `.display`, poster fiyat, sayaçlar, mobil sheet nav, watermark | **Schibsted Grotesk** wght 400–900 → **800** kâğıtta, **700** bloklarda/dark'ta (`--fw-display`) | preload, 46 KB |
| Metin / UI / fiyat / etiket | **Figtree** → 400 gövde · 500 nav, caption, yasal satır · 600 eyebrow, buton, kart başlığı · 700 fiyat | preload, 20 KB |
| `data` çipleri (Frische-Uhr saati, Countdown, Pfand-Kompass, Bonus, folio, kbd) | **Geist Mono** 500 | `preload:false`, 23 KB |
| Lockup script'leri (yalnızca `BrandLockup`: „Bio" / „Regional") | **Satisfy** (`--font-script-bio`) · **Sacramento** (`--font-script-regional`) | lazy, tek ağırlık |

`font-display: swap`, `html { font-synthesis-weight: none }` (faux bold yok). Fraunces / Inter / Space Grotesk silindi.

**Tip ölçeği (akışkan 390 → 1440 px; spec §2.3)**

| Rol | CSS | px @390 → @1440 | Yüz · ağırlık | Tracking | lh |
|---|---|---|---|---|---|
| Display XL (Angebote h1, 404) | `clamp(2.75rem, 0.8rem + 8vw, 8rem)` | 44 → 128 | Schibsted 800 | −0.035em | 0.95 |
| h1 (hero, PageHero, Filiale, Magazin, Rezepte) | `clamp(2.75rem, 1.17rem + 6.48vw, 7rem)` | 44 → 112 | Schibsted 800 | −0.035em (−0.025em ≤ 640) | 0.95 |
| h1 compact (Legal, Warenkorb, Checkout, Kontakt) | `clamp(2.25rem, 1.6rem + 2.7vw, 4rem)` | 36 → 64 | Schibsted 800 | −0.025em | 1.0 |
| h2 (SectionHeading) | `clamp(2rem, 1.35rem + 2.67vw, 3.75rem)` | 32 → 60 | Schibsted 800 (700 blokta) | −0.025em | 1.02 |
| h3 | `clamp(1.375rem, 1.19rem + 0.76vw, 1.875rem)` | 22 → 30 | Schibsted 700 | −0.015em | 1.15 |
| h4 / kart başlığı | `clamp(1.125rem, 1.08rem + 0.19vw, 1.25rem)` | 18 → 20 | Figtree 600 | −0.005em | 1.3 |
| Lede | `clamp(1.125rem, 1.03rem + 0.38vw, 1.375rem)` | 18 → 22 | Figtree 400 | −0.005em | 1.45 |
| Gövde | `clamp(1rem, 0.98rem + 0.1vw, 1.0625rem)` | 16 → 17 | Figtree 400 | 0 | 1.6 (prose 1.7) |
| Nav / Buton | `0.9375rem` | 15 | Figtree 500 / 600 | 0 | 1 |
| Caption / meta | `0.8125rem` | 13 | Figtree 400/600 | 0 | 1.4 |
| Eyebrow (`.eyebrow`) | `clamp(0.75rem, 0.73rem + 0.1vw, 0.8125rem)` | 12 → 13 | Figtree 600, **sentence case**, numara kırmızı | +0.02em | 1 |
| Rozet / çip | `0.6875rem` sm · `0.75rem` md | 11 / 12 | Figtree 700 | +0.04em | 1 |
| `.data` (mono etiket) / `.data-lg` (mono değer) | `0.6875rem` uppercase · `0.8125rem` | 11 / 13 | Geist Mono 500 | +0.08em / +0.02em | 1 |
| `.price` sm · md · lg | 1rem · `clamp(1.25rem,…,1.5rem)` · `clamp(1.75rem,…,2.5rem)` | 16 · 20→24 · 28→40 | Figtree 700 tnum | −0.01/−0.02em | 1 |
| `.price-poster` (Angebote hero deal, Knaller) | `clamp(3.5rem, 2.57rem + 3.81vw, 6rem)` | 56 → 96 | Schibsted 800 **proportional-nums** | −0.04em | 0.9 |
| Grundpreis / Pfand / yasal satır (`.price-meta`) | `0.75rem` (kart) · `0.8125rem` (buy box) | 12 / 13 | Figtree 500 | +0.01em | 1.3 |
| Watermark (footer „Rödelheim") | `clamp(5rem, 20vw, 19rem)` | — | Schibsted 800, beyaz %5 | −0.05em | 0.8 |

Mikro kurallar: `.num` = Figtree 500 tabular (eski `.mono`'nun yerine, **monospace değil**); indirim `−20 %` (U+2212); `hyphens: auto` + `hyphenate-limit-chars: 10 4 4` h1–h3'te; hero h1 `max-w-[11ch]`. Eyebrow örneği: `<Eyebrow auto>Sortiment</Eyebrow>` → CSS sayacıyla „01 — Sortiment" (numara metin değil, `::before`).

## 3. Sayfa Haritası (route → dosya)

| # | Route | Dosya (`app/[locale]/…`) | Veri |
|---|---|---|---|
| 1 | `/` | `page.tsx` + `components/home/hero.tsx` | settings, categories, campaigns, recipes, stores, producers, products(regional) |
| 2 | `/kategorien` `/kategorien/[slug]` | `kategorien/…` | categories, products, producers |
| 3 | `/produkt/[slug]` | `produkt/[slug]` | products, producers, recipes, campaigns |
| 4 | `/rezepte` `/rezepte/[slug]` | `rezepte/…` | recipes, products (Zutaten↔Produkt) |
| 5 | **`/regional`** | `regional/page.tsx` | **regional**, producers (≤ 100 km), products(regional), stores, settings |
| 6 | **`/bio`** | `bio/page.tsx` | **bio**, products(badge `bio`), settings |
| 7 | `/filialen` `/filialen/[slug]` | `filialen/…` | stores (+video), pfand, products(regional) |
| 8 | `/angebote` | `angebote` | campaigns, products |
| 9 | `/magazin` `/magazin/[slug]` | `magazin/…` | articles (+gallery, video), recipes |
| 10 | `/ueber-uns` | `ueber-uns` | about |
| 11 | `/nachhaltigkeit` | `nachhaltigkeit` | sustainability |
| 12 | `/karriere` `/karriere/[slug]` | `karriere/…` | jobs |
| 13 | `/bonus` | `bonus` | bonus, settings.bonus |
| 14 | `/kontakt` | `kontakt` | settings, faq |
| 15 | `/impressum` `/datenschutz` `/agb` `/widerruf` | `(legal)/[legal]` | legalPages |
| 16 | `/konto` `/login` | `konto`, `login` | account (mock) |
| 17 | `/warenkorb` `/checkout` `/checkout/bestaetigung` | … | cart store, settings.delivery |
| 18 | 404 | `not-found.tsx` + `[...rest]/page.tsx` | products(popular) |

Locale: `de` kök (`/`), `en` → `/en/...` (`localePrefix: as-needed`); canonical + hreflang (de/en/x-default) `lib/seo.ts → alternatesFor()`. `app/sitemap.ts` statik listesi `/regional` ve `/bio`'yu içerir; `robots.ts` `/checkout`, `/konto`, `/warenkorb`'u dışlar.

**Navigasyon**: Sortiment ▾ · Regional · Bio · Angebote · Rezepte · Unser Markt · Magazin · Mehr ▾ (Über uns, Nachhaltigkeit, REWE Bonus, Karriere, Kontakt). Mega menü: 6 kategori karosu + „Markenwelten" satırı (iki lockup). Mobil sheet: `.on-block`, 12 numaralı display madde.

**Ana sayfa akışı**: Hero (tip kolonu + 4:5 plaka + 4 hücreli veri şeridi) → statik Marquee → `01` Sortiment → `02` **Markenwelten** (Regional/Bio karoları) → `03` Angebote → `04` Rezepte → `05` Haltung (`.on-block` manifesto + sayaçlar) → `06` Mein Markt (StoreSelector; şube seçilince „Aus deiner Region" ürünleri) → `07` Newsletter.

## 4. Veri Şemaları (`/content/*.json`, tipler `lib/content/types.ts`)

```ts
type L10n = string | { de: string; en?: string };
type Img = { src: string; alt: L10n; ratio?: "4:5" | "16:9" | "1:1" | "3:2" };
type ContentVideo = { src: string; poster: string; ratio: "9:16" | "16:9"; caption?: L10n };   // autoplay yok, poster zorunlu
type Status = "pending" | "published";
type Badge = "bio" | "regional" | "neu" | "vegan" | "glutenfrei" | "angebot" | "knaller" | "bonus";

settings.json   { brand: { name, merchant, merchantLegal, owner, district, assortmentSize:number, claim, premiumClaim:L10n, tagline:L10n,
                           logo: string|null, siteUrl, voice:L10n, subLogos?: { bio?, regional?, regionSign?: string|null } },
                  contact: { status, phone, email, hoursNote:L10n }, social[], freshnessClock:[{from,to,message:L10n}], marquee:L10n[],
                  newsletter:{discount,status}, payments:string[], delivery:{pickup, deliveryFee, freeFrom, minOrder, slots:[{id,day,from,to,price}]},
                  pfand:{types:[{id,label:L10n,amount}]}, bonus:{ eurosPerPoint, centPerPoint, welcomePoints }, stats:[{id,value,suffix,label:L10n}] }
categories.json [{ slug, order, name:L10n, teaser:L10n, image:Img }]
products.json   [{ slug, sku, category, name:L10n, subtitle:L10n, price, unit:{amount,unit}, basePrice:{per,amount}, pfand?:{type,amount},
                  badges:Badge[], rating, reviews, weightGrams, images:Img[], origin:{producer, story:L10n}, nutrition:{kcal,fat,carbs,sugar,protein,salt}, tags[], recipes:[slug] }]
producers.json  [{ slug, name, region:L10n, distanceKm, coords:[lat,lng], international?, image:Img, story:L10n }]   // ≤ 100 km → "regional"
recipes.json    [{ slug, featured?, title:L10n, teaser:L10n, image:Img, time, servings, difficulty, season, diet[], rating,
                  ingredients:[{name:L10n, amount, unit, productSlug|null}], steps:L10n[], tips:L10n[], nutrition }]
stores.json     [{ slug, name, merchant, owner, storeNumber, address:{status,street,zip,city,district}, coords, coordsNote?, phone, email,
                  hours:{mon..sun:[open,close]|null}, hoursStatus:Status, services:[], images:Img[], video?:ContentVideo, intro:L10n, status }]
campaigns.json  [{ slug, title:L10n, productSlug, percent, validFrom, validUntil, page }]            // indirimli fiyat hesaplanır (lib/format discounted)
articles.json   [{ slug, category:"saison"|"gesundheit"|"region", featured?, title:L10n, excerpt:L10n, author:{name,status}, readMinutes,
                  publishedAt, cover:Img, relatedRecipes:[slug], body:L10n(md), gallery?:Img[], video?:ContentVideo }]
jobs.json       [{ slug, title:L10n, location, type, department:L10n, teaser:L10n, description:L10n, datePosted, validThrough, salary:null|{min,max} }]
legalPages.json [{ slug, title:L10n, status, body:L10n(md)|null, updatedAt|null }]
about.json      { hero, timeline:[{year,title,text,status?}], values[], team:[{name|null, role:L10n, image:Img, status}] }
sustainability.json { hero:{title,quote,image}, goals:[{id,label,progress,target}], sections[], certificates[] }
bonus.json      { hero, steps:[{n,title,text}], benefits[] }
faq.json        [{ q:L10n, a:L10n }]
regional.json   { hero:{title,lead,image}, promises:[{id,title,text}], seasonCalendar:[{id,item:L10n,months:number[1..12]}], seasonNote,
                  regionalfenster:{title,text,points:L10n[]}, hessen:{title,text,image}, faq[] }                       // RegionalPage
bio.json        { hero, standards:[{id,title,text}], seals:{ columns:[{id,label,note,reweBio?}], rows:[{id,criterion,values:L10n[]}] },
                  band:{title,text}, editorial:{title,text,image}, faq[] }                                               // BioPage
```

Getter'lar (`lib/content/index.ts`): mevcutlara ek olarak `getRegionalPage()`, `getBioPage()`, `getBioProducts()` (badge `bio`), `getRegionalProducers()` (≤ `REGIONAL_RADIUS_KM = 100`, yakından uzağa, 0 km mağaza içi zanaatlar sonda), `getRegionalProducts()`. Mevcut içerik: 31 ürün (12 Bio, 29 Regional), 12 Erzeuger (10'u ≤ 100 km), 8 tarif, 7 makale, 5 ilan, 8 kampanya, 15 satırlık Hessen sezon takvimi.
Supabase'e geçiş: `lib/content/source.ts` içindeki `readCollection(name)` / `readSingle(name)` (singles: settings, about, sustainability, bonus, **regional, bio**) aynı şemayı döndürür.

## 5. Görsel Sistemi (placeholder + gerçek medya)

**Üç klasör**
- `public/images/placeholders/<ad>.jpg` (82 dosya) — v1 Higgsfield üretimleri + 10 Regional/Bio adı. Veri dosyaları `image.src` ile referans verir.
- `public/images/store/resilienzwoche-2026-{stand,rundgang,frische,gruppenbild}.jpg` — **müşteriden gelen gerçek fotoğraflar** (3:2; Obst & Gemüse bölümü, sarı „Aus deiner Region" standları, Hessen arması, BBK/NINA, itfaiye). Kullanım: `articles.json → resilienzwoche-2026` (cover + `gallery`), `stores.json → images[3]`.
- `public/video/markt-rundgang.mp4` + `markt-rundgang-poster.jpg` — 720×1280, 20 s, sessiz, h264 faststart. `stores.json → video`, `articles.json → video`. Render: `<video controls playsInline preload="none" poster>` 9:16 `frame` içinde, ≤ 420 px, **autoplay yok**.

**Regional/Bio görselleri (durum)**: `hero-home.jpg`, `hero-regional.jpg`, `hero-bio.jpg`, `regional-hof.jpg`, `bio-regal.jpg` (16:9) · `regional-apfelgarten.jpg`, `regional-kaeserei.jpg`, `bio-gemuesekiste.jpg`, `bio-milch.jpg`, `bio-brot.jpg` (4:5) — Higgsfield `gpt_image_2_5` ile nötr gradeli üretildi, görsel olarak onaylandı; **job id'leri `IMAGE-PLAN.md`'de** (Higgsfield kütüphanesinde görünür). Egress engeli yüzünden repoya inmedi: bugün bu dosya adlarının altında **mevcut placeholder'ların kopyaları** duruyor (ör. `hero-home.jpg` = `hero-tazelik.jpg`, `hero-bio.jpg` = `hero-nachhaltigkeit.jpg`, `bio-brot.jpg` = `produkt-brot.jpg`). Yapılacak: gerçek dosyaları **aynı adlarla** klasöre bırak, `node scripts/blur.mjs` çalıştır.

**Kurallar (spec §6)**: Fotoğraf her zaman 1 px `frame` içinde, **üstünde metin yok, overlay yok, gradyan yok**; caption `data` stilinde çerçevenin altında. Tek istisna üç editoryal hero (Magazin makalesi, Rezept detayı, 404): `scrim-editorial` (mürekkep tabanlı, alttan ağırlıklı; beyaz metin ≥ 9.15:1). Oranlar: ürün/kategori/tarif/hero plakası 4:5 · makale/tarif-large 3:2 · Markenwelten/galeri/editoryal 16:9 · PageHero plakası 21:9. Tek grade `.img-grade` (`saturate(1) contrast(1.04)`, dark `+ brightness(.92)`), `SmartImage grade={false}` yalnızca logo/kesik ürün. Gerçek fotoğraflarda yüzler kırpılmaz, metin bindirilmez. Eksik görsel: `bg-surface frame` + „Bild folgt" caption.
Blur-up: `scripts/blur.mjs` **iki klasörü** (`placeholders` + `store`) tarar → `content/blur.json` (14 px LQIP); `<SmartImage blur={getBlur(src)}>`.

## 6. Bileşen Kütüphanesi (ui/ + components/)

- **Marka (`components/brand/`)**: `Logo` (SVG 250×100 kırmızı blok + ölçülü wordmark path, `LogoMark`, `REWE_PATH`, `LOGO_SIZES` header 32 / sheet 36 / footer 48; merchant satırı „Rödelheim · Dein Markt · Alamyaar oHG"), **`BrandLockup`** (`sub="bio"`: tek koyu yeşil yuvarlatılmış alan, beyaz REWE + script „Bio" — kırmızı blok yok; `sub="regional"`: kırmızı REWE bloğu + script „Regional" + kesikli kalp, beyaz kesik çerçeveli etiket, `variant="stacked"`; boyut sm 24 / md 36 / lg 48 / xl 64; `subLogos` doluysa `<img>`), **`RegionSign`** (sarı `#FFCC00` „Aus deiner Region" raf tabelası + çizgi traktör; raf bağlamları için), `Cta` (primary ≤ 1/viewport · secondary · ghost · inverse · link · danger; sm h-11 / md h-12 / lg h-14), `Eyebrow` (`num` / `auto` / `regional` / `rule`), `SectionHeading` (12 kolonlu `rule` satırı: eyebrow 1–3 · başlık 4–9 · metin 10–12 · `aside`), `PageHero` (açık kâğıt; görsel **plaka** olarak başlığın altında, asla arka plan; `breadcrumbs`, `num`, `compact`, eyebrow string veya node), `Breadcrumbs` (JSON-LD dahil).
- **Layout**: `SiteHeader` (sticky, **opak kâğıt**, sabit yükseklik 56/64 px, aktif rota alt çizgisi, `StoreChip` ≥ 1360 px, mega + Mehr panelleri `absolute top-full`), `SiteFooter` (`.on-block brand-rule`, veri `dl`, **`FooterHours`** gruplu saatler + canlı satır, 4 link sütunu, ödeme işaretleri, „Rödelheim" watermark, yasal satır „REWE Ali Alamyaar oHG · selbstständiger REWE-Kaufmann · Partner der REWE Group"), `SearchDialog` (türe göre gruplu), `CookieConsent` (statistics/marketing anahtarları), `Providers` (sonner Toaster: mobilde MobileCartBar'ın 88 px üstü), `ScrollProgress` (2 px kırmızı), `template.tsx` (sayfa geçişi).
- **Tipografi utility'leri**: `.display`, `.num`, `.data` / `.data-lg`, `.eyebrow*`, `.price*`, `.rule` / `.rule-strong` / `.rule-b` / `.frame` / `.brand-rule`, `.on-block` / `.on-paper`, `.img-grade`, `.scrim-editorial`, `.card-hover`, `.img-zoom`, `.prose-editorial`.
- **Kartlar**: `ProductCard` (hairline, 4:5, rozetler, 44 px favori, kalıcı `AddToCart icon`, quick view, PriceTag md + Pfand, geçerlilik satırı, < 48 h countdown + 3 px progress), `CategoryCard`, `RecipeCard`, `ArticleCard`.
- **Ticaret**: `PriceTag` (sm/md/lg/**poster**; „statt", Grundpreis her zaman, Pfand ink-muted), `Badges` (sıra: indirim → angebot → knaller → bio → regional → vegan → neu → glutenfrei → bonus; Regional md'de traktör), `PfandChip`, `Rating`, `AddToCart` (icon/full/pill/primary; sepete ekle → 44→132 px **kalıcı QuantityStepper**'a dönüşür, „Rückgängig" toast 6 s), `QuantityStepper` (44 px hücreler, `input`), `BuyBox` (PDP sağ ray + **mobil alt fiyat çubuğu**, `:root[data-pdp-bar]`), `ProductGallery`, `CartDrawer` + `MobileCartBar`, `CartPage`, `CheckoutFlow` (`StepTrack`, radio kartlar), `OrderConfirmation`, `AccountPanel`, `LoginForm`, `ContactForm`, `JobApplicationForm`, **`form-primitives`** (`boxInput`/`boxTextarea`/`boxSelect` 48 px, `Field`, `FieldLabel`, `FieldError` ikon+metin, `StepTrack`, `choiceCard`, `plate`), `CategoryBrowser` (Regional/Bio filtre kutuları), `RecipeFilter`, **`ArticleFilter`** (Magazin: lead 1–8 + iki kompakt 9–12 + grid).
- **Motion**: `Reveal` / `Stagger` / `StaggerItem` (blur yok), **`WordReveal`** (CSS kelime maskesi, LCP-güvenli), `Marquee` (**statik** veri satırı), `Countdown` (+ `elapsedShare`, `msLeft`), `ProgressBar`, `Counter`, `ScrollProgress`.
- **İmza (`components/signature/`)**: `FreshnessClock` (`data` çipi, `openState` ile nokta), **`StoreChip`** (header/Filiale/teaser: „Geöffnet · bis 22:00" / „schließt in 2 h 14 min" / „Geschlossen · öffnet Mo 07:00" / „Öffnungszeiten folgen"; 30 s tick, hydration-safe), `JourneyMap` (Produktreise), `BulkIngredients`, `PfandKompass` (sonuç `.on-block`, toplam `block-bio`), `PointsCalculator` (REWE Bonus; petrol alan + sarı rakamlar), `StoreSelector` + `WhenStoreChosen`, `StoreFinder` (+ `StoreHours`, `MyStoreButton`, `StoreMapLazy`), `FlipBrochure` (hero deal, 45° çevirme, **liste görünümü tablosu**, yasal satır), `store-map-inner` (gri tile, token renkleri).
- **Markenwelten (`components/worlds/`)**: **`ProducerMap`** + `producer-map-inner` (Leaflet; kırmızı mağaza işareti, mürekkep halkalı Erzeuger, kesikli 100 km çemberi, listeden fly-to), **`SeasonCalendar`** (Hessen 15 ürün × 12 ay `num` heatmap, `bg-bio-tint`, güncel ay 3 px kırmızı çizgi, mount sonrası hesaplanır), **`SealsTable`** (EU-Bio · Naturland · Bioland · Demeter × 5 kriter; REWE Bio taşıyanlar yeşil kare), **`WorldFaq`**.
- **Yardımcılar**: `lib/hours.ts` (`openState`, `formatOpenState`, `storeChipParts`, `hessenHolidays`, `berlinParts`, `CLOSES_SOON_MIN = 180`), `lib/format.ts` (`formatPrice`, `formatDiscount` U+2212, `formatBasePrice`, `formatDateShort` „Sa. 11.10.", `discounted`), `lib/hooks.ts` (`useMounted`, `useTick`), `lib/seo.ts`, `lib/blur.ts`, `lib/store/{cart,prefs,ui}.ts` (zustand).
- **shadcn (`components/ui/`, yeniden stillendirilmedi — `--primary`/`--radius` token'larını takip eder)**: accordion, badge, button, checkbox, dialog, dropdown-menu, input, label, popover, progress, radio-group, scroll-area, select, separator, sheet, skeleton, slider, smart-image, switch, tabs, textarea, tooltip; sonner (Toaster).
- **Kaldırıldı**: `CharReveal` (→ `WordReveal`), glass/compress/`data-header-theme` header modeli ve tüm `pt-[72px]` matematiği, altın eyebrow/çizgi/focus (`gold-line`, `gold-glow`, `fresh-glow`), Ken Burns, hareketli marquee, `.serif` / `.mono` sınıfları (→ `.display` / `.num`), `Cta gold`, `next-themes`.

## 7. Motion Spesifikasyonu (spec §5 — ağırlık durgunluktan gelir)

İlke: UI 160–240 ms, giriş ≤ 650 ms, yalnızca `transform`/`opacity` (asla `filter`), `once: true`, **autoplay yok**, viewport başına en fazla bir sürekli öğe (canlı nokta: 3 döngü, sonra sabit). Belgeli istisnalar: `Counter` 1,2 s ve Produktreise çizimi 1,6 s (veri görselleştirme).

| Öğe | v1 | v2 (kod) |
|---|---|---|
| `Reveal` | y 24 + blur 8, 800 ms | opacity + y 16→0, **600 ms**, expo, viewport −8 %, **blur yok** |
| `Stagger` | gap .08, blur | gap .06, öğe 600 ms |
| Hero başlık | `CharReveal` harf-harf blur | **`WordReveal`**: kelime maskesi, translateY 110 % → 0, 650 ms, 50 ms/kelime, saf CSS |
| Ken Burns 24 s | var | **silindi** — tüm fotoğraflar sabit |
| Marquee 40 s | hareketli | **statik** veri satırı, mobilde scroll-snap |
| Kart hover | lift −6 px + shadow 700 ms | `border-color line → line-strong`, 180 ms |
| `img-zoom` | 1.05 / 700 ms | 1.02 / 500 ms |
| Header | glass/renk/compress 500 ms | **sabit**, hiçbir şey animasyon yapmaz; aktif nav çizgisi 180 ms |
| Mega / Mehr paneli | y −8, 350 ms | y −6, 220 ms giriş / 160 ms çıkış |
| Mobil sheet | x 16, 500 ms, stagger 40 | y 8, 400 ms, stagger 35 ms |
| `template.tsx` | y 12, 600 ms | y 8, 400 ms (ilk boyama asla gizlenmez) |
| Sepet ikonu | scale + rotate | scale 1 → 1.12 → 1, 300 ms |
| Count `Dot` | spring 500/18 | spring 500/**30** |
| Favori kalp | 1.35 | 1.25, 300 ms |
| Canlı nokta | `animate-ping` sonsuz | `live-pulse` 2 s × 3, sonra sabit (Frische-Uhr + StoreChip, tek `openState`) |
| Cookie kartı | spring + scale | opacity + y 16→0, 240 ms |
| Checkout adımı | x ±16, 350 ms | x ±12, 240 ms |
| Sepete ekle | ✓ 1,4 s | stepper'a dönüşüm 44 → 132 px, 240 ms; qty > 0 iken kalıcı; „Rückgängig" toast 6 s |
| Countdown | 1 s tick | aynı, `tabular-nums`, geçişsiz; < 48 h otomatik görünür |
| Kampanya progress çizgisi | — | genişlik veriden, mount'ta 600 ms |
| `Counter` | 1,5 s | 1,2 s cubic ease-out, once (istisna) |
| Journey route | 2 s, iki pulse | 1,6 s; pulse yalnızca hedefte (istisna) |
| FlipBrochure | rotateY 70°, 600 ms | 45°, 450 ms; reduced motion → fade 200 ms |
| Pfand / Bonus sonucu | `m.p` | scale .96→1 + opacity, 240 ms |
| ScrollProgress | spring | 2 px kırmızı |
| Reduced motion | Framer `useReducedMotion` | aynı + global CSS kill switch (`animation/transition-duration: 0.01ms`) |

## 8. SEO / Erişilebilirlik / Performans

- **SEO**: Metadata API + OG (`hero-home.jpg` varsayılan) + `alternates` (canonical, hreflang de/en/x-default), `sitemap.ts` (+ `/regional`, `/bio`), `robots.ts`. JSON-LD: `Organization` + `GroceryStore` (layout; Filiale sayfasında `openingHoursSpecification` yalnızca `hoursStatus: "published"` ise), `WebSite`, `Product` (+ `Offer`, `AggregateRating`, `Brand`), `Recipe`, `JobPosting`, `Article`, `BreadcrumbList`, `FAQPage` (Kontakt, Regional, Bio), `CollectionPage` + `ItemList` (Regional, Bio).
- **Erişilebilirlik (WCAG 2.2 AA)**: Skip-link (kırmızı/beyaz), focus ring 2 px mürekkep offset 3 px (bloklarda beyaz), **tüm etkileşimli hedefler ≥ 44 px** (ikon butonlar, favori, stepper, LangSwitch, pager, cookie, çipler), yasal mikro metin ≥ 12 px, hata asla yalnız renkle (ikon + metin, `aria-live`), tüm metin/zemin çiftleri hesaplanmış AA (spec §1.1: ink/paper 18.42, red-text/paper 5.81, beyaz/red 5.81, bio-text/paper 6.62, block-red/block 5.60; dark: red-text 5.74, beyaz/red 5.18), tablolar (`SeasonCalendar`, `SealsTable`, Prospekt listesi) başlık/scope/sr-only hücre metni ile. Header **opak** (backdrop-filter yok), motion'da blur yok, reduced motion global.
- **Kırmızı bütçesi** (QA kuralı): 1440×900 `/de` light + dark ekran görüntüsünde hue 345–360°, doygunluk > %60 pikseller **< %4** (sert sınır %10, alt sınır %1). Header'da kırmızı yalnızca logo bloğu, aktif nav alt çizgisi ve sepet Dot'u.
- **Perf**: `next/image` (AVIF/WebP, blur-up, `preload` prop), iki preload font (Schibsted, Figtree; 66 KB), Geist Mono + script fontları lazy, `font-synthesis-weight: none`, Framer `LazyMotion`, ilk boyamada gizlenen içerik yok, Leaflet yalnızca `dynamic({ ssr: false })`, animasyonlar transform/opacity. Hedef: LCP < 2,0 s, CLS < 0,05, hero AVIF ≤ 160 kB. `docs/QA-REPORT.md` **v1 ölçümüdür** (Ken Burns vb. anlatır); v2 Lighthouse/axe/red-budget ölçümü yeniden alınacak (spec §8 kontrol listesi, `scripts/red-budget.mjs` Playwright).

## 9. Çalışma Sırası ve durum

**Tamamlandı (v2, 2026-10-04)**
1. ✅ Tasarım yarışması (3 yön × 9 jüri) → `DESIGN-SPEC.md`; yön B „Schweizer Präzision" + A/C aşıları.
2. ✅ G1 Foundation: token'lar, fontlar, `Logo`/`LogoMark`, `BrandLockup`, `RegionSign`, `Cta`, `Eyebrow`, `SectionHeading`, `PageHero`, `WordReveal`, `StoreChip` + `lib/hours.ts`, `icon.svg`/favicon, marka hijyeni (claim, REWE Bonus, 43 eyebrow öneki).
3. ✅ G2 Chrome: opak sticky header + Regional/Bio nav + Markenwelten mega satırı, `.on-block` footer + `FooterHours` + watermark, SearchDialog, CartDrawer/MobileCartBar, cookie, 404, template.
4. ✅ G3 Ana sayfa: kâğıt hero + veri şeridi, statik marquee, 7 numaralı bölüm, Markenwelten karoları, manifesto bloğu, Mein Markt, newsletter; kart bileşenleri.
5. ✅ G4 Ticaret primitifleri + formlar: Badges (knaller/bonus), PriceTag poster, AddToCart morph + undo, QuantityStepper 44 px, Checkout StepTrack, `form-primitives`.
6. ✅ G5 Sortiment · Produkt (sticky ray + mobil çubuk) · Rezepte (editoryal hero + sticky Zutaten) · Angebote (hero deal + liste görünümü) · Magazin (`ArticleFilter`, gerçek galeri + video).
7. ✅ G6 Filialen (canlı saat tablosu, servisler, rota, video, „Meine Filiale") · Über uns · Nachhaltigkeit · Karriere · Bonus (REWE Bonus) · Kontakt · Konto · Login · Warenkorb · Checkout · Legal; Pfand-Kompass + Bonus-Rechner.
8. ✅ G7 `/regional` (Versprechen, Erzeuger-Karte, Saisonkalender, Regionalfenster, FAQ) + `/bio` (Standards, Siegel tablosu, yeşil bant, Bio-Regal, FAQ) + 7 yeni REWE Bio ürünü + `regional.json`/`bio.json`.
9. ✅ Gerçek medya: Resilienzwoche-2026 makalesi (cover + 3 galeri + klip), mağaza galerisi + klip, `blur.mjs` iki klasör.
10. ✅ Faz-3 temizliği: legacy alias'lar/utility'ler silindi; §3.4 grep'leri sıfır (forest/cream/gold/emerald/Fraunces/serif/mono/PAYBACK/lieben Lebensmittel); tsc + eslint temiz; messages 726/726.

**Müşteriden beklenen (kod değişikliği gerektirmez)**
- [ ] Adres, telefon, e-posta, açılış saatleri → `stores.json` (`address.status`, `hoursStatus` → `"published"`), `settings.contact.status`. Yayınlanınca header/Frische-Uhr/Filiale/footer canlı „Geöffnet · bis 22:00" durumuna geçer, GroceryStore JSON-LD saat alır.
- [ ] Resmî REWE logo dosyası → `public/brand/`, `settings.brand.logo`; REWE Bio / REWE Regional / „Aus deiner Region" resmî dosyaları → `settings.brand.subLogos.{bio,regional,regionSign}` (tipografik yeniden üretim otomatik yerini bırakır).
- [ ] Ekip isimleri ve portreleri → `about.json → team[]` (3 isim `null`, 4 kayıt `pending`), `ekip-1..4.jpg`.
- [ ] Impressum, Datenschutz, AGB, Widerruf → `legalPages.json` (`status: "published"`, `body`, `updatedAt`).
- [ ] **5 ek mağaza fotoğrafı ve kampanya fotoğrafları**: sohbette/mailde paylaşıldı ama **dosya olarak ulaşmadı** → `public/images/store/` + `stores.json → images[]` / `campaigns` görselleri.
- [ ] **Etkinlik fotoğrafları için görüntü hakları**: Resilienzwoche görsellerinde itfaiye, BBK ve Land Hessen konukları var → yayın öncesi kişi/kurum izinleri.
- [ ] **REWE Bonus koşulları** (puan/€ oranı, hoş geldin puanı, Vorteile metinleri) → `settings.bonus` + `bonus.json`; mevcut rakamlar varsayım.
- [ ] Regional/Bio nihai görselleri → aynı adlarla `public/images/placeholders/`, ardından `node scripts/blur.mjs`.
- [ ] Newsletter sağlayıcısı, sosyal medya URL'leri (`#`), ödeme/giriş entegrasyonu.

**Açık QA maddeleri**: v2 Lighthouse + axe (light/dark) + red-budget ekran görüntüsü; dark modda harita işareti ve `BrandLockup regional` beyaz etiketi; 390 px'te sezon tablosu; `/kategorien/alle` Regional/Bio ön-filtresini URL'den almıyor.

### REWE Dortmund'u neden geçer
Dortmund (rewe-dortmund.de): kırmızı üst bar, slider, şablon kart grid'i, stok fotoğraf, 28–40 px sistem yazısı, her linkte kırmızı. Biz: beyaz opak header'da **tek kırmızı blok**; slider yerine tek başlık + tek fotoğraf + veri şeridi; kartlar yerine çizgiler; tek fotoğraf tonu; 112 px başlıklar; kırmızı yalnızca anlam taşıdığı yerde; canlı açık/kapalı durumu (Europe/Berlin, Hessen tatilleri), tasarlanmış dark mode, de/en, dijital Prospekt'te ürün linkleri ve liste görünümü, REWE Regional / REWE Bio için kendi dünyaları (Erzeuger-Karte, Saisonkalender, Siegel tablosu). Dortmund'da bunların hiçbiri yok — ve sonuç yine ilk bakışta REWE: fiyat > isim > Grundpreis hiyerarşisi, kırmızı/beyaz blok, „REWE. Dein Markt." ve çitli alt-marka renkleri REWE'nin kendi dilidir.
