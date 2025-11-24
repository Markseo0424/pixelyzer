import { nearestColor, hexToRgb } from "@/lib/color";
import type { PaletteColor } from "@/store/usePaletteStore";

export type RenderParams = {
  imageBitmap: ImageBitmap;
  imgW: number;
  imgH: number;
  rect: { x: number; y: number; width: number; height: number };
  cols: number;
  rows: number;
  samplingRadiusFactor: number; // e.g., 0.4
  palette: PaletteColor[];
};

export async function renderPreviewCanvas(p: RenderParams): Promise<HTMLCanvasElement> {
  const { imageBitmap, imgW, imgH, rect, cols, rows, samplingRadiusFactor, palette } = p;

  // 1) 준비: 소스 이미지 데이터를 얻기 위해 임시 캔버스에 원본 해상도로 드로우
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = imgW;
  srcCanvas.height = imgH;
  const sctx = srcCanvas.getContext("2d", { willReadFrequently: true });
  if (!sctx) throw new Error("2D context not available");
  sctx.drawImage(imageBitmap, 0, 0);
  const srcData = sctx.getImageData(0, 0, imgW, imgH);
  const src = srcData.data; // Uint8ClampedArray

  // 2) 출력 캔버스(cols x rows)
  const outCanvas = document.createElement("canvas");
  outCanvas.width = cols;
  outCanvas.height = rows;
  const octx = outCanvas.getContext("2d");
  if (!octx) throw new Error("2D context not available");
  const outImg = octx.createImageData(cols, rows);
  const out = outImg.data;

  // 3) 셀 크기 및 샘플링 반경
  const cw = rect.width / cols;
  const ch = rect.height / rows;
  const rBase = Math.max(1, samplingRadiusFactor * Math.min(cw, ch));

  const pal = palette.map((c) => ({ hex: c.hex, isTransparent: c.isTransparent }));

  // 4) 각 셀 중심 주변을 샘플링하여 평균 → 팔레트 최근접 매칭
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = rect.x + (i + 0.5) * cw;
      const cy = rect.y + (j + 0.5) * ch;
      const r = rBase;
      const x0 = Math.max(0, Math.floor(cx - r));
      const y0 = Math.max(0, Math.floor(cy - r));
      const x1 = Math.min(imgW - 1, Math.ceil(cx + r));
      const y1 = Math.min(imgH - 1, Math.ceil(cy + r));

      let accR = 0, accG = 0, accB = 0, count = 0;
      for (let yy = y0; yy <= y1; yy++) {
        for (let xx = x0; xx <= x1; xx++) {
          const dx = xx + 0.5 - cx;
          const dy = yy + 0.5 - cy;
          if (dx * dx + dy * dy <= r * r) {
            const idx = 4 * (yy * imgW + xx);
            accR += src[idx];
            accG += src[idx + 1];
            accB += src[idx + 2];
            count++;
          }
        }
      }
      if (count === 0) {
        // 셀 크기가 매우 작을 때 원 내 픽셀이 없을 수 있음: center 픽셀 1개 사용
        const cxp = Math.min(imgW - 1, Math.max(0, Math.round(cx)));
        const cyp = Math.min(imgH - 1, Math.max(0, Math.round(cy)));
        const idx = 4 * (cyp * imgW + cxp);
        accR = src[idx];
        accG = src[idx + 1];
        accB = src[idx + 2];
        count = 1;
      }
      const avg = { r: Math.round(accR / count), g: Math.round(accG / count), b: Math.round(accB / count) };
      const best = nearestColor(avg, pal);
      const outIdx = 4 * (j * cols + i);
      const rgb = hexToRgb(best.hex);
      out[outIdx] = rgb.r;
      out[outIdx + 1] = rgb.g;
      out[outIdx + 2] = rgb.b;
      out[outIdx + 3] = best.isTransparent ? 0 : 255;
    }
  }

  octx.putImageData(outImg, 0, 0);
  return outCanvas;
}