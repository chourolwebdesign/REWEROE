"use client";
import { useSyncExternalStore } from "react";
import { LazyMotion, domAnimation } from "framer-motion";
import { Toaster } from "sonner";
import { CartDrawer, MobileCartBar } from "@/components/commerce/cart-drawer";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { ScrollProgress } from "@/components/motion/scroll-progress";

const MQ = "(min-width: 768px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
/** md+ → true. Server snapshot is desktop; the client corrects after hydration (no mismatch). */
const useIsDesktop = () => useSyncExternalStore(subscribe, () => window.matchMedia(MQ).matches, () => true);

export function Providers({ children }: { children: React.ReactNode }) {
  const desktop = useIsDesktop();
  return (
    <>
      <LazyMotion features={domAnimation} strict>
        <ScrollProgress />
        {children}
        <CartDrawer />
        <MobileCartBar />
        <CookieConsent />
        {/* §4.23 — paper toast with a 3 px red (error: --error) left rule; on mobile it sits above the MobileCartBar. */}
        <Toaster
          position={desktop ? "bottom-left" : "bottom-center"}
          offset={desktop ? 16 : 88}
          closeButton
          toastOptions={{
            duration: 4000,
            classNames: {
              toast: "!rounded-[2px] !border !border-line-strong !border-l-[3px] !border-l-red !bg-card !text-foreground !shadow-pop !font-sans",
              title: "!font-semibold !text-[14px]",
              description: "!text-ink-muted !text-[13px]",
              actionButton: "!h-9 !rounded-[2px] !bg-ink !text-paper !text-[13px] !font-semibold !px-3",
              closeButton: "!border-line !bg-card !text-ink",
              error: "!border-l-error",
            },
          }}
        />
      </LazyMotion>
    </>
  );
}
