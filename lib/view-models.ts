import { getCampaignForProduct, getProducer, type Product, type Badge } from "@/lib/content";
import { tx } from "@/lib/l10n";
import { discounted } from "@/lib/format";
import { imgVM, type ImgVM } from "@/lib/blur";

export interface CardProduct {
  slug: string; name: string; subtitle: string; category: string;
  price: number; oldPrice: number | null; discount: number | null; validUntil: string | null;
  basePrice: { per: string; amount: number }; pfand: number; badges: Badge[]; rating: number; reviews: number;
  weightGrams: number; image: ImgVM; unitLabel: string; regional: boolean; producerName: string | null;
}

/** Serializable product model for client cards. Resolves active campaign + producer. */
export function toCardProduct(p: Product, locale: string): CardProduct {
  const campaign = getCampaignForProduct(p.slug);
  const producer = getProducer(p.origin.producer);
  const unit = p.unit.unit === "Stück" ? (locale === "en" ? "pc" : "Stück") : p.unit.unit;
  return {
    slug: p.slug,
    name: tx(p.name, locale),
    subtitle: tx(p.subtitle, locale),
    category: p.category,
    price: campaign ? discounted(p.price, campaign.percent) : p.price,
    oldPrice: campaign ? p.price : null,
    discount: campaign?.percent ?? null,
    validUntil: campaign?.validUntil ?? null,
    basePrice: campaign ? { per: p.basePrice.per, amount: Math.round(discounted(p.basePrice.amount, campaign.percent) * 100) / 100 } : p.basePrice,
    pfand: p.pfand?.amount ?? 0,
    badges: p.badges,
    rating: p.rating,
    reviews: p.reviews,
    weightGrams: p.weightGrams,
    image: imgVM(p.images[0], tx(p.images[0].alt, locale)),
    unitLabel: `${p.unit.amount} ${unit}`,
    regional: (producer?.distanceKm ?? 999) <= 100,
    producerName: producer?.name ?? null,
  };
}

export function toCartItem(c: CardProduct) {
  return { slug: c.slug, price: c.price, pfand: c.pfand, weightGrams: c.weightGrams, name: c.name, image: c.image.src, unitLabel: c.unitLabel };
}
