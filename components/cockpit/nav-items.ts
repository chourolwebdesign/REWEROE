import { FileText, LayoutDashboard, MessageSquareHeart, Newspaper } from "lucide-react";

/** Navigation des Cockpits */
export const COCKPIT_NAV = [
  { href: "/cockpit", label: "Übersicht", icon: LayoutDashboard },
  { href: "/cockpit/prospekt", label: "Prospekt", icon: Newspaper },
  { href: "/cockpit/feedback", label: "Feedback", icon: MessageSquareHeart },
  { href: "/cockpit/inhalte", label: "Inhalte", icon: FileText },
] as const;
