import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { AgentationDev } from '@/components/agentation-dev';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Shoaib Qureshi - Frontend Developer Portfolio',
  description:
    'Premium interactive portfolio of Shoaib Qureshi, a frontend developer crafting React, WordPress, WooCommerce, and cinematic web experiences.',
  authors: [{ name: 'Shoaib Qureshi' }],
  metadataBase: new URL('https://shoaibqureshi.dev'),
  openGraph: {
    title: 'Shoaib Qureshi - Frontend Developer',
    description: 'Interactive frontend portfolio with selected product, commerce, and CMS work.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06080d',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body>
        {children}
        <AgentationDev />
      </body>
    </html>
  );
}
