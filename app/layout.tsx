import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlbRoute — Ndjekja e Autobuzëve në Shqipëri",
  description: "Ndjek autobuzët në kohë reale, plano udhëtimin tënd dhe shiko oraret e qytetit të Tiranës.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
