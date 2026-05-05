# EcoPulse

Aplicativo educacional de hábitos sustentáveis. **100% protótipo navegável** —
todos os dados são simulados e vivem no localStorage. Sem backend, sem
servidor, sem chamadas externas em runtime.

## Modo demo

Na primeira abertura, a aplicação semeia automaticamente um perfil vivido:

- **Arthur**, Guardião Verde, nível 7, 480 Eco-Tokens, sequência de 12 dias.
- 23 scans no histórico distribuídos pelos últimos 6 dias.
- 8 conquistas de 13, 6 SkinPacks de 12, 5 pontos visitados em Londrina.
- 1 desafio em andamento (3/7 dias) e 2 já concluídos.
- 4 tutoriais marcados como vistos, missão diária de scan já feita.

Para reiniciar o estado da demo: **pressione e segure por 1.2s o logo
"EcoPulse"** no header. Confirma e o seed roda do zero.

## Stack

- Next.js 16.2.3 (App Router) + React 19
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
│   ├── simulatedScan.ts       Picker do scanner sobre o catálogo
│   ├── demoSeed.ts            Hidrata o estado do Arthur (idempotente)
│   ├── game/rules.ts          Regras puras de unlock (skins, badges)
│   └── map/londrina.ts        Bounding box + projeção lat/lng → %
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

1. **Primeiros 5 segundos vencem ou perdem a demo** — por isso o seed do
   Arthur é tão denso.
2. **Simulado supera real para esse contexto**: zero dependência de rede,
   100% offline, demo previsível.
3. **Honestidade visual**: nada se passa por uma feature real. Onde o app
   simula, ele etiqueta (ex: "Feed simulado · prototype").
4. **Motion como linguagem**: cada ação tem feedback (scan ritual, token
   gain animado, bottom-nav indicator deslizando, stagger nas listas).
5. **Acessibilidade**: focus trap nos modais, `aria-live` nos toasts,
   contraste WCAG AA, `prefers-reduced-motion` respeitado.
