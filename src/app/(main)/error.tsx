'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';
import { ErrorState } from '@/components/ui/AsyncState';

export default function MainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to Sentry (the group boundary used to swallow these — only
    // global-error.tsx reported), and log in dev for fast local triage.
    Sentry.captureException(error);
    if (process.env.NODE_ENV !== 'production') {
      console.error('[ecopulse] (main) error boundary:', error);
    }
  }, [error]);

  return <ErrorState onRetry={reset} />;
}
