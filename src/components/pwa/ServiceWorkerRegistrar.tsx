'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

/**
 * Registra o service worker (`public/sw.js`) que dá suporte offline e
 * instalação. Progressive enhancement: só roda em produção e quando o browser
 * suporta service workers; qualquer falha é silenciosa e não quebra o app.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (!('serviceWorker' in navigator)) return;
    // Skip under automation (Playwright sets navigator.webdriver) so the SW's
    // network-first API caching never shadows page.route() mocks in e2e.
    if (navigator.webdriver) return;

    const register = () => {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/', updateViaCache: 'none' })
        .catch((error) => {
          // SW é opcional; sem ele o app segue navegável online. Breadcrumb
          // only — never blocks the app (mirrors composition.ts's
          // onAppendFailure shape).
          Sentry.addBreadcrumb({
            category: 'pwa',
            level: 'warning',
            message: 'service worker registration failed',
            data: { message: error instanceof Error ? error.message : String(error) },
          });
        });
    };

    if (document.readyState === 'complete') {
      register();
      return;
    }
    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  return null;
}
