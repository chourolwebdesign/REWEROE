import type { NextConfig } from "next";

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
  ["/karriere/:slug", "/karriere"],
];

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
    qualities: [70, 75, 85],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  async redirects() {
    return OLD_ROUTES.map(([source, destination]) => ({ source, destination, permanent: true }));
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
        source: "/media/:file*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
