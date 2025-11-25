import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "pixelyzer",
  description: "AI-made dot image to true pixel PNG",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html lang="en">
      <head>
        {/* AdSense 전역 로더 스크립트: NEXT_PUBLIC_ADSENSE_CLIENT가 설정된 경우에만 로드됩니다. */}
        {client && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body>{children}</body>
    </html>
  );
}
