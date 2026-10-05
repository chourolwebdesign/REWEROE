import { LayoutDashboard, MessageSquareHeart, Newspaper } from "lucide-react";

/** Navigation des Cockpits; „Inhalte“ folgt mit Stufe 4. */
export const COCKPIT_NAV = [
  { href: "/cockpit", label: "Übersicht", icon: LayoutDashboard },
  { href: "/cockpit/prospekt", label: "Prospekt", icon: Newspaper },
  { href: "/cockpit/feedback", label: "Feedback", icon: MessageSquareHeart },
] as const;
