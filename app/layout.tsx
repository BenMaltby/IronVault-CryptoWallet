import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IronVault Starter',
  description: 'Starter codebase for the IronVault student crypto wallet MVP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
