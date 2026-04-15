import './globals.css';
import type { Metadata } from 'next';
import { ConditionalHelpChatbot } from '@/components/help/conditional-help-chatbot';

export const metadata: Metadata = {
  title: 'IronVault',
  description: 'IronVault crypto wallet',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        {children}
        <ConditionalHelpChatbot />
      </body>
    </html>
  );
}
