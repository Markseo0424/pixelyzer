"use client";
import React, { useEffect, useRef } from "react";
import { useImageStore } from "@/store/useImageStore";
import { useCameraStore } from "@/store/useCameraStore";
import { useGridStore } from "@/store/useGridStore";

export default function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const imageBitmap = useImageStore((s) => s.imageBitmap);
  const imgW = useImageStore((s) => s.width);
  const imgH = useImageStore((s) => s.height);

  // 초기 grid rect를 이미지 전체로 세팅
  useEffect(() => {
    if (!imageBitmap || !imgW || !imgH) return;
    const setRect = useGridStore.getState().setRect;
    setRect({ x: 0, y: 0, width: imgW, height: imgH });
  }, [imageBitmap, imgW, imgH]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const fitCamera = () => {
      if (!imageBitmap || !imgW || !imgH) return;
      const rect = canvas.getBoundingClientRect();
      const scale = Math.min(rect.width / imgW, rect.height / imgH);
      const tx = (rect.width - imgW * scale) / 2;
      const ty = (rect.height - imgH * scale) / 2;
      useCameraStore.getState().setCamera({ scale, tx, ty });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      fitCamera();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // 상태 refs
    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    // 그리드 편집 상태
    type DragMode = "none" | "move" | "resize";
    let dragMode: DragMode = "none";
    let activeHandle: number = -1; // 0..7 (TL,T,TR,R,BR,B,BL,L)

    // 변환 함수(캔버스 로컬 스크린 좌표 <-> 월드)
    const worldFromScreen = (sx: number, sy: number) => {
      const { scale, tx, ty } = useCameraStore.getState();
      const wx = (sx - tx) / scale;
      const wy = (sy - ty) / scale;
      return { wx, wy };
    };

    const screenFromWorld = (wx: number, wy: number) => {
      const { scale, tx, ty } = useCameraStore.getState();
      return { sx: wx * scale + tx, sy: wy * scale + ty };
    };

    const getHandles = () => {
      const { rect } = useGridStore.getState();
      const x = rect.x, y = rect.y, w = rect.width, h = rect.height;
      const cx = x + w / 2, cy = y + h / 2;
      const pts = [
        { x: x, y: y }, // TL 0
        { x: cx, y: y }, // T 1
        { x: x + w, y: y }, // TR 2
        { x: x + w, y: cy }, // R 3
        { x: x + w, y: y + h }, // BR 4
        { x: cx, y: y + h }, // B 5
        { x: x, y: y + h }, // BL 6
        { x: x, y: cy }, // L 7
      ];
      return pts;
    };

    // 핸들 히트테스트(캔버스 로컬 좌표)
    const hitTest = (sx: number, sy: number) => {
      const { editMode } = useGridStore.getState();
      if (!editMode) return { type: "none" as const, handle: -1 };
      const handles = getHandles();
      const radius = 6; // px in canvas local(screen) coords
      for (let i = 0; i < handles.length; i++) {
        const { sx: hx, sy: hy } = screenFromWorld(handles[i].x, handles[i].y);
        const dx = sx - hx;
        const dy = sy - hy;
        if (dx * dx + dy * dy <= radius * radius) {
          return { type: "handle" as const, handle: i };
        }
      }
      // bbox 내부 히트
      const { rect } = useGridStore.getState();
      const { sx: x0, sy: y0 } = screenFromWorld(rect.x, rect.y);
      const { sx: x1, sy: y1 } = screenFromWorld(rect.x + rect.width, rect.y + rect.height);
      const left = Math.min(x0, x1), right = Math.max(x0, x1);
      const top = Math.min(y0, y1), bottom = Math.max(y0, y1);
      if (sx >= left && sx <= right && sy >= top && sy <= bottom) {
        return { type: "rect" as const, handle: -1 };
      }
      return { type: "none" as const, handle: -1 };
    };

    const onPointerDown = (e: PointerEvent) => {
      const { editMode } = useGridStore.getState();
      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (e.button === 1) {
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
        return;
      }
      if (e.button === 0 && editMode) {
        const hit = hitTest(localX, localY);
        if (hit.type === "handle") {
          dragMode = "resize";
          activeHandle = hit.handle;
          canvas.setPointerCapture(e.pointerId);
          e.preventDefault();
        } else if (hit.type === "rect") {
          dragMode = "move";
          canvas.setPointerCapture(e.pointerId);
          e.preventDefault();
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const { editMode, lockAspect, cols, rows } = useGridStore.getState();
      const rect = canvas.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;

      if (isPanning) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        lastX = e.clientX;
        lastY = e.clientY;
        const { tx, ty } = useCameraStore.getState();
        useCameraStore.getState().setCamera({ tx: tx + dx, ty: ty + dy });
        return;
      }
      // hover 커서
      if (editMode && dragMode === "none") {
        const hit = hitTest(localX, localY);
        const cursorMap = [
          "nwse-resize", // 0 TL
          "ns-resize",   // 1 T
          "nesw-resize", // 2 TR
          "ew-resize",   // 3 R
          "nwse-resize", // 4 BR
          "ns-resize",   // 5 B
          "nesw-resize", // 6 BL
          "ew-resize",   // 7 L
        ] as const;
        if (hit.type === "handle") {
          canvas.style.cursor = cursorMap[hit.handle];
        } else if (hit.type === "rect") {
          canvas.style.cursor = "move";
        } else {
          canvas.style.cursor = "default";
        }
      }
      if (!editMode) return;

      if (dragMode === "move") {
        // 스크린 dx,dy → 월드로 변환(차분만 필요)
        const { wx: w0x, wy: w0y } = worldFromScreen(0, 0);
        const { wx: w1x, wy: w1y } = worldFromScreen(e.movementX, e.movementY);
        const ddx = w1x - w0x;
        const ddy = w1y - w0y;
        const { rect: r } = useGridStore.getState();
        useGridStore.getState().setRect({ x: r.x + ddx, y: r.y + ddy });
      } else if (dragMode === "resize" && activeHandle >= 0) {
        const { rect: r } = useGridStore.getState();
        const { wx, wy } = worldFromScreen(localX, localY);
        const k = cols > 0 && rows > 0 ? cols / rows : 1; // w/h
        const minW = 1;
        const minH = 1;
        const left = r.x, top = r.y, right = r.x + r.width, bottom = r.y + r.height;
        let nx = r.x, ny = r.y, nw = r.width, nh = r.height;

        const clampSize = () => {
          nw = Math.max(minW, nw);
          nh = Math.max(minH, nh);
        };

        const ratioizeCorner = (anchorX: number, anchorY: number, candW: number, candH: number, anchorAtRight: boolean, anchorAtBottom: boolean) => {
          // enforce w/h = k using candidate extents
          let w1 = Math.max(minW, candW);
          let h1 = w1 / (k || 1);
          if (h1 > candH) {
            h1 = Math.max(minH, candH);
            w1 = h1 * (k || 1);
          }
          if (anchorAtRight) nx = anchorX - w1; else nx = anchorX;
          if (anchorAtBottom) ny = anchorY - h1; else ny = anchorY;
          nw = w1; nh = h1;
        };

        switch (activeHandle) {
          case 0: { // TL (anchor BR)
            const candW = right - wx;
            const candH = bottom - wy;
            if (lockAspect) ratioizeCorner(right, bottom, candW, candH, true, true);
            else { nx = Math.min(wx, right); ny = Math.min(wy, bottom); nw = right - nx; nh = bottom - ny; clampSize(); }
            break;
          }
          case 2: { // TR (anchor BL)
            const candW = wx - left;
            const candH = bottom - wy;
            if (lockAspect) ratioizeCorner(left, bottom, candW, candH, false, true);
            else { ny = Math.min(wy, bottom); nw = Math.max(minW, wx - left); nh = bottom - ny; nx = left; }
            break;
          }
          case 4: { // BR (anchor TL)
            const candW = wx - left;
            const candH = wy - top;
            if (lockAspect) ratioizeCorner(left, top, candW, candH, false, false);
            else { nw = Math.max(minW, wx - left); nh = Math.max(minH, wy - top); nx = left; ny = top; }
            break;
          }
          case 6: { // BL (anchor TR)
            const candW = right - wx;
            const candH = wy - top;
            if (lockAspect) ratioizeCorner(right, top, candW, candH, true, false);
            else { nx = Math.min(wx, right); nw = right - nx; nh = Math.max(minH, wy - top); ny = top; }
            break;
          }
          case 1: { // T (anchor bottom edge)
            if (lockAspect) {
              const candH = Math.max(minH, bottom - wy);
              const s = candH / (r.height || 1);
              const w1 = Math.max(minW, r.width * s);
              const h1 = candH;
              nx = r.x - (w1 - r.width) / 2;
              ny = bottom - h1;
              nw = w1; nh = h1;
            } else {
              ny = Math.min(wy, bottom); nh = bottom - ny; nx = r.x; nw = r.width; clampSize();
            }
            break;
          }
          case 5: { // B (anchor top edge)
            if (lockAspect) {
              const candH = Math.max(minH, wy - top);
              const s = candH / (r.height || 1);
              const w1 = Math.max(minW, r.width * s);
              nx = r.x - (w1 - r.width) / 2; ny = top; nw = w1; nh = candH;
            } else {
              nh = Math.max(minH, wy - top); nx = r.x; ny = top; nw = r.width;
            }
            break;
          }
          case 3: { // R (anchor left edge)
            if (lockAspect) {
              const candW = Math.max(minW, wx - left);
              const s = candW / (r.width || 1);
              const h1 = Math.max(minH, r.height * s);
              nx = left; ny = r.y - (h1 - r.height) / 2; nw = candW; nh = h1;
            } else {
              nw = Math.max(minW, wx - left); nx = left; ny = r.y; nh = r.height;
            }
            break;
          }
          case 7: { // L (anchor right edge)
            if (lockAspect) {
              const candW = Math.max(minW, right - wx);
              const s = candW / (r.width || 1);
              const h1 = Math.max(minH, r.height * s);
              nx = right - candW; ny = r.y - (h1 - r.height) / 2; nw = candW; nh = h1;
            } else {
              nx = Math.min(wx, right); nw = right - nx; ny = r.y; nh = r.height; clampSize();
            }
            break;
          }
        }
        useGridStore.getState().setRect({ x: nx, y: ny, width: nw, height: nh });
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button === 1) {
        isPanning = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch {}
        canvas.style.cursor = "default";
      }
      if (e.button === 0) {
        dragMode = "none";
        activeHandle = -1;
        try { canvas.releasePointerCapture(e.pointerId); } catch {}
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!imageBitmap) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const { scale, tx, ty } = useCameraStore.getState();
      const zoomFactor = Math.exp(-e.deltaY * 0.001);
      const newScale = Math.min(20, Math.max(0.05, scale * zoomFactor));
      const wx = (screenX - tx) / scale;
      const wy = (screenY - ty) / scale;
      const newTx = screenX - wx * newScale;
      const newTy = screenY - wy * newScale;
      useCameraStore.getState().setCamera({ scale: newScale, tx: newTx, ty: newTy });
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    let rafId = 0;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background") || "#fff";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const { scale, tx, ty } = useCameraStore.getState();
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      if (imageBitmap && imgW && imgH) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(imageBitmap, 0, 0, imgW, imgH);
      } else {
        ctx.restore();
        ctx.fillStyle = "#888";
        ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
        ctx.textAlign = "center";
        ctx.fillText("Upload an image to start", rect.width / 2, rect.height / 2);
        return;
      }

      const { cols, rows, rect: gRect, showDots, showLines, editMode } = useGridStore.getState();
      if (cols > 0 && rows > 0) {
        const cw = gRect.width / cols;
        const ch = gRect.height / rows;
        if (showLines) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = "#00ffff";
          ctx.lineWidth = 1 / Math.max(1, scale);
          for (let i = 0; i <= cols; i++) {
            const x = gRect.x + i * cw;
            ctx.beginPath();
            ctx.moveTo(x, gRect.y);
            ctx.lineTo(x, gRect.y + gRect.height);
            ctx.stroke();
          }
          for (let j = 0; j <= rows; j++) {
            const y = gRect.y + j * ch;
            ctx.beginPath();
            ctx.moveTo(gRect.x, y);
            ctx.lineTo(gRect.x + gRect.width, y);
            ctx.stroke();
          }
          ctx.restore();
        }
        if (showDots) {
          ctx.save();
          ctx.fillStyle = "#ff00aa";
          const r = Math.max(1.5, 2.0 / Math.max(1, Math.sqrt(scale)));
          for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
              const cx = gRect.x + (i + 0.5) * cw;
              const cy = gRect.y + (j + 0.5) * ch;
              ctx.beginPath();
              ctx.arc(cx, cy, r, 0, Math.PI * 2);
              ctx.fill();
            }
          }
          ctx.restore();
        }
        // 편집 모드: 바운딩 박스 + 핸들
        if (editMode) {
          ctx.save();
          ctx.strokeStyle = "#22c55e"; // green
          ctx.lineWidth = 1 / Math.max(1, scale);
          ctx.setLineDash([4 / Math.max(1, scale), 3 / Math.max(1, scale)]);
          ctx.strokeRect(gRect.x, gRect.y, gRect.width, gRect.height);
          ctx.setLineDash([]);
          // 핸들
          const handles = getHandles();
          const r2 = 4 / Math.max(1, scale);
          ctx.fillStyle = "#22c55e";
          for (const h of handles) {
            ctx.beginPath();
            ctx.arc(h.x, h.y, r2, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        }
      }

      ctx.restore();
    };

    const loop = () => {
      draw();
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      canvas.removeEventListener("wheel", onWheel as EventListener);
    };
  }, [imageBitmap, imgW, imgH]);

  return (
    <div className="w-full h-full canvas-container">
      <canvas ref={canvasRef} className="w-full h-full block bg-[--background]" />
    </div>
  );
}