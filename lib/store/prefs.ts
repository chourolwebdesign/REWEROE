"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Consent = { necessary: true; statistics: boolean; marketing: boolean; decidedAt: number | null };

interface PrefsState {
  favorites: string[];
  toggleFavorite: (slug: string) => void;
  storeSlug: string | null;
  setStore: (slug: string | null) => void;
  consent: Consent;
  setConsent: (c: Partial<Consent>) => void;
  shoppingList: { id: string; text: string; done: boolean }[];
  addListItem: (text: string) => void;
  toggleListItem: (id: string) => void;
  removeListItem: (id: string) => void;
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      favorites: [],
      toggleFavorite: (slug) =>
        set((s) => ({
          favorites: s.favorites.includes(slug) ? s.favorites.filter((f) => f !== slug) : [...s.favorites, slug],
        })),
      storeSlug: null,
      setStore: (slug) => set({ storeSlug: slug }),
      consent: { necessary: true, statistics: false, marketing: false, decidedAt: null },
      setConsent: (c) => set((s) => ({ consent: { ...s.consent, ...c, necessary: true, decidedAt: Date.now() } })),
      shoppingList: [],
      addListItem: (text) =>
        set((s) => ({ shoppingList: [...s.shoppingList, { id: `${Date.now()}`, text, done: false }] })),
      toggleListItem: (id) =>
        set((s) => ({ shoppingList: s.shoppingList.map((i) => (i.id === id ? { ...i, done: !i.done } : i)) })),
      removeListItem: (id) => set((s) => ({ shoppingList: s.shoppingList.filter((i) => i.id !== id) })),
    }),
    { name: "rewe-rh-prefs" },
  ),
);
