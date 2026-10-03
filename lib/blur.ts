import map from "@/content/blur.json";
import type { Img } from "@/lib/content/types";

/** Server-side LQIP lookup (keeps blur data out of client bundles). */
export function getBlur(src: string): string | undefined {
  return (map as Record<string, string>)[src];
}

export type ImgVM = { src: string; alt: string; blur?: string };
export function imgVM(img: Img, alt: string): ImgVM {
  return { src: img.src, alt, blur: getBlur(img.src) };
}
