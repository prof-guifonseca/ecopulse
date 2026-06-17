'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          background: 'var(--bg-primary, #0a120e)',
          color: 'var(--text-primary, #f2f4ef)',
          fontFamily: 'var(--font-sans, Inter, system-ui, sans-serif)',
        }}
      >
        <div style={{ maxWidth: 360, textAlign: 'center', display: 'grid', gap: '0.85rem' }}>
          <p
            style={{
              fontSize: '0.68rem',
              fontWeight: 600,
              letterSpacing: 0,
              textTransform: 'uppercase',
              color: 'var(--text-muted, #6f7b72)',
            }}
          >
            Algo travou
          </p>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 700, lineHeight: 1.1 }}>Algo travou.</h1>
          <p
            style={{
              color: 'var(--text-secondary, #aab3a7)',
              fontSize: '0.92rem',
              lineHeight: 1.55,
            }}
          >
            Tente de novo.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '0.6rem',
              height: 44,
              borderRadius: 'var(--radius-sm, 8px)',
              padding: '0 1.4rem',
              fontWeight: 600,
              color: 'var(--on-primary, #0a140e)',
              background:
                'var(--gradient-primary, linear-gradient(135deg, #6fc581 0%, #9fe0ad 100%))',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Tentar de novo
          </button>
        </div>
      </body>
    </html>
  );
}
