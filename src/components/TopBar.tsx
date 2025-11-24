"use client";
import React, { useRef } from "react";
import { useImageStore } from "@/store/useImageStore";
import { usePreviewStore } from "@/store/usePreviewStore";

export default function TopBar() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const loadFromFile = useImageStore((s) => s.loadFromFile);
  const openPreview = usePreviewStore((s) => s.open);

  const onClickUpload = () => inputRef.current?.click();
  const onChangeFile: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await loadFromFile(file);
    } catch (err) {
      console.error("Failed to load image:", err);
    } finally {
      e.currentTarget.value = ""; // allow re-select same file
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 h-12 border-b border-neutral-200 dark:border-neutral-800">
      <div className="font-semibold">pixelyzer</div>
      <div className="flex-1" />
      <button
        className="px-3 py-1.5 rounded border text-sm"
        onClick={openPreview}
      >
        Preview
      </button>
      <button
        className="px-3 py-1.5 rounded bg-neutral-900 text-white text-sm hover:bg-neutral-700 dark:bg-neutral-100 dark:text-black dark:hover:bg-white"
        onClick={onClickUpload}
      >
        Upload Image
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChangeFile}
        className="hidden"
      />
    </div>
  );
}