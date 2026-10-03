"use client";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { CartDrawer, MobileCartBar } from "@/components/commerce/cart-drawer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { ScrollProgress } from "@/components/motion/scroll-progress";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ScrollProgress />
      {children}
      <CartDrawer />
      <MobileCartBar />
      <CookieConsent />
      <Toaster
        position="bottom-left"
        toastOptions={{
          classNames: { toast: "!rounded-[12px] !border-gold/40 !bg-card !text-foreground !shadow-lift", description: "!text-ink-muted" },
        }}
      />
    </ThemeProvider>
  );
}
