"use client";
import { create } from "zustand";

export type GridRect = { x: number; y: number; width: number; height: number };

export type GridState = {
  cols: number;
  rows: number;
  rect: GridRect; // 이미지 좌표계 기준(M2에서 활용)
  showDots: boolean;
  showLines: boolean;
  lockAspect: boolean;
  samplingRadiusFactor: number; // 기본 0.4(셀 최소변 비율)
  setSize: (p: Partial<Pick<GridState, "cols" | "rows">>) => void;
  setRect: (rect: Partial<GridRect>) => void;
  setOverlay: (p: Partial<Pick<GridState, "showDots" | "showLines">>) => void;
  setLockAspect: (v: boolean) => void;
};

export const useGridStore = create<GridState>((set) => ({
  cols: 64,
  rows: 64,
  rect: { x: 0, y: 0, width: 64, height: 64 },
  showDots: true,
  showLines: true,
  lockAspect: true,
  samplingRadiusFactor: 0.4,
  setSize: (p) => set((s) => ({ ...s, ...p } as any)),
  setRect: (rect) => set((s) => ({ rect: { ...s.rect, ...rect } })),
  setOverlay: (p) => set((s) => ({ ...s, ...p } as any)),
  setLockAspect: (v) => set({ lockAspect: v }),
}));