"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  slug: string;
  qty: number;
  /** Unit price at time of adding (already discounted). */
  price: number;
  pfand: number;
  weightGrams: number;
  name: string;
  image: string;
  unitLabel: string;
}

interface CartState {
  lines: CartLine[];
  lastAdded: number; // timestamp, drives icon bounce
  add: (line: Omit<CartLine, "qty">, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      lastAdded: 0,
      add: (line, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.slug === line.slug);
          const lines = existing
            ? s.lines.map((l) => (l.slug === line.slug ? { ...l, qty: l.qty + qty } : l))
            : [...s.lines, { ...line, qty }];
          return { lines, lastAdded: Date.now() };
        }),
      remove: (slug) => set((s) => ({ lines: s.lines.filter((l) => l.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => l.slug !== slug) : s.lines.map((l) => (l.slug === slug ? { ...l, qty } : l)),
        })),
      clear: () => set({ lines: [] }),
    }),
    { name: "rewe-rh-cart" },
  ),
);

export const cartTotals = (lines: CartLine[]) => {
  const count = lines.reduce((n, l) => n + l.qty, 0);
  const subtotal = lines.reduce((n, l) => n + l.qty * l.price, 0);
  const pfand = lines.reduce((n, l) => n + l.qty * l.pfand, 0);
  const weightGrams = lines.reduce((n, l) => n + l.qty * l.weightGrams, 0);
  return { count, subtotal, pfand, weightGrams, total: subtotal + pfand };
};
