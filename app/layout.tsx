import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import { AgentationDev } from '@/components/agentation-dev';
import { Analytics } from '@vercel/analytics/next';
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
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Shoaib Qureshi - Frontend Developer',
    description: 'Interactive frontend portfolio with selected product, commerce, and CMS work.',
    type: 'website',
    url: '/',
    siteName: 'Shoaib Qureshi',
  },
  twitter: { card: 'summary_large_image' },
  verification: {
    google: 'n8AkbCw_cSfLXj0ysLJE2g8KqTZ82yS4lNi8KHlGEP4',
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
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C0WK5VBHHK"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-C0WK5VBHHK');
          `}
        </Script>
      </body>
    </html>
  );
}
