/**
 * Richtwerte für einen Notvorrat nach der Checkliste des Bundesamts für Bevölkerungsschutz und Katastrophenhilfe (BBK):
 * Vorrat für eine Person und 10 Tage, ca. 2.200 kcal pro Tag. Der Rechner skaliert linear mit Personen und Tagen.
 */
export const VORRAT_QUELLE = {
  title: "Bundesamt für Bevölkerungsschutz und Katastrophenhilfe (BBK)",
  url: "https://www.bbk.bund.de/",
};

export interface FoodGroup {
  id: string;
  label: string;
  /** Menge pro Person für 10 Tage */
  amount: number;
  unit: "kg" | "l";
  examples: string;
}

export const FOOD: FoodGroup[] = [
  { id: "getraenke", label: "Getränke", amount: 20, unit: "l", examples: "Wasser, Saft, Tee – 2 Liter pro Person und Tag, davon 0,5 Liter zum Kochen" },
  { id: "getreide", label: "Getreide, Brot, Kartoffeln, Nudeln, Reis", amount: 3.5, unit: "kg", examples: "Knäckebrot, Zwieback, Haferflocken, Nudeln, Reis" },
  { id: "gemuese", label: "Gemüse und Hülsenfrüchte", amount: 4, unit: "kg", examples: "Gemüsekonserven, Linsen, Bohnen, Erbsen" },
  { id: "obst", label: "Obst und Nüsse", amount: 2.5, unit: "kg", examples: "Obstkonserven, Trockenobst, Nüsse" },
  { id: "milch", label: "Milch und Milchprodukte", amount: 2.6, unit: "kg", examples: "H-Milch, Hartkäse, Milchpulver" },
  { id: "eiweiss", label: "Fisch, Fleisch, Eier", amount: 1.5, unit: "kg", examples: "Fisch- und Fleischkonserven, Volleipulver" },
  { id: "fette", label: "Fette und Öle", amount: 0.357, unit: "kg", examples: "Speiseöl, Butterschmalz" },
];

export const CHECKLISTS: { id: string; title: string; items: string[] }[] = [
  { id: "hygiene", title: "Hygiene", items: ["Toilettenpapier", "Seife und Waschmittel", "Zahnbürste und Zahnpasta", "Haushaltshandschuhe", "Müllbeutel"] },
  { id: "apotheke", title: "Hausapotheke", items: ["Persönliche Medikamente", "Verbandskasten", "Fieberthermometer", "Schmerz- und Fiebermittel"] },
  { id: "strom", title: "Bei Stromausfall", items: ["Taschenlampe", "Ersatzbatterien", "Batterie- oder Kurbelradio", "Powerbank", "Kerzen und Feuerzeug", "Bargeld"] },
  { id: "dokumente", title: "Dokumente", items: ["Ausweise und Pässe", "Urkunden", "Versicherungsunterlagen", "Wichtige Telefonnummern auf Papier"] },
];

export const DAY_OPTIONS = [3, 7, 10, 14] as const;
