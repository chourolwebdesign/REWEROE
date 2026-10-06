import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Post } from "@/content/aktuelles";
import { media } from "@/lib/media";
import { cn } from "@/lib/utils";

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(iso + "T12:00:00Z"));

/**
 * Beitragskarte; `wide` = Bild links, Text rechts (Startseite/erster Beitrag).
 * `reveal={false}` für Karten im ersten Bildschirm – die sollen sofort stehen statt einzublenden.
 */
export function PostCard({
  post,
  wide = false,
  headingLevel = "h3",
  reveal = true,
}: {
  post: Post;
  wide?: boolean;
  headingLevel?: "h2" | "h3";
  reveal?: boolean;
}) {
  const H = headingLevel;
  return (
    <article
      className={cn(
        "group card-lift relative overflow-hidden rounded-[var(--radius-media)] bg-soft ring-1 ring-line/60",
        reveal && "reveal",
        wide && "lg:grid lg:grid-cols-[1.15fr_1fr]",
      )}
    >
      <div className={cn("relative aspect-[3/2] overflow-hidden", wide && "lg:aspect-auto lg:min-h-[26rem]")}>
        <Image
          src={media[post.cover].src}
          alt=""
          fill
          sizes={wide ? "(min-width: 64rem) 55vw, 100vw" : "(min-width: 48rem) 50vw, 100vw"}
          quality={85}
          className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03]"
        />
      </div>
      <div className="flex flex-col justify-center p-6 md:p-10">
        <p className="text-eyebrow text-red">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
        <H className="mt-3 text-h3 md:text-[clamp(1.5rem,1.2rem+1vw,2.25rem)]">{post.title}</H>
        <p className="mt-3 text-muted">{post.excerpt}</p>
        <p aria-hidden className="mt-6 inline-flex items-center gap-2 font-semibold">
          Weiterlesen <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </p>
      </div>
      <Link href={"/aktuelles/" + post.slug} aria-label={post.title} className="absolute inset-0 z-10" />
    </article>
  );
}
