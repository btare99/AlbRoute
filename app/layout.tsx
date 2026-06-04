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
  viewportFit: "cover",
};

import { Providers } from "./components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body>
        <Providers>
          <main className="min-h-screen bg-white text-gray-700">{children}</main>
          <footer className="w-full border-t border-gray-100 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-6 flex justify-center">
              {/* Footer links removed per request */}
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
