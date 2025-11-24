"use client";
import { create } from "zustand";

export type GridRect = { x: number; y: number; width: number; height: number };

export type GridState = {
  cols: number;
  rows: number;
  rect: GridRect; // 이미지 좌표계
  showDots: boolean;
  showLines: boolean;
  lockAspect: boolean;
  editMode: boolean;
  samplingRadiusFactor: number; // 기본 0.4(셀 최소변 비율)
  setSize: (p: Partial<Pick<GridState, "cols" | "rows">>) => void;
  setRect: (rect: Partial<GridRect>) => void;
  setOverlay: (p: Partial<Pick<GridState, "showDots" | "showLines">>) => void;
  setLockAspect: (v: boolean) => void;
  setEditMode: (v: boolean) => void;
  setSampling: (v: number) => void;
};

function snapRectToAspect(rect: GridRect, cols: number, rows: number): GridRect {
  if (cols <= 0 || rows <= 0) return rect;
  const target = cols / rows;
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  // 현재 폭을 기준으로 높이를 맞추되, 변화가 큰 축을 보정
  const hFromW = rect.width / target;
  const wFromH = rect.height * target;
  // 선택: 변경량이 더 작은 쪽으로 스냅
  const dH = Math.abs(hFromW - rect.height);
  const dW = Math.abs(wFromH - rect.width);
  let width = rect.width;
  let height = rect.height;
  if (dH <= dW) {
    height = hFromW;
  } else {
    width = wFromH;
  }
  return { x: cx - width / 2, y: cy - height / 2, width, height };
}

export const useGridStore = create<GridState>((set, get) => ({
  cols: 64,
  rows: 64,
  rect: { x: 0, y: 0, width: 64, height: 64 },
  showDots: true,
  showLines: true,
  lockAspect: true,
  editMode: false,
  samplingRadiusFactor: 0.4,
  setSize: (p) => set((s) => {
    const next = { ...s, ...p } as GridState;
    if (next.lockAspect) {
      next.rect = snapRectToAspect(next.rect, next.cols, next.rows);
    }
    return next;
  }),
  setRect: (patch) => set((s) => {
    let rect = { ...s.rect, ...patch };
    if (s.lockAspect && (patch.width !== undefined || patch.height !== undefined)) {
      rect = snapRectToAspect(rect, s.cols, s.rows);
    }
    return { rect } as Partial<GridState>;
  }),
  setOverlay: (p) => set((s) => ({ ...s, ...p } as any)),
  setLockAspect: (v) => set((s) => {
    let rect = s.rect;
    if (v) rect = snapRectToAspect(s.rect, s.cols, s.rows);
    return { lockAspect: v, rect };
  }),
  setEditMode: (v) => set({ editMode: v }),
  setSampling: (v) => set({ samplingRadiusFactor: Math.max(0.05, Math.min(2, v)) }),
}));