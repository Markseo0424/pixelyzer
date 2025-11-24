"use client";
import React, { useState } from "react";
import { usePaletteStore } from "@/store/usePaletteStore";

export default function PaletteManager() {
  const colors = usePaletteStore((s) => s.colors);
  const isEnabled = usePaletteStore((s) => s.isEnabled);
  const addColor = usePaletteStore((s) => s.addColor);
  const updateColor = usePaletteStore((s) => s.updateColor);
  const removeColor = usePaletteStore((s) => s.removeColor);
  const setEnabled = usePaletteStore((s) => s.setEnabled);

  const [hex, setHex] = useState<string>("#000000");

  return (
    <div className="space-y-4 text-sm">
      <div className="mb-2">
        <div className="font-medium mb-1">Palette usage</div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>Use palette for preview</span>
        </label>
      </div>
      <div>
        <div className="font-medium mb-2">Add Color</div>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="w-10 h-8 p-0 border rounded"
          />
          <input
            type="text"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="px-2 py-1 border rounded flex-1 bg-transparent"
          />
          <button
            className="px-2 py-1 rounded border"
            onClick={() => {
              const v = hex.trim();
              if (!/^#?[0-9a-fA-F]{6}$/.test(v) && !/^#?[0-9a-fA-F]{3}$/.test(v)) return;
              addColor(v.startsWith("#") ? v : `#${v}`);
            }}
          >
            Add
          </button>
        </div>
      </div>
      <div>
        <div className="font-medium mb-2">Palette</div>
        <div className="space-y-2">
          {colors.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div
                  className="w-6 h-6 rounded border shrink-0"
                  style={{ background: c.hex }}
                />
                <input
                  type="text"
                  value={c.hex}
                  onChange={(e) => updateColor(c.id, { hex: e.target.value })}
                  className="px-2 py-1 border rounded w-full bg-transparent"
                />
              </div>
              <label className="flex items-center gap-1 text-xs whitespace-nowrap shrink-0">
                <input
                  type="checkbox"
                  checked={c.isTransparent}
                  onChange={(e) => updateColor(c.id, { isTransparent: e.target.checked })}
                />
                transparent
              </label>
              <button
                className="px-2 py-1 rounded border shrink-0"
                onClick={() => removeColor(c.id)}
              >
                Remove
              </button>
            </div>
          ))}
          {colors.length === 0 && <div className="text-neutral-500">No colors</div>}
        </div>
      </div>
    </div>
  );
}