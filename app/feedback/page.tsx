import type { Metadata } from "next";
import { FeedbackFlow } from "@/components/feedback/feedback-flow";
import { markt } from "@/content/markt";

export const metadata: Metadata = {
  title: "Wie war dein Einkauf?",
  description: "Feedback zum Einkauf bei REWE Rödelheim – anonym und in 10 Sekunden.",
  robots: { index: false, follow: false },
};

/** Startet immer auf Deutsch (Wunsch des Markts); andere Sprachen über die Auswahl oben. Ohne Sprachkopf ist die Seite statisch. */
export default function FeedbackPage() {
  return <FeedbackFlow initialLang="de" googleUrl={markt.links.googleReview} surveyUrl={markt.links.reweSurvey} />;
}
