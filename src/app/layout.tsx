import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pixelyzer",
  description: "AI-made dot image to true pixel PNG",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}