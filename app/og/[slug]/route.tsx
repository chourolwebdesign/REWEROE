import { ogCards, renderOgCard } from "@/lib/og";

/** Teilen-Bilder als statische JPEGs (/og/start.jpg, /og/karriere.jpg, /og/beitrag-….jpg), beim Build erzeugt. */
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;

export function generateStaticParams() {
  return Object.keys(ogCards()).map((name) => ({ slug: `${name}.jpg` }));
}

export async function GET(_req: Request, { params }: RouteContext<"/og/[slug]">) {
  const { slug } = await params;
  const card = ogCards()[slug.replace(/\.jpg$/, "")];
  if (!card) return new Response("Nicht gefunden", { status: 404 });
  const jpeg = await renderOgCard(card);
  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" },
  });
}
