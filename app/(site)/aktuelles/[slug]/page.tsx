import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Gallery } from "@/components/media/gallery";
import { formatDate } from "@/components/news/post-card";
import { getPost, posts } from "@/content/aktuelles";
import { articleJsonLd, breadcrumbJsonLd, ldScript } from "@/lib/jsonld";
import { Markdown } from "@/lib/markdown";
import { media } from "@/lib/media";
import { resolveImages } from "@/lib/resolve";
import { pageMetadata } from "@/lib/site";

// Kein dynamicParams = false: nach revalidatePath("/", "layout") aus dem Cockpit lieferte `next start` den schon
// vorgerenderten Beitrag sonst als 404 (NoFallbackError). Unbekannte Beiträge enden weiter in notFound().
export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/aktuelles/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/aktuelles/${post.slug}`,
    card: `beitrag-${post.slug}`,
    socialTitle: post.title,
    publishedTime: post.date,
  });
}

export default async function PostPage({ params }: PageProps<"/aktuelles/[slug]">) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();
  const cover = media[post.cover];

  return (
    <article>
      <PageHeader
        crumbs={[
          { href: "/aktuelles", label: "Aktuelles" },
          { href: `/aktuelles/${post.slug}`, label: post.title },
        ]}
        title={post.title}
        lede={post.excerpt}
        className="[&_h1]:max-w-[22ch]"
      >
        <p className="mt-6 text-[0.9375rem] font-semibold text-red">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
        </p>
      </PageHeader>

      <figure className="wrap">
        <div className="relative aspect-[3/2] overflow-hidden rounded-[1.75rem] bg-soft md:aspect-[2/1]">
          <Image src={cover.src} alt={cover.alt} fill loading="eager" fetchPriority="high" sizes="(min-width: 82.5rem) 1270px, 100vw" quality={75} className="object-cover" />
        </div>
        <figcaption className="mt-3 text-[0.8125rem] text-muted">{cover.credit}</figcaption>
      </figure>

      <div className="wrap pt-12 md:pt-16">
        {/* eine Spalte für Text und Quelle: 68 Zeichen in Fließtextgröße, damit beide bündig stehen */}
        <div className="mx-auto max-w-[68ch] text-[1.125rem]">
          <Markdown source={post.body} className="prose-article" />

          {post.source && (
            <p className="mt-12 rounded-2xl bg-soft p-5 text-[0.9375rem]">
              Quelle:{" "}
              <a href={post.source.url} target="_blank" rel="noopener" className="font-semibold underline underline-offset-4 hover:text-red">
                {post.source.title}
                <ArrowUpRight className="ml-0.5 inline size-4 align-[-0.15em]" aria-hidden />
                <span className="sr-only"> (öffnet in neuem Tab)</span>
              </a>
            </p>
          )}
        </div>
      </div>

      {post.gallery.length > 0 && (
        <section aria-labelledby="bilder-titel" className="wrap pt-20 md:pt-24">
          <h2 id="bilder-titel" className="text-h2">
            Bilder vom Tag.
          </h2>
          <Gallery items={resolveImages(post.gallery)} className="mt-8" />
        </section>
      )}

      <div className="wrap py-16 md:py-24">
        <Link href="/aktuelles" className="inline-flex min-h-11 items-center gap-2 font-semibold hover:text-red">
          <ArrowLeft className="size-4" aria-hidden /> Alle Beiträge
        </Link>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(articleJsonLd(post))} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={ldScript(
          breadcrumbJsonLd([
            { name: "Aktuelles", path: "/aktuelles" },
            { name: post.title, path: `/aktuelles/${post.slug}` },
          ]),
        )}
      />
    </article>
  );
}
