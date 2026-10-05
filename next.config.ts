import type { NextConfig } from "next";
import { SUPABASE_URL } from "./lib/supabase/config";

/** Alte Routen der Online-Shop-Version → nächstliegende neue Seite. */
const OLD_ROUTES: [string, string][] = [
  ["/en", "/"],
  ["/en/:path*", "/:path*"],
  ["/filialen", "/markt"],
  ["/filialen/:path*", "/markt"],
  ["/ueber-uns", "/markt"],
  ["/nachhaltigkeit", "/markt"],
  ["/regional", "/markt#marken"],
  ["/bio", "/markt#marken"],
  ["/magazin/resilienzwoche-2026", "/aktuelles/resilienzwoche-2026"],
  ["/magazin", "/aktuelles"],
  ["/magazin/:path*", "/aktuelles"],
  ["/kategorien", "/angebote"],
  ["/kategorien/:path*", "/angebote"],
  ["/produkt/:path*", "/angebote"],
  ["/bonus", "/angebote"],
  ["/warenkorb", "/angebote"],
  ["/checkout", "/angebote"],
  ["/checkout/:path*", "/angebote"],
  ["/rezepte", "/"],
  ["/rezepte/:path*", "/"],
  ["/konto", "/"],
  ["/login", "/"],
  ["/agb", "/impressum"],
  ["/widerruf", "/impressum"],
  // alte Stellen-Detailseiten; /karriere/bewerben ist eine echte Seite
  ["/karriere/:slug((?!bewerben$).*)", "/karriere"],
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
    qualities: [70, 75, 85],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
    // Bewerbung mit Anhängen (bis 4 MB) + Formular-Overhead; Vercel nimmt höchstens 4,5 MB an.
    serverActions: { bodySizeLimit: "4.5mb" },
  },
  async redirects() {
    return OLD_ROUTES.map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async rewrites() {
    // Prospektbilder über die eigene Domain: keine Anfrage der Besucher an Drittanbieter, Caching durch Vercel.
    return [{ source: "/prospekt-bilder/:path*", destination: `${SUPABASE_URL}/storage/v1/object/public/prospekte/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
      {
        source: "/media/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        // unveränderlich: jeder Upload bekommt eine neue Prospekt-ID und damit neue Pfade
        source: "/prospekt-bilder/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
