import type { MetadataRoute } from "next";

/** Web-App-Manifest: „Zum Home-Bildschirm“ / „App installieren“. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "REWE Rödelheim",
    short_name: "REWE Rödelheim",
    description: "Prospekt der Woche, Öffnungszeiten und Neuigkeiten von REWE in der Thudichumstraße, Frankfurt-Rödelheim.",
    lang: "de",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0c0c0c",
    theme_color: "#0c0c0c",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Prospekt der Woche", short_name: "Prospekt", url: "/angebote", icons: [{ src: "/icons/shortcut-96.png", sizes: "96x96" }] },
      { name: "Öffnungszeiten & Anfahrt", short_name: "Öffnungszeiten", url: "/kontakt", icons: [{ src: "/icons/shortcut-96.png", sizes: "96x96" }] },
      { name: "Bewerben", url: "/karriere/bewerben", icons: [{ src: "/icons/shortcut-96.png", sizes: "96x96" }] },
    ],
  };
}
