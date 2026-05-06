import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlbRoute — Ndjekja e Autobuzëve në Shqipëri",
  description: "Ndjek autobuzët në kohë reale, plano udhëtimin tënd dhe shiko oraret e qytetit të Tiranës.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AlbRoute",
  },
  icons: {
    icon: "/logo-Urban.png",
    apple: "/logo-Urban.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>{children}</body>
    </html>
  );
}
