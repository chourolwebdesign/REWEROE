import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/content";

export default function robots(): MetadataRoute.Robots {
  const base = getSettings().brand.siteUrl;
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/checkout", "/konto", "/warenkorb"] }], sitemap: `${base}/sitemap.xml` };
}
