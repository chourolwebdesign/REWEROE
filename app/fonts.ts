import { Fraunces, Inter, Space_Grotesk } from "next/font/google";

/**
 * German diacritics (Ä Ö Ü ß) are part of the `latin` subset, so `latin-ext` is not needed.
 * Fixed weights instead of full variable axes keep the font payload small (LCP).
 */
export const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-fraunces",
  display: "swap",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-space-grotesk",
  display: "swap",
  preload: false,
});
