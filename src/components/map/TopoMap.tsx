'use client';

import { useId } from 'react';

/**
 * Stylized topographic mini-map. Replaces the literal SVG grid that read
 * as "graph paper". Concentric organic curves + a meandering "river" line
 * suggest a real place without rendering an actual cartographic source.
 *
 * The component is purely decorative; pins and the user-position marker
 * are layered on top by MapPage.
 */
export function TopoMap({ children }: { children?: React.ReactNode }) {
  const id = useId();

  return (
    <div
      className="relative overflow-hidden rounded-[var(--radius-md)] border-soft"
      style={{
        aspectRatio: '1 / 1',
        background:
          'radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent-green) 12%, transparent) 0%, transparent 55%), linear-gradient(180deg, var(--bg-elevated), #0c1410)',
      }}
    >
      <svg
        viewBox="0 0 200 200"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <radialGradient id={`${id}-fade`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
            <stop offset="60%" stopColor="rgba(255,255,255,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* Soft mask so topo lines fade at the edges instead of crashing into the border */}
          <radialGradient id={`${id}-mask`} cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="white" stopOpacity="1" />
            <stop offset="80%" stopColor="white" stopOpacity="0.85" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>

          <mask id={`${id}-mask-ref`}>
            <rect width="200" height="200" fill={`url(#${id}-mask)`} />
          </mask>
        </defs>

        <g mask={`url(#${id}-mask-ref)`} stroke="rgba(255,255,255,0.08)" fill="none" strokeWidth="0.6">
          {/* Concentric topo lines — tweaked to avoid perfect circles */}
          <path d="M 100 70 Q 138 76 142 100 Q 138 124 100 130 Q 62 124 58 100 Q 62 76 100 70 Z" />
          <path d="M 100 55 Q 154 64 156 100 Q 154 138 100 145 Q 46 138 44 100 Q 46 62 100 55 Z" />
          <path d="M 100 38 Q 172 50 176 102 Q 172 152 100 162 Q 28 152 24 102 Q 28 50 100 38 Z" />
          <path d="M 100 20 Q 192 36 196 104 Q 192 174 100 184 Q 8 174 4 104 Q 8 36 100 20 Z" />
        </g>

        {/* Meandering "river" / path */}
        <path
          d="M 8 130 C 50 110, 70 150, 110 122 S 170 100, 198 80"
          stroke="rgba(141,219,152,0.30)"
          strokeWidth="1.4"
          fill="none"
          strokeLinecap="round"
        />

        {/* Subtle highlight blob on top */}
        <circle cx="100" cy="100" r="80" fill={`url(#${id}-fade)`} />
      </svg>

      {/* Children = pins, user marker, etc. */}
      {children}
    </div>
  );
}
