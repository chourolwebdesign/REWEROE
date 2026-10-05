import type { Markt } from "@/lib/types";

/**
 * Stammdaten des Markts – die einzige Quelle für Seiten, Footer und JSON-LD.
 *
 * Quellen (abgerufen am 04.10.2026):
 * - REWE-Marktseite: Adresse, Telefon, Öffnungszeiten, Services (nur „Bäckerei“ und „Sushi“ gelistet)
 * - Instagram @rewealialamyaar: Adresse, Öffnungszeiten, Prospekt-Link
 * - OpenStreetMap: Koordinaten (Objekt „REWE“, Thudichumstraße)
 *
 * Was nicht belegt ist, bleibt null bzw. fehlt und wird nicht angezeigt → docs/BETREIBER-CHECKLISTE.md.
 */
const destination = encodeURIComponent("REWE, Thudichumstraße 18-22, 60489 Frankfurt am Main");

export const markt: Markt = {
  name: "REWE Rödelheim",
  legalName: "REWE Ali Alamyaar oHG",
  marketId: "320168",
  address: { street: "Thudichumstraße 18–22", zip: "60489", city: "Frankfurt am Main", district: "Rödelheim", country: "DE" },
  geo: { lat: 50.1269385, lng: 8.6137674 },
  phone: { display: "069 945158650", e164: "+4969945158650" },
  email: null,
  hours: {
    regular: {
      0: null,
      1: ["07:00", "22:00"],
      2: ["07:00", "22:00"],
      3: ["07:00", "22:00"],
      4: ["07:00", "22:00"],
      5: ["07:00", "22:00"],
      6: ["07:00", "22:00"],
    },
    // Vom Markt bestätigte Ausnahmen, z. B. { date: "2026-12-24", label: "Heiligabend", hours: ["07:00", "14:00"] }.
    // Feiertage in Hessen und die Schlusszeiten nach § 3 HLöG rechnet lib/hours.ts selbst.
    specialDays: [],
  },
  services: [
    { id: "baeckerei", name: "Bäckerei", text: "Brot, Brötchen und Gebäck direkt bei uns im Markt." },
    { id: "sushi", name: "Sushi", text: "Frisch zum Mitnehmen – direkt bei uns im Markt." },
  ],
  instagramHandle: "rewealialamyaar",
  links: {
    // Link vom Betreiber (Agentur-Chat 04.10.2026) – öffnet direkt den Wochenprospekt dieses Markts.
    flyer:
      "https://www.rewe.de/angebote/frankfurt-roedelheim/320168/rewe-thudichumstrasse-18-22/?icid=prod_nn_subnavi_standard_angebote&market-flyer=active",
    marktseite: "https://www.rewe.de/marktseite/frankfurt-roedelheim/320168/rewe-markt-thudichumstrasse-18-22/",
    instagram: "https://www.instagram.com/rewealialamyaar/",
    // Wie auf der REWE-Marktseite verlinkt
    jobs: "https://karriere.rewe.de/jobs/suche?location=60489&range=25&sort=date",
    ausbildung: "https://karriere.rewe.de/ausbildung",
    googleMaps: `https://www.google.com/maps/dir/?api=1&destination=${destination}`,
    appleMaps: `https://maps.apple.com/?daddr=${destination}`,
  },
};

export const addressLine = `${markt.address.street}, ${markt.address.zip} ${markt.address.city}`;
