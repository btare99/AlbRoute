import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlbRoute — Ndjekja e Autobuzëve në Shqipëri",
  description: "Ndjek autobuzët në kohë reale, plano udhëtimin tënd dhe shiko oraret e qytetit të Tiranës.",
  manifest: "/manifest.json",
  themeColor: "#0a0f1a",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AlbRoute",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
