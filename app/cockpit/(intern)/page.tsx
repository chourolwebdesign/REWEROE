import type { Metadata } from "next";
import { requireEditor } from "@/lib/cockpit/auth";

export const metadata: Metadata = { title: "Übersicht" };

export default async function UebersichtPage() {
  const { editor } = await requireEditor();
  return (
    <>
      <p className="text-eyebrow text-red">Markt-Cockpit</p>
      <h1 className="mt-2 text-h2">Hallo, {editor.name}.</h1>
    </>
  );
}
