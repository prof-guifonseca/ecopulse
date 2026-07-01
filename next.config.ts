import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import path from 'node:path';

// Built once at module scope: Supabase/map-style hosts are build-time env
// vars here, not runtime secrets, so a static policy is fine.
const supabaseOrigin = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin
  : '';
const mapStyleOrigin = process.env.NEXT_PUBLIC_MAP_STYLE_URL
  ? new URL(process.env.NEXT_PUBLIC_MAP_STYLE_URL).origin
  : '';

const connectSrc = [
  "'self'",
  supabaseOrigin,
  mapStyleOrigin,
  'https://*.sentry.io',
  'https://*.ingest.sentry.io',
  'https://*.ingest.us.sentry.io',
  'https://*.ingest.de.sentry.io',
]
  .filter(Boolean)
  .join(' ');

const imgSrc = [
  "'self'",
  'data:',
  'blob:',
  'https://images.unsplash.com',
  'https://tile.openstreetmap.org',
  mapStyleOrigin,
]
  .filter(Boolean)
  .join(' ');

// No inline <script>/dangerouslySetInnerHTML anywhere in src/ (confirmed by
// the fragility audit), so script-src can stay strict. style-src needs
// 'unsafe-inline' because the app uses style={{...}} inline extensively
// (Modal drag transform, ProductDetailModal backgroundImage) and there's no
// nonce plumbing — tightening that is a separate, larger decision.
// worker-src needs blob: for MapLibre GL JS, which spins up its tile/vector
// workers from a blob: URL internally; omitting this breaks the map
// silently and isn't caught by any existing automated test.
const csp = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline'",
  `img-src ${imgSrc}`,
  `connect-src ${connectSrc}`,
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  // Pin Turbopack's workspace root to this project so it doesn't infer
  // a stray ancestor lockfile (C:\Users\guilh\dev) and fail to resolve
  // tailwindcss / postcss plugins.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
      {
        // O browser deve sempre revalidar o script do service worker.
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  telemetry: false,
  silent: !process.env.CI,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
  webpack: {
    treeshake: {
      removeDebugLogging: true,
      excludeReplayIframe: true,
      excludeReplayShadowDOM: true,
    },
  },
});
