"use client";
import * as Dialog from "@radix-ui/react-dialog";
import React, { useEffect } from "react";
import { usePreviewStore } from "@/store/usePreviewStore";
import { useImageStore } from "@/store/useImageStore";
import { useGridStore } from "@/store/useGridStore";
import { usePaletteStore } from "@/store/usePaletteStore";
import { renderPreviewCanvas } from "@/lib/preview";

export default function PreviewModal() {
  const isOpen = usePreviewStore((s) => s.isOpen);
  const close = usePreviewStore((s) => s.close);
  const setBusy = usePreviewStore((s) => s.setBusy);
  const busy = usePreviewStore((s) => s.busy);
  const setResultCanvas = usePreviewStore((s) => s.setResultCanvas);
  const resultCanvas = usePreviewStore((s) => s.resultCanvas);

  const imageBitmap = useImageStore((s) => s.imageBitmap);
  const imgW = useImageStore((s) => s.width);
  const imgH = useImageStore((s) => s.height);
  const grid = useGridStore();
  const palette = usePaletteStore((s) => s.colors);

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      if (!imageBitmap || !imgW || !imgH || grid.cols <= 0 || grid.rows <= 0)
        return;
      setBusy(true);
      try {
        const canvas = await renderPreviewCanvas({
          imageBitmap,
          imgW,
          imgH,
          rect: grid.rect,
          cols: grid.cols,
          rows: grid.rows,
          samplingRadiusFactor: grid.samplingRadiusFactor,
          palette,
        });
        setResultCanvas(canvas);
      } catch (e) {
        console.error(e);
      } finally {
        setBusy(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isOpen,
    imageBitmap,
    imgW,
    imgH,
    grid.cols,
    grid.rows,
    grid.rect.x,
    grid.rect.y,
    grid.rect.width,
    grid.rect.height,
    grid.samplingRadiusFactor,
    palette,
  ]);

  const onDownload = async () => {
    const canvas = resultCanvas;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pixelyzer_${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, "image/png");
  };

  const scale = 4; // 확대 배율

  return (
    <Dialog.Root open={isOpen} onOpenChange={(o) => (!o ? close() : null)}>
      <Dialog.Portal>
        {/* 배경 오버레이 */}
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out" />
        {/* 컨텐츠 패널 */}
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--background)] text-[var(--foreground)] rounded-lg shadow-2xl p-4 w-[min(90vw,960px)] max-h-[90vh] overflow-auto border border-black/10 dark:border-white/10">
          <div className="flex items-start justify-between mb-2">
            <Dialog.Title className="text-base font-semibold">
              Preview
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                aria-label="Close"
                className="px-2 py-1 rounded border text-sm"
              >
                Close
              </button>
            </Dialog.Close>
          </div>
          <div className="flex items-start gap-4">
            <div className="border rounded p-2 overflow-auto bg-white/70 dark:bg-black/40">
              {busy && <div className="text-sm">Rendering...</div>}
              {!busy && resultCanvas && (
                <div
                  style={{
                    width: resultCanvas.width * scale,
                    height: resultCanvas.height * scale,
                    background: `url(${resultCanvas.toDataURL()})`,
                    imageRendering: "pixelated",
                    backgroundSize: `${resultCanvas.width * scale}px ${
                      resultCanvas.height * scale
                    }px`,
                  }}
                />
              )}
            </div>
            <div className="min-w-[240px] space-y-2">
              <div className="text-sm">
                Size: {grid.cols} x {grid.rows}
              </div>
              <div className="text-sm">
                Sampling radius: {grid.samplingRadiusFactor.toFixed(2)} ×
                min(cw,ch)
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  className="px-3 py-1.5 rounded border"
                  onClick={onDownload}
                  disabled={!resultCanvas || busy}
                >
                  Download PNG
                </button>
                <Dialog.Close asChild>
                  <button className="px-3 py-1.5 rounded border">Close</button>
                </Dialog.Close>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
