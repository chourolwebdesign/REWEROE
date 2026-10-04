"use client";
import { useSyncExternalStore } from "react";
import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
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

/** MobileCartBar is `bottom-3` + `h-14` (68 px tall edge); toasts sit 20 px above it. */
const TOAST_OFFSET_MOBILE = 88;

export function Providers({ children }: { children: React.ReactNode }) {
  const desktop = useIsDesktop();
  return (
    <>
      <LazyMotion features={domAnimation} strict>
        {/* §5 — the OS reduced-motion preference reaches every framer-motion animation, not only the few hooks that check it. */}
        <MotionConfig reducedMotion="user">
          <ScrollProgress />
          {children}
          <CartDrawer />
          <MobileCartBar />
          <CookieConsent />
          {/* §4.23 — paper toast with a 3 px red (error: --error) left rule. sonner ≥ 2 ignores `offset` below 600 px and
              reads `mobileOffset` instead, so both carry the cart-bar clearance. */}
          <Toaster
            position={desktop ? "bottom-left" : "bottom-center"}
            offset={desktop ? 16 : TOAST_OFFSET_MOBILE}
            mobileOffset={{ bottom: TOAST_OFFSET_MOBILE }}
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
        </MotionConfig>
      </LazyMotion>
    </>
  );
}
