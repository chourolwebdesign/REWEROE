import type { GalleryMedia } from "@/components/media/gallery";
import type { HeroClip } from "@/components/home/rundgang-hero";
import type { GalleryItem } from "@/content/galerie";
import { clips, media, type ClipKey, type MediaKey } from "./media";

/** Inhalte (Schlüssel) → serialisierbare Props für die Client-Komponenten. */
export function resolveClip(key: ClipKey, caption: string): HeroClip {
  const c = clips[key];
  const p = media[c.poster];
  return { sources: c.sources, poster: p.src, alt: p.alt, caption };
}

export function resolveGallery(items: GalleryItem[]): GalleryMedia[] {
  return items.map((it) => {
    if ("clip" in it) {
      const c = clips[it.clip];
      const p = media[c.poster];
      return { type: "clip", sources: c.sources, poster: p.src, alt: p.alt, caption: it.caption, credit: c.credit };
    }
    const m = media[it.media];
    return { type: "image", image: m.src, alt: m.alt, caption: it.caption, credit: m.credit };
  });
}

export function resolveImages(keys: MediaKey[], captions?: Partial<Record<MediaKey, string>>): GalleryMedia[] {
  return keys.map((k) => ({ type: "image", image: media[k].src, alt: media[k].alt, caption: captions?.[k] ?? media[k].caption, credit: media[k].credit }));
}
