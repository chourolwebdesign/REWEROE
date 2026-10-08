import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";

export const metadata: Metadata = {
  title: "Seite nicht gefunden",
  robots: { index: false },
};

/** 404 aus `notFound()` in einer Seite des Layouts (unbekannter Beitrag): das Layout liefert Kopf, main und Footer. */
export default function NotFound() {
  return <NotFoundContent />;
}
