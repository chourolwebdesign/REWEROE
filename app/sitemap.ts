import type { MetadataRoute } from "next";
import { posts } from "@/content/aktuelles";
import { absoluteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number; changeFrequency: "weekly" | "monthly" | "yearly" }[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/angebote", priority: 0.9, changeFrequency: "weekly" },
    { path: "/markt", priority: 0.8, changeFrequency: "monthly" },
    { path: "/kontakt", priority: 0.8, changeFrequency: "monthly" },
    { path: "/aktuelles", priority: 0.6, changeFrequency: "weekly" },
    { path: "/karriere", priority: 0.6, changeFrequency: "monthly" },
    { path: "/impressum", priority: 0.2, changeFrequency: "yearly" },
    { path: "/datenschutz", priority: 0.2, changeFrequency: "yearly" },
  ];
  return [
    ...pages.map((p) => ({ url: absoluteUrl(p.path), changeFrequency: p.changeFrequency, priority: p.priority })),
    ...posts.map((p) => ({ url: absoluteUrl(`/aktuelles/${p.slug}`), lastModified: p.date, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
