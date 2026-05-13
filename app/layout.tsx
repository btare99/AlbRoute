import type { Metadata, Viewport } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";

export const metadata: Metadata = {
  title: "Urbani Im — Ndjekja e Autobuzëve në Shqipëri",
  description: "Ndjek autobuzët në kohë reale, plano udhëtimin tënd dhe shiko oraret e qytetit të Tiranës.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Urbani Im",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0f1a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { Providers } from "./components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
