import type { Metadata, Viewport } from 'next';
import { Manrope, Oxanium } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

const oxanium = Oxanium({
  subsets: ['latin'],
  variable: '--font-oxanium',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'EcoPulse — Sustentabilidade é Lifestyle',
  description: 'Plataforma social gamificada para hábitos sustentáveis',
  applicationName: 'EcoPulse',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#070b11',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${oxanium.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
