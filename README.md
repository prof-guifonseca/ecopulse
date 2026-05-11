# EcoPulse

Aplicativo educacional de hábitos sustentáveis. **100% MVP navegável local** —
os dados vêm de uma simulação determinística e versionada sobre catálogos
curados, persistida em `localStorage`. Sem backend, sem servidor, sem chamadas
externas em runtime.

## Simulação local

Na primeira abertura, a aplicação começa como um usuário novo:

- `/` cai no onboarding.
- O onboarding cria uma sessão `new-user` em `ecopulse:simulation`.
- O primeiro scan guiado libera a Home e inicia o ciclo diário.
- Scanner, missões, feed, mapa e arena registram eventos auditáveis no ledger
  local da simulação.

O antigo Arthur segue disponível como cenário explícito `arthur-demo` para QA
e apresentações, mas não é mais o default automático. Para reiniciar o estado:
**pressione e segure por 1.2s o logo "EcoPulse"** no header. Confirma e o app
volta para o onboarding.

## Stack

- Next.js 16.2.6 (App Router) + React 19
- TypeScript 5 (strict)
- Tailwind CSS 4 (sem `tailwind.config`; tokens em `src/app/globals.css`)
- Zustand 5 com `persist` em `localStorage`
- Lucide React para ícones

> Leia [`AGENTS.md`](./AGENTS.md) antes de editar — Next 16 tem breaking
> changes vs versões anteriores.

## Scripts

```bash
npm install
npm run dev    # next dev — http://localhost:3000
npm run build  # next build
npm run lint   # eslint
npm run typecheck
npm run test:unit
npm run test:e2e
npm run test:a11y
npm run audit
npm run check
npm run overnight
```

## Estrutura

```
src/
├── app/
│   ├── (main)/                Layout com BottomNav + FauxStatusBar
│   │   ├── home/              Painel diário
│   │   ├── scanner/           Simulador de scan + catálogo (45 produtos)
│   │   ├── map/               Londrina · Centro (24 pontos GPS-style)
│   │   ├── community/         Feed (14 posts simulados)
│   │   └── profile/           Impacto, Loja, Badges
│   ├── onboarding/            Fallback se o seed for limpo manualmente
│   ├── error.tsx              Boundary de erro raiz
│   ├── not-found.tsx          404
│   └── layout.tsx             Root + fontes
├── components/                UI por feature, primitives, skins SVG
├── data/                      Catálogos: products, mapPoints, badges, …
├── lib/
│   ├── scoring.ts             deriveScore() puro (testável)
│   ├── simulatedScan.ts       Scan determinístico sobre a simulação
│   ├── demoSeed.ts            Cenário Arthur explícito (não default)
│   ├── game/rules.ts          Regras puras de unlock (skins, badges)
│   └── map/londrina.ts        Bounding box + projeção lat/lng → %
├── simulation/                RNG, cenários, queries e catálogos simulados
├── store/                     Zustand: user, game, ui, social, scanHistory
└── types/                     Tipos compartilhados
```

## O que NÃO existe nesse protótipo

- Backend, banco, autenticação.
- Câmera real ou leitor de código de barras (removido na v3 — vide
  `lib/simulatedScan.ts` e o ritual coreografado em `ScannerPage`).
- Integração com Open Food Facts ou outras APIs externas em runtime.
- Mapas com tile services (Mapbox/OSM) — o mapa de Londrina é SVG ilustrado
  hand-crafted em `components/map/LondrinaBackdrop.tsx`.
- Login, multi-usuário, sincronização entre dispositivos.

Tudo o que você vê é uma simulação coerente. Os scores A–E são derivados
de regras puras em `src/lib/scoring.ts` aplicadas ao catálogo expandido.

## Princípios da v3

1. **Primeira sessão precisa ser verdadeira o bastante** — o MVP começa vazio,
   mas cada ação deixa rastro e muda o estado.
2. **Simulado estruturado supera fake solto**: zero dependência de rede,
   100% offline, cenário previsível e pronto para virar backend.
3. **Honestidade visual**: nada se passa por uma feature real. Onde o app
   simula, ele etiqueta (ex: "Feed simulado · prototype").
4. **Motion como linguagem**: cada ação tem feedback (scan ritual, token
   gain animado, bottom-nav indicator deslizando, stagger nas listas).
5. **Acessibilidade**: focus trap nos modais, `aria-live` nos toasts,
   contraste WCAG AA, `prefers-reduced-motion` respeitado.
