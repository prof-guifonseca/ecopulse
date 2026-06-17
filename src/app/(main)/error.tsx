'use client';

import { useEffect } from 'react';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ecopulse] (main) error boundary:', error);
    }
  }, [error]);

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 px-6 text-center"
      role="alert"
    >
      <p className="t-eyebrow">Algo travou</p>
      <h2 className="t-headline">Algo travou.</h2>
      <p className="t-body-sm" style={{ maxWidth: 280 }}>
        Tente de novo.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex h-10 items-center justify-center rounded-[var(--radius-sm)] px-5 text-sm font-semibold"
        style={{
          background: 'var(--gradient-primary)',
          color: 'var(--primary-foreground)',
        }}
      >
        Tentar de novo
      </button>
    </div>
  );
}
