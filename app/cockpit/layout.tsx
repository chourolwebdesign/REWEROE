import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Markt-Cockpit", template: "%s · Markt-Cockpit" },
  robots: { index: false, follow: false },
};

/** Cockpit: eigener ruhiger Hintergrund, kein Website-Kopf und kein Footer. */
export default function CockpitRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[100dvh] bg-soft text-ink">{children}</div>;
}
