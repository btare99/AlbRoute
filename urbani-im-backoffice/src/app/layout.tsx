import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urbani Im - Backoffice",
  description: "Qendra e Kontrollit dhe Portali i Stafit",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sq">
      <body className="backoffice-root">{children}</body>
    </html>
  );
}
