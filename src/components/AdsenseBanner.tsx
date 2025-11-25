"use client";

import React, { useEffect } from "react";
import clsx from "clsx";

type AdsenseBannerProps = {
  /** AdSense ad-slot ID (실제 값으로 교체 필요) */
  slot: string;
  /** data-ad-format, 기본값 "auto" */
  format?: string;
  /** 반응형 여부, 기본 true -> data-full-width-responsive="true" */
  responsive?: boolean;
  /** 추가 Tailwind/스타일 클래스 */
  className?: string;
};

export default function AdsenseBanner({
  slot,
  format = "auto",
  responsive = true,
  className,
}: AdsenseBannerProps) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
  const isDev = process.env.NODE_ENV !== "production";

  // 환경변수가 없을 때:
  // - 개발 환경: 시각적인 placeholder 박스를 보여준다.
  // - 프로덕션: 아무것도 렌더하지 않는다.
  if (!client) {
    if (isDev) {
      return (
        <div
          className={clsx(
            "flex items-center justify-center text-xs text-neutral-500 border border-dashed border-neutral-400 bg-neutral-50 dark:bg-neutral-900/40 rounded-sm",
            className,
          )}
        >
          Ad placeholder (set NEXT_PUBLIC_ADSENSE_CLIENT)
        </div>
      );
    }
    return null;
  }

  useEffect(() => {
    if (!client) return;
    if (typeof window === "undefined") return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle = (window as any).adsbygoogle || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).adsbygoogle.push({});
    } catch (e) {
      console.error("Adsense error", e);
    }
  }, [client, slot, format, responsive]);

  return (
    <ins
      className={clsx("adsbygoogle block", className)}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive={responsive ? "true" : undefined}
    />
  );
}