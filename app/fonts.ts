import { Schibsted_Grotesk, Figtree, Geist_Mono } from "next/font/google";

/** Display. `weight: "variable"` is the only syntax next/font/google accepts for the variable axis;
 *  it serves the full wght 400–900 file (46 KB) → real 700/800, no faux bold. */
export const schibsted = Schibsted_Grotesk({ subsets: ["latin"], weight: "variable", variable: "--font-schibsted", display: "swap" });

/** Text, UI, prices (tabular-nums via CSS). 20 KB. */
export const figtree = Figtree({ subsets: ["latin"], weight: "variable", variable: "--font-figtree", display: "swap" });

/** Instrument data only. Not preloaded. 23 KB. */
export const geistMono = Geist_Mono({ subsets: ["latin"], weight: "variable", variable: "--font-geist-mono", display: "swap", preload: false });
