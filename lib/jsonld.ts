import { markt } from "@/content/markt";
import type { Post } from "@/content/aktuelles";
import type { Job } from "@/content/jobs";
import { berlinNow, upcomingSpecialDays } from "./hours";
import { media } from "./media";
import { absoluteUrl, SITE_URL } from "./site";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] as const;
const STORE_ID = `${SITE_URL}/#markt`;

/** GroceryStore mit regulären Zeiten und den Feiertagen/Sonderzeiten der nächsten 60 Tage. */
export function storeJsonLd(now: Date = new Date()) {
  const regular = Object.entries(markt.hours.regular)
    .filter(([, h]) => h)
    .map(([d, h]) => ({ day: DAY_NAMES[Number(d)], opens: h![0], closes: h![1] }));
  const groups = new Map<string, string[]>();
  for (const r of regular) groups.set(`${r.opens}-${r.closes}`, [...(groups.get(`${r.opens}-${r.closes}`) ?? []), r.day]);

  const special = upcomingSpecialDays(berlinNow(now).date, 60).map((d) => ({
    "@type": "OpeningHoursSpecification",
    validFrom: d.date,
    validThrough: d.date,
    opens: d.hours ? d.hours[0] : "00:00",
    closes: d.hours ? d.hours[1] : "00:00",
  }));

  return {
    "@context": "https://schema.org",
    "@type": "GroceryStore",
    "@id": STORE_ID,
    name: markt.name,
    legalName: markt.legalName,
    brand: { "@type": "Brand", name: "REWE" },
    url: absoluteUrl("/"),
    image: absoluteUrl("/og.jpg"),
    telephone: markt.phone.e164,
    ...(markt.email ? { email: markt.email } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: markt.address.street.replace("–", "-"),
      postalCode: markt.address.zip,
      addressLocality: markt.address.city,
      addressRegion: "Hessen",
      addressCountry: markt.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: markt.geo.lat, longitude: markt.geo.lng },
    hasMap: markt.links.googleMaps,
    openingHoursSpecification: [...groups.entries()].map(([key, days]) => {
      const [opens, closes] = key.split("-");
      return { "@type": "OpeningHoursSpecification", dayOfWeek: days, opens, closes };
    }),
    ...(special.length ? { specialOpeningHoursSpecification: special } : {}),
    sameAs: [markt.links.instagram, markt.links.marktseite],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Start", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function articleJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    image: [absoluteUrl(media[post.cover].src.src)],
    author: { "@type": "Organization", name: markt.name, url: absoluteUrl("/") },
    publisher: { "@id": STORE_ID },
    mainEntityOfPage: absoluteUrl(`/aktuelles/${post.slug}`),
  };
}

const EMPLOYMENT: Record<Job["employment"], string> = { Vollzeit: "FULL_TIME", Teilzeit: "PART_TIME", Minijob: "PART_TIME", Ausbildung: "INTERN" };

export function jobJsonLd(job: Job) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.text,
    datePosted: job.datePosted,
    ...(job.validThrough ? { validThrough: job.validThrough } : {}),
    employmentType: EMPLOYMENT[job.employment],
    hiringOrganization: { "@type": "Organization", name: markt.legalName, sameAs: absoluteUrl("/") },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        streetAddress: markt.address.street.replace("–", "-"),
        postalCode: markt.address.zip,
        addressLocality: markt.address.city,
        addressRegion: "Hessen",
        addressCountry: "DE",
      },
    },
  };
}

/** `<script type="application/ld+json">` ohne Risiko durch `</script>` im Text. */
export const ldScript = (data: unknown) => ({ __html: JSON.stringify(data).replace(/</g, "\\u003c") });
