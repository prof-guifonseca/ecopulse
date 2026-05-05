# EcoPulse

Mobile-first prototype of a sustainability companion app: scan products, complete daily missions, earn tokens, follow stories from a green-living community, and track your impact.

Built as a Next.js 16 + React 19 single-device-shell experience that previews on desktop framed inside an editorial canvas.

## Stack

- Next.js 16.2.3 (App Router) + React 19
- Zustand 5 for state (`src/store/`)
- Tailwind CSS v4 (no `tailwind.config`; tokens live in `src/app/globals.css`)
- TypeScript strict, ESLint flat config

## Scripts

```bash
npm run dev    # next dev
npm run build  # next build
npm run lint   # eslint
```

## Routes

All under `src/app/`:
- `/` — entry redirect / onboarding gate
- `/onboarding` — first-launch flow
- `/home`, `/scanner`, `/map`, `/community`, `/profile` — main tabs (route group `(main)`)

## Conventions

Read [`AGENTS.md`](./AGENTS.md) before editing — Next.js 16 has breaking changes vs prior versions. Game side-effects (token awards, badge unlocks) flow through `src/lib/gameActions.ts`. Modals/overlays mount once via `src/components/overlays/Overlays.tsx` and are driven by `useUIStore`.
