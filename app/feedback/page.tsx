import type { Metadata } from "next";
import { headers } from "next/headers";
import { FeedbackFlow } from "@/components/feedback/feedback-flow";
import { markt } from "@/content/markt";
import { parseAcceptLanguage, pickLang } from "@/lib/feedback/lang";

export const metadata: Metadata = {
  title: "Wie war dein Einkauf?",
  description: "Feedback zum Einkauf bei REWE Rödelheim – anonym und in 10 Sekunden.",
  robots: { index: false, follow: false },
};

/** Sprache aus dem Browser (Accept-Language): die Seite erscheint gleich in der richtigen Sprache, ohne Umspringen. */
export default async function FeedbackPage() {
  const lang = pickLang(parseAcceptLanguage((await headers()).get("accept-language")));
  return <FeedbackFlow initialLang={lang} googleUrl={markt.links.googleReview} />;
}
