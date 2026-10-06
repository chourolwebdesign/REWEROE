import Image, { getImageProps } from "next/image";
import type { FlyerRecord } from "@/lib/prospekt/select";
import { flyerImage } from "@/lib/prospekt/urls";

type FlyerPick = Pick<FlyerRecord, "id" | "format" | "page_count" | "page_width" | "page_height">;

const THUMB = 480;
const thumbHeight = (f: FlyerPick) => Math.round((f.page_height / f.page_width) * THUMB);

/**
 * Prospektseite über die Next-Bildoptimierung: AVIF/WebP in der angezeigten Breite statt der hochgeladenen JPEG/WebP-Dateien
 * (Vorschau ~200 KB → ~30 KB). Wirkt auch für schon hochgeladene Prospekte; die Quelle bleibt der Rewrite /prospekt-bilder.
 */
export function FlyerImage({
  flyer,
  page,
  size,
  sizes,
  priority = false,
  alt,
  className,
}: {
  flyer: FlyerPick;
  page: number;
  size: "thumb" | "full";
  sizes: string;
  priority?: boolean;
  alt?: string;
  className?: string;
}) {
  return (
    <Image
      src={flyerImage(flyer, page, size)}
      width={size === "thumb" ? THUMB : flyer.page_width}
      height={size === "thumb" ? thumbHeight(flyer) : flyer.page_height}
      sizes={sizes}
      quality={size === "thumb" ? 75 : 85}
      alt={alt ?? `Prospektseite ${page} von ${flyer.page_count}`}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}

/** Große Fassung für die Vergrößerung (PhotoSwipe): bis 1 920 px, Qualität 85 */
export function flyerZoomSrc(flyer: FlyerPick, page: number) {
  return getImageProps({ src: flyerImage(flyer, page, "full"), width: flyer.page_width, height: flyer.page_height, sizes: "100vw", quality: 85, alt: "" }).props.src;
}

/** Kleine Fassung als Platzhalter in der Vergrößerung, bis die große geladen ist */
export function flyerMiniSrc(flyer: FlyerPick, page: number) {
  return getImageProps({ src: flyerImage(flyer, page, "thumb"), width: 192, height: Math.round((flyer.page_height / flyer.page_width) * 192), quality: 75, alt: "" }).props.src;
}
