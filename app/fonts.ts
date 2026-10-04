import { Bricolage_Grotesque, Inter } from "next/font/google";

/** Überschriften: variable Bricolage Grotesque mit optischer Größe (große Titel bekommen den Display-Schnitt). */
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

/** Fließtext und Bedienelemente. */
export const text = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
