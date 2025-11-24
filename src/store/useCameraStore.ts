"use client";
import { create } from "zustand";

export type CameraState = {
  scale: number;
  tx: number;
  ty: number;
  panBy: (dx: number, dy: number) => void;
  zoomAt: (x: number, y: number, delta: number) => void;
  reset: () => void;
  setCamera: (p: Partial<Pick<CameraState, "scale" | "tx" | "ty">>) => void;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const useCameraStore = create<CameraState>((set, get) => ({
  scale: 1,
  tx: 0,
  ty: 0,
  panBy: (dx, dy) => set({ tx: get().tx + dx, ty: get().ty + dy }),
  // 참고: 여기의 zoomAt는 단순 스케일 보정만 처리. 실제 포인터 기준 줌은 CanvasStage에서 setCamera로 처리한다.
  zoomAt: (_x, _y, delta) => {
    const s = get().scale * Math.exp(-delta * 0.001);
    set({ scale: clamp(s, 0.05, 20) });
  },
  reset: () => set({ scale: 1, tx: 0, ty: 0 }),
  setCamera: (p) => set(p),
}));