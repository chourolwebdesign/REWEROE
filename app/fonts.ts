import { Bricolage_Grotesque } from "next/font/google";

/** Überschriften: variable Bricolage Grotesque mit optischer Größe (große Titel bekommen den Display-Schnitt). */
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--font-bricolage",
  display: "swap",
});

// Fließtext nutzt die Systemschrift (SF Pro, Roboto, Segoe UI): kein Download, sofort lesbar.
