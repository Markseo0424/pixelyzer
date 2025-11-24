"use client";
import { create } from "zustand";

export type ImageState = {
  imageBitmap: ImageBitmap | null;
  width: number;
  height: number;
  loadFromFile: (file: File) => Promise<void>;
  clear: () => void;
};

export const useImageStore = create<ImageState>((set) => ({
  imageBitmap: null,
  width: 0,
  height: 0,
  loadFromFile: async (file: File) => {
    const bmp = await createImageBitmap(file);
    set({ imageBitmap: bmp, width: bmp.width, height: bmp.height });
    console.log(`[image] loaded: ${bmp.width}x${bmp.height}`);
    // TODO: sourceCanvas/sourceImageData 준비는 M2 이후 도입
  },
  clear: () => set({ imageBitmap: null, width: 0, height: 0 }),
}));