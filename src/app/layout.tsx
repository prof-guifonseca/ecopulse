import type { Metadata, Viewport } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import './globals.css';

// Editorial display — Fraunces variable font (wght axis as default; SOFT/opsz
// remain controllable via font-variation-settings at usage sites since the
// variable font carries those axes). Italic is reached through font-style: italic
// at the usage site, not by requesting a separate subset here.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

// Body — Inter as a variable font; weights are handled via font-weight at
// usage sites rather than pre-bundled per-weight subsets.
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EcoPulse — Sustentabilidade é Lifestyle',
  description: 'Hábitos sustentáveis com impacto real.',
  applicationName: 'EcoPulse',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icons/icon.svg', type: 'image/svg+xml' }],
  },
  appleWebApp: {
    capable: true,
    title: 'EcoPulse',
    statusBarStyle: 'black-translucent',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0a120e',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${fraunces.variable} ${inter.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
