/**
 * Structured data for search engines. Emitted through innerHTML (not as a React <script> element)
 * so client-side navigations never trigger React's "script tag while rendering" warning.
 * JSON-LD is data, not executable code, so it may live anywhere in the DOM; `<` is escaped per Next.js guidance.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <div hidden aria-hidden dangerouslySetInnerHTML={{ __html: `<script type="application/ld+json">${json}</script>` }} />;
}
