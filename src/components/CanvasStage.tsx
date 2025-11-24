"use client";
import React, { useEffect, useRef } from "react";
import { useImageStore } from "@/store/useImageStore";
import { useCameraStore } from "@/store/useCameraStore";
import { useGridStore } from "@/store/useGridStore";

export default function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 이미지 메타
  const imageBitmap = useImageStore((s) => s.imageBitmap);
  const imgW = useImageStore((s) => s.width);
  const imgH = useImageStore((s) => s.height);

  // 초기 grid rect를 이미지 전체로 세팅
  useEffect(() => {
    if (!imageBitmap || !imgW || !imgH) return;
    const setRect = useGridStore.getState().setRect;
    setRect({ x: 0, y: 0, width: imgW, height: imgH });
  }, [imageBitmap, imgW, imgH]);

  // 캔버스 상호작용 및 렌더 루프
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    // 카메라 적절히 초기화(이미지 존재 시 화면에 맞춤)
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
      // 리사이즈 시 카메라 다시 맞춤(이미지가 있을 때만)
      fitCamera();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    // 포인터 제스처(중클릭: 패닝)
    let isPanning = false;
    let lastX = 0;
    let lastY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button === 1) { // middle button
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
        canvas.style.cursor = "grabbing";
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPanning) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      const { tx, ty } = useCameraStore.getState();
      useCameraStore.getState().setCamera({ tx: tx + dx, ty: ty + dy });
    };

    const onPointerUp = (e: PointerEvent) => {
      if (e.button === 1) {
        isPanning = false;
        try { canvas.releasePointerCapture(e.pointerId); } catch {}
        canvas.style.cursor = "default";
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

      // 월드 좌표(이미지 픽셀 좌표) 고정 후 동일 스크린 위치 유지
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

    // 렌더 루프
    let rafId = 0;
    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      // HiDPI 보정
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // 배경
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background") || "#fff";
      ctx.fillRect(0, 0, rect.width, rect.height);

      const { scale, tx, ty } = useCameraStore.getState();
      ctx.save();
      ctx.translate(tx, ty);
      ctx.scale(scale, scale);

      // 이미지
      if (imageBitmap && imgW && imgH) {
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(imageBitmap, 0, 0, imgW, imgH);
      } else {
        // 안내 텍스트
        ctx.restore();
        ctx.fillStyle = "#888";
        ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
        ctx.textAlign = "center";
        ctx.fillText("Upload an image to start", rect.width / 2, rect.height / 2);
        return;
      }

      // 그리드 오버레이
      const { cols, rows, rect: gRect, showDots, showLines } = useGridStore.getState();
      if (cols > 0 && rows > 0) {
        const cw = gRect.width / cols;
        const ch = gRect.height / rows;
        if (showLines) {
          ctx.save();
          ctx.globalAlpha = 0.35;
          ctx.strokeStyle = "#00ffff"; // 보조 라인 색(가시성이 좋은 시안)
          ctx.lineWidth = 1 / Math.max(1, scale); // 줌에 따른 라인 두께 보정
          // 세로 라인
          for (let i = 0; i <= cols; i++) {
            const x = gRect.x + i * cw;
            ctx.beginPath();
            ctx.moveTo(x, gRect.y);
            ctx.lineTo(x, gRect.y + gRect.height);
            ctx.stroke();
          }
          // 가로 라인
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
          ctx.fillStyle = "#ff00aa"; // 점 색(가시성 높은 마젠타)
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