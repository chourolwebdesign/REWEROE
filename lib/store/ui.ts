"use client";
import { create } from "zustand";

interface UiState {
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  cookieOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setCookieOpen: (v: boolean) => void;
}

export const useUi = create<UiState>((set) => ({
  cartOpen: false,
  searchOpen: false,
  menuOpen: false,
  cookieOpen: false,
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setMenuOpen: (menuOpen) => set({ menuOpen }),
  setCookieOpen: (cookieOpen) => set({ cookieOpen }),
}));
