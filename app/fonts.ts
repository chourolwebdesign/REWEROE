import { Fraunces, Inter, Space_Grotesk } from "next/font/google";

/**
 * German diacritics (Ä Ö Ü ß) are part of the `latin` subset, so `latin-ext` is not needed.
 * Minimal fixed weights keep the critical font payload small (LCP on mobile):
 * headings use Fraunces 500 only; body uses Inter 400/500; mono accents are not preloaded.
 */
export const fraunces = Fraunces({ subsets: ["latin"], weight: ["500"], variable: "--font-fraunces", display: "swap" });
export const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-inter", display: "optional" });
export const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-space-grotesk", display: "optional", preload: false });
