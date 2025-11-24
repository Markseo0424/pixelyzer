export type RGB = { r: number; g: number; b: number };

export function hexToRgb(hex: string): RGB {
  let v = hex.trim();
  if (v.startsWith("#")) v = v.slice(1);
  if (v.length === 3) {
    const r = parseInt(v[0] + v[0], 16);
    const g = parseInt(v[1] + v[1], 16);
    const b = parseInt(v[2] + v[2], 16);
    return { r, g, b };
  }
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return { r, g, b };
}

export function rgbDist2(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return dr * dr + dg * dg + db * db;
}

export function nearestColor(rgb: RGB, palette: { hex: string; isTransparent: boolean }[]): { hex: string; isTransparent: boolean } {
  let best = palette[0];
  let bestD = Infinity;
  for (const c of palette) {
    const p = hexToRgb(c.hex);
    const d = rgbDist2(rgb, p);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best;
}