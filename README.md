# EcoPulse

Aplicativo educacional de hábitos sustentáveis. **MVP navegável local-first** —
o app preserva um ledger local versionado para demo/offline, mas os fluxos
visíveis de scanner, comunidade e mapa usam snapshots reais e rastreáveis:

- Mapa ESG com MapLibre + OpenStreetMap/Overpass/Nominatim via Route Handler.
- Mapa offline/fallback com snapshot oficial/curado de Londrina, sem lugares inventados.
- Scanner com barcode/manual via `/api/products/lookup` e snapshot Open Food Facts Brasil.
- Comunidade com feed local derivado de scans, visitas ESG e cards editoriais de fontes reais.
- APIs BFF em `/api/*` para eventos, scans, comunidade, visitas ESG e impacto.
- Demo/simulação só aparece atrás de modo explícito.

## Simulação local

Na primeira abertura, a aplicação começa como um usuário novo:

- `/` cai no onboarding.
- O onboarding cria um usuário local e um ledger `new-user` em `ecopulse:simulation`.
- O primeiro scan guiado libera a Home e inicia o ciclo diário.
- Scanner, missões, feed e mapa resolvem dados por Open Food Facts, OpenStreetMap
  ou snapshot oficial/curado; o ledger local fica como histórico/compatibilidade.

O antigo Arthur segue disponível como cenário explícito `arthur-demo` para QA
e apresentações, mas não é mais o default automático. Para reiniciar o estado:
**pressione e segure por 1.2s o logo "EcoPulse"** no header. Confirma e o app
volta para o onboarding.

## Pitch

- `/pitch` é a superfície curta para banca: problema, solução, protótipo,
  impacto e roteiro de fala em 5 minutos.
- `/onboarding` inicia a demonstração guiada do protótipo: visão, três ações,
  tribo, perfil e primeiro scan real.

## Stack

- Next.js 16.2.6 (App Router + Route Handlers) + React 19
- TypeScript 5 (strict)
- Tailwind CSS 4 (sem `tailwind.config`; tokens em `src/app/globals.css`)
- Zustand 5 com `persist` em `localStorage`
- Lucide React para ícones
- MapLibre GL + react-map-gl para mapa ESG
- Open Food Facts como provider inicial de produto por barcode

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
│   │   ├── scanner/           Barcode/manual + amostra real Open Food Facts
│   │   ├── map/               MapLibre + pontos ESG abertos/snapshot oficial
│   │   ├── community/         Feed de atividade real/local + reações persistíveis
│   │   └── profile/           Impacto, Loja, Badges
│   ├── api/                   BFF: produtos, scans, eventos, ESG, comunidade
│   ├── onboarding/            Fallback se o seed for limpo manualmente
│   ├── error.tsx              Boundary de erro raiz
│   ├── not-found.tsx          404
│   └── layout.tsx             Root + fontes
├── components/                UI por feature, primitives, skins SVG
├── data/                      Snapshots: Open Food Facts, Londrina ESG, badges, …
├── demo/                      Demo Arthur e scan demo, só por flag explícita
├── lib/
│   ├── scoring.ts             deriveScore() puro (testável)
│   ├── products/catalog.ts    Fachada real-first sobre Open Food Facts snapshot
│   ├── game/rules.ts          Regras puras de unlock (skins, badges)
│   └── map/londrina.ts        Bounding box + projeção lat/lng → %
├── domain/                    Contratos canônicos do MVP real-progressivo
├── simulation/                RNG, cenários e queries locais do ciclo navegável
├── store/                     Zustand: user, game, ui, social, scanHistory
└── types/                     Tipos compartilhados
```

## Dados reais vs simulação

Veja [`docs/mvp-data-inventory.md`](./docs/mvp-data-inventory.md) para o
inventário explícito de `provider`, `cache`, `official`, `simulation` legado e
`demo` por fluxo.

Ainda não existe login multiusuário nem banco obrigatório. As APIs já tentam
persistir em Supabase quando `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY`
estiverem configurados; sem isso, o MVP continua navegável com memória de
processo, stores locais, snapshot Open Food Facts e snapshot oficial/curado de
Londrina.

## Princípios da v3

1. **Primeira sessão precisa ser verdadeira o bastante** — o MVP começa vazio,
   mas cada ação deixa rastro e muda o estado.
2. **Local-first com fontes reais progressivas**: provedores abertos entram por
   APIs BFF, sempre com cache/fallback para manter a navegação.
3. **Honestidade visual**: nada se passa por uma feature real. Fontes aparecem
   como Open Food Facts, OpenStreetMap, snapshot oficial, cache ou demo.
4. **Motion como linguagem**: cada ação tem feedback (scan ritual, token
   gain animado, bottom-nav indicator deslizando, stagger nas listas).
5. **Acessibilidade**: focus trap nos modais, `aria-live` nos toasts,
   contraste WCAG AA, `prefers-reduced-motion` respeitado.
