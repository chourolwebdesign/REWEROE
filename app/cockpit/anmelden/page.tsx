import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { LoginForm } from "@/components/cockpit/login-form";
import { safeNext } from "@/lib/cockpit/safe-next";

export const metadata: Metadata = { title: "Anmelden" };

export default async function LoginPage({ searchParams }: PageProps<"/cockpit/anmelden">) {
  const params = await searchParams;
  const notice = params.fehler === "keine-berechtigung" ? "Dieses Konto hat keinen Zugang zum Cockpit." : undefined;
  return (
    <main className="mx-auto grid min-h-[100dvh] w-full max-w-md content-center px-4 py-12">
      <LogoMark height={36} />
      <h1 className="mt-8 text-h2">Markt-Cockpit</h1>
      <p className="mt-3 text-lede text-muted">Melde dich mit deiner E-Mail-Adresse an.</p>
      <div className="mt-8 rounded-[1.75rem] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
        <LoginForm next={safeNext(params.weiter)} notice={notice} />
      </div>
      <p className="mt-6 text-[0.9375rem] text-muted">Passwort vergessen? Melde dich bei deiner Agentur.</p>
    </main>
  );
}
