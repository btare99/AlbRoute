import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Qendra e Ndihmës - Urbani IM',
  description: 'Gjeni përgjigje për pyetjet tuaja rreth aplikacionit Urbani IM. Na kontaktoni për mbështetje teknike ose sugjerime.',
};

export default function HelpCenterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
