"use client";
import TopBar from "@/components/TopBar";
import CanvasStage from "@/components/CanvasStage";
import RightPanel from "@/components/RightPanel/RightPanel";
import PreviewModal from "@/components/PreviewModal";

export default function Page() {
  return (
    <div className="flex flex-col h-dvh">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <div className="flex-1 min-w-0">
          <CanvasStage />
        </div>
        <div className="w-[400px] shrink-0">
          <RightPanel />
        </div>
      </div>
      <PreviewModal />
    </div>
  );
}