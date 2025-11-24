"use client";
import { create } from "zustand";

export type PaletteColor = { id: string; hex: string; isTransparent: boolean };

export type PaletteState = {
  colors: PaletteColor[];
  isEnabled: boolean;
  addColor: (hex: string) => void;
  updateColor: (
    id: string,
    patch: Partial<Pick<PaletteColor, "hex" | "isTransparent">>
  ) => void;
  removeColor: (id: string) => void;
  setEnabled: (v: boolean) => void;
};

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

const PICO8 = [
  "#000000",
  "#1D2B53",
  "#7E2553",
  "#008751",
  "#AB5236",
  "#5F574F",
  "#C2C3C7",
  "#FFF1E8",
  "#FF004D",
  "#FFA300",
  "#FFEC27",
  "#00E436",
  "#29ADFF",
  "#83769C",
  "#FF77A8",
  "#FFCCAA",
];

export const usePaletteStore = create<PaletteState>((set) => ({
  colors: PICO8.map((hex) => ({ id: uid(), hex, isTransparent: false })),
  isEnabled: true,
  addColor: (hex) =>
    set((s) => ({
      colors: [...s.colors, { id: uid(), hex, isTransparent: false }],
    })),
  updateColor: (id, patch) =>
    set((s) => ({
      colors: s.colors.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
  removeColor: (id) =>
    set((s) => ({ colors: s.colors.filter((c) => c.id !== id) })),
  setEnabled: (v) => set({ isEnabled: v }),
}));
