"use client";
import { create } from "zustand";

export type PreviewState = {
  isOpen: boolean;
  busy: boolean;
  open: () => void;
  close: () => void;
};

export const usePreviewStore = create<PreviewState>((set) => ({
  isOpen: false,
  busy: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));