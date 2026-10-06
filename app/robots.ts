import type { MetadataRoute } from "next";
import { INDEXABLE, SITE_URL } from "@/lib/site";

/** Vorschau und vercel.app: alles gesperrt. Mit SITE_INDEXABLE=true: alles erlaubt + Sitemap. */
export default function robots(): MetadataRoute.Robots {
  if (!INDEXABLE) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/", disallow: ["/cockpit", "/api"] }, sitemap: `${SITE_URL}/sitemap.xml`, host: SITE_URL };
}
