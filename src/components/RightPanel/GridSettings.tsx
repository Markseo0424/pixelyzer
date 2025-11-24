"use client";
import React from "react";
import { useGridStore } from "@/store/useGridStore";
import { useImageStore } from "@/store/useImageStore";
export default function GridSettings() {
  const cols = useGridStore((s) => s.cols);
  const rows = useGridStore((s) => s.rows);
  const showDots = useGridStore((s) => s.showDots);
  const showLines = useGridStore((s) => s.showLines);
  const lockAspect = useGridStore((s) => s.lockAspect);
  const editMode = useGridStore((s) => s.editMode);
  const samplingRadiusFactor = useGridStore((s) => s.samplingRadiusFactor);
  const setSize = useGridStore((s) => s.setSize);
  const setOverlay = useGridStore((s) => s.setOverlay);
  const setLockAspect = useGridStore((s) => s.setLockAspect);
  const setEditMode = useGridStore((s) => s.setEditMode);
  const setSampling = useGridStore((s) => s.setSampling);
  const imgW = useImageStore((s) => s.width);
  const imgH = useImageStore((s) => s.height);
  const fitToImage = useGridStore((s) => s.fitToImage);

  return (
    <div className="space-y-4 text-sm">
      <div>
        <div className="font-medium mb-2">Grid Size</div>
        <div className="flex items-center gap-2">
          <label className="w-12">Cols</label>
          <input
            type="number"
            min={1}
            value={cols}
            onChange={(e) =>
              setSize({ cols: Math.max(1, Number(e.target.value) || 1) })
            }
            className="px-2 py-1 border rounded w-24 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="w-12">Rows</label>
          <input
            type="number"
            min={1}
            value={rows}
            onChange={(e) =>
              setSize({ rows: Math.max(1, Number(e.target.value) || 1) })
            }
            className="px-2 py-1 border rounded w-24 bg-transparent"
          />
        </div>
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={lockAspect}
            onChange={(e) => setLockAspect(e.target.checked)}
          />
          <span>Lock aspect ratio (cols:rows)</span>
        </label>
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={editMode}
            onChange={(e) => setEditMode(e.target.checked)}
          />
          <span>Edit grid (drag/resize on canvas)</span>
        </label>
        <button
          className="mt-3 px-2 py-1 rounded border text-xs"
          onClick={() => fitToImage(imgW, imgH)}
          disabled={!imgW || !imgH}
        >
          Fit grid to image
        </button>
      </div>
      <div>
        <div className="font-medium mb-2">Overlay</div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showDots}
            onChange={(e) => setOverlay({ showDots: e.target.checked })}
          />
          <span>Show dots</span>
        </label>
        <label className="flex items-center gap-2 mt-1">
          <input
            type="checkbox"
            checked={showLines}
            onChange={(e) => setOverlay({ showLines: e.target.checked })}
          />
          <span>Show lines</span>
        </label>
      </div>
      <div>
        <div className="font-medium mb-2">Sampling</div>
        <div className="flex items-center gap-2">
          <label className="w-28">Radius factor</label>
          <input
            type="range"
            min={0.05}
            max={1.0}
            step={0.05}
            value={samplingRadiusFactor}
            onChange={(e) => setSampling(Number(e.target.value))}
          />
          <span className="w-10 text-right tabular-nums">
            {samplingRadiusFactor.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
