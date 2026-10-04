"use client";
import { useEffect } from "react";
import { schibsted, figtree } from "@/app/fonts";
import "@/app/globals.css";

type Props = { error: Error & { digest?: string }; reset: () => void; retry?: () => void };

/**
 * Root error boundary — replaces the root layout, so it brings its own <html>/<body>, the token sheet and the two
 * brand fonts. No intl provider exists at this level: copy is German first with the English line beneath, and
 * styles are inline against the tokens in globals.css (they follow the OS colour scheme like the rest of the site).
 */
export default function GlobalError({ error, reset, retry }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  const again = () => (retry ?? reset)();

  const button: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 48, padding: "0 20px",
    borderRadius: 2, fontFamily: "var(--font-sans)", fontSize: 15, fontWeight: 600, lineHeight: 1, textDecoration: "none", cursor: "pointer",
  };

  return (
    <html lang="de" className={`${schibsted.variable} ${figtree.variable}`}>
      <body style={{ margin: 0, minHeight: "100svh", background: "var(--paper)", color: "var(--ink)", fontFamily: "var(--font-sans)" }}>
        <main style={{ maxWidth: 760, margin: "0 auto", padding: "clamp(40px, 8vw, 96px) 16px" }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink-muted)" }}>
            Fehler <span aria-hidden>·</span> <span lang="en">Error</span>
          </p>
          <h1 style={{ margin: "16px 0 0", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2.25rem, 1.6rem + 2.7vw, 4rem)", lineHeight: 1, letterSpacing: "-0.025em" }}>
            Da ist etwas schiefgelaufen.
          </h1>
          <p lang="en" style={{ margin: "12px 0 0", fontSize: 17, lineHeight: 1.5, color: "var(--ink-muted)" }}>Something went wrong.</p>
          <p style={{ margin: "24px 0 0", maxWidth: "48ch", fontSize: 17, lineHeight: 1.5, color: "var(--ink-2)" }}>
            Die Seite konnte gerade nicht geladen werden. Versuch es noch einmal — oder geh zurück zur Startseite.
            <br />
            <span lang="en">This page could not be loaded right now. Try again — or head back to the home page.</span>
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40, paddingTop: 24, borderTop: "1px solid var(--line)" }}>
            <button type="button" onClick={again} style={{ ...button, border: 0, background: "var(--red)", color: "var(--primary-foreground)" }}>
              Noch einmal versuchen <span aria-hidden>·</span> <span lang="en">Try again</span>
            </button>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- root boundary: a hard navigation discards the broken client state; next/link would reuse it */}
            <a href="/" style={{ ...button, border: "1px solid var(--line-strong)", background: "transparent", color: "var(--ink)" }}>
              Zur Startseite <span aria-hidden>·</span> <span lang="en">Home</span>
            </a>
          </div>
          {error.digest && (
            <p style={{ margin: "32px 0 0", fontFamily: "var(--font-mono)", fontSize: 12, letterSpacing: ".08em", color: "var(--ink-muted)" }}>
              Fehlercode <span lang="en">/ error code</span> {error.digest}
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
