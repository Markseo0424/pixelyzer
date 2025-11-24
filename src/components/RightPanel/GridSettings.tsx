"use client";
import React from "react";
import { useGridStore } from "@/store/useGridStore";

export default function GridSettings() {
  const cols = useGridStore((s) => s.cols);
  const rows = useGridStore((s) => s.rows);
  const showDots = useGridStore((s) => s.showDots);
  const showLines = useGridStore((s) => s.showLines);
  const lockAspect = useGridStore((s) => s.lockAspect);
  const setSize = useGridStore((s) => s.setSize);
  const setOverlay = useGridStore((s) => s.setOverlay);
  const setLockAspect = useGridStore((s) => s.setLockAspect);

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
            onChange={(e) => setSize({ cols: Math.max(1, Number(e.target.value) || 1) })}
            className="px-2 py-1 border rounded w-24 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 mt-2">
          <label className="w-12">Rows</label>
          <input
            type="number"
            min={1}
            value={rows}
            onChange={(e) => setSize({ rows: Math.max(1, Number(e.target.value) || 1) })}
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
      </div>
      <div>
        <div className="font-medium mb-2">Overlay</div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showDots} onChange={(e) => setOverlay({ showDots: e.target.checked })} />
          <span>Show dots</span>
        </label>
        <label className="flex items-center gap-2 mt-1">
          <input type="checkbox" checked={showLines} onChange={(e) => setOverlay({ showLines: e.target.checked })} />
          <span>Show lines</span>
        </label>
      </div>
    </div>
  );
}