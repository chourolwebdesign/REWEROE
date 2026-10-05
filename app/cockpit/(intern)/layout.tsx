import { CockpitShell } from "@/components/cockpit/cockpit-shell";
import { requireEditor } from "@/lib/cockpit/auth";

/** Alles hinter der Anmeldung. Zusätzlich prüft jede Server Action selbst über requireEditor. */
export default async function InternLayout({ children }: { children: React.ReactNode }) {
  const { editor } = await requireEditor();
  return <CockpitShell editorName={editor.name}>{children}</CockpitShell>;
}
