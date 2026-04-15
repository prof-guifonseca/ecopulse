import { Suspense } from 'react';
import { MainShell } from '@/components/shared/MainShell';

function ShellFallback() {
  return (
    <div className="phone-stage-shell">
      <div className="phone-stage bg-[linear-gradient(180deg,rgba(14,21,17,0.94),rgba(9,15,12,0.98))]" />
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<ShellFallback />}>
      <MainShell>{children}</MainShell>
    </Suspense>
  );
}
