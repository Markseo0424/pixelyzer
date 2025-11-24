"use client";
import { create } from "zustand";

export type PreviewState = {
  isOpen: boolean;
  busy: boolean;
  resultCanvas: HTMLCanvasElement | null;
  open: () => void;
  close: () => void;
  setBusy: (b: boolean) => void;
  setResultCanvas: (c: HTMLCanvasElement | null) => void;
};

export const usePreviewStore = create<PreviewState>((set) => ({
  isOpen: false,
  busy: false,
  resultCanvas: null,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setBusy: (b) => set({ busy: b }),
  setResultCanvas: (c) => set({ resultCanvas: c }),
}));