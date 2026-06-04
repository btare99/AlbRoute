import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';

export const metadata: Metadata = {
  title: 'Urbani IM - Transporti Publik në Kohë Reale',
  description: 'Ndiq autobusët live në hartë, planifiko rrugëtimet më të shpejta dhe bli abone dixhitale në Tiranë me aplikacionin Urbani IM.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sq">
      <body className="flex flex-col min-h-screen bg-slate-50">
        <Header />
        <main className="flex-grow pt-[80px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
