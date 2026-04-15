import { Suspense } from 'react';
import { ScannerPage } from '@/components/scanner/ScannerPage';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScannerPage />
    </Suspense>
  );
}
