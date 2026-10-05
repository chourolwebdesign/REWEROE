/** Feedback-Seite (QR-Plakat im Markt): eigener ruhiger Rahmen ohne Website-Kopf, Footer und Schnellzugriff. */
export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] bg-soft text-ink">{children}</div>;
}
