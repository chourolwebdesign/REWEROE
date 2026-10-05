import type { Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { PostCard } from "@/components/news/post-card";
import { ButtonLink } from "@/components/ui/button";
import { InstagramIcon } from "@/components/ui/icons";
import { posts } from "@/content/aktuelles";
import { markt } from "@/content/markt";
import { breadcrumbJsonLd, ldScript } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/site";

export const metadata: Metadata = pageMetadata({
  title: "Aktuelles",
  description: "Neuigkeiten aus dem REWE-Markt in Frankfurt-Rödelheim.",
  path: "/aktuelles",
  card: "aktuelles",
});

export default function AktuellesPage() {
  const [first, ...rest] = posts;
  return (
    <>
      <PageHeader
        crumbs={[{ href: "/aktuelles", label: "Aktuelles" }]}
        eyebrow="Aktuelles"
        title="Neues aus Rödelheim."
        lede="Was bei uns im Markt passiert – Aktionen, Besuche und Neuigkeiten."
      />
      <section aria-label="Beiträge" className="wrap grid gap-4 pb-12">
        {first && <PostCard post={first} wide headingLevel="h2" reveal={false} />}
        {rest.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {rest.map((p) => (
              <PostCard key={p.slug} post={p} headingLevel="h2" />
            ))}
          </div>
        )}
      </section>
      <section aria-label="Instagram" className="wrap pb-24 md:pb-32">
        <div className="reveal flex flex-col gap-5 rounded-[1.75rem] bg-soft p-8 md:flex-row md:items-center md:justify-between md:p-10">
          <p className="max-w-[46ch] text-lede">Kleine Neuigkeiten, Clips und Einblicke posten wir zuerst auf Instagram.</p>
          <ButtonLink href={markt.links.instagram} external variant="ink" icon={<InstagramIcon className="size-[1.1em]" />}>
            @{markt.instagramHandle}
          </ButtonLink>
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={ldScript(breadcrumbJsonLd([{ name: "Aktuelles", path: "/aktuelles" }]))} />
    </>
  );
}
