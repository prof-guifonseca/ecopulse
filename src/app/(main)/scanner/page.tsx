import { Suspense } from 'react';
import type { Metadata } from 'next';
import { ScannerPage } from '@/components/scanner/ScannerPage';

export const metadata: Metadata = {
  title: 'Scanner — EcoPulse',
  description: 'Simule o scan de um produto e veja o impacto ambiental.',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScannerPage />
    </Suspense>
  );
}
