# Backend EcoPulse no Supabase (free tier)

O EcoPulse é **local-first**: sem Supabase configurado ele funciona 100% (memória
de processo + `localStorage`). Configurando o Supabase, o BFF (`/api/*`) passa a
**persistir** de forma durável. Tudo é **gated** por `isSupabaseConfigured()`
(`src/lib/backend/supabaseRest.ts`) — sem chaves, nada do Supabase roda e a CI
segue verde.

## 1. Criar o projeto (≈2 min, sem cartão)

1. Acesse [supabase.com](https://supabase.com) → **New project** (free tier).
2. Em **Project Settings → API**, copie:
   - **Project URL** → `SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `SUPABASE_ANON_KEY` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ segredo de servidor, nunca no client)
3. Cole esses valores no `.env` (veja `.env.example`).

## 2. Aplicar o schema

No **SQL Editor** do Supabase Studio, cole e rode
[`supabase/migrations/0001_ecopulse_schema.sql`](../supabase/migrations/0001_ecopulse_schema.sql)
(ou `supabase db push` com a CLI). Cria as tabelas (`profiles`, `events`,
`scan_results`, `impact_entries`, `community_reactions`, `community_comments`),
índices e as policies de RLS. É idempotente.

## 3. Verificar (Fase A — persistência)

Com as envs setadas + schema aplicado, suba o app e faça um scan/visita. No
Supabase Studio → **Table Editor**, confira que as linhas aparecem (o BFF grava
via service-role). As rotas `/api/community/feed`, `/api/impact/me` e
`/api/events/me` passam a reportar `source: "provider"`.

> O caminho de **leitura** das rotas ainda vem da memória de processo nesta fase
> (a gravação já é durável). A leitura a partir do Supabase + o login chegam na
> Fase B.

## 4. Manter o projeto "quente" (free tier pausa após ~7 dias ociosos)

Para uma banca/demo, evite a pausa com um cron grátis. Ex.: um GitHub Action
semanal que faz um `GET` simples na REST API:

```yaml
# .github/workflows/supabase-keepalive.yml (exemplo)
on:
  schedule: [{ cron: "0 12 * * 1" }] # toda segunda 12:00 UTC
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - run: curl -fsS "$SUPABASE_URL/rest/v1/profiles?select=id&limit=1" -H "apikey: $SUPABASE_ANON_KEY"
        env:
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
```

## 5. Fase B — login anônimo + escrita por usuário (já no código, gated)

Plugado e gated por `NEXT_PUBLIC_SUPABASE_*` (cliente) e `isSupabaseConfigured()`
(servidor). Com as chaves do passo 1 + as `NEXT_PUBLIC_SUPABASE_*` no `.env`:

- **Login anônimo** ([`src/lib/client/supabaseBrowser.ts`](../src/lib/client/supabaseBrowser.ts)
  + [`SupabaseAuthInit`](../src/components/auth/SupabaseAuthInit.tsx)): cada
  visitante ganha um `auth.users` real, sem fricção, no carregamento.
- **Escrita por usuário**: o cliente manda o access token; o BFF resolve o
  `user_id` real via [`resolveUserId`](../src/lib/backend/supabaseAuth.ts)
  (token verificado no GoTrue, com fallback seguro para `local-user`) e marca as
  linhas (scans, eventos, impacto, reações, comentários) com esse id.

> ⚠️ **Pendente de verificação ao vivo** (não dá para testar sem as chaves): o
> round-trip de auth e a escrita por usuário foram escritos gated e cobertos por
> testes unitários, mas só dá para confirmar o comportamento real ligando o
> projeto. A **CI fica verde por estar desligado**, não por provar o fluxo online.

## 6. O que falta (passo final, melhor a 4 mãos com as chaves)

- **Leitura multiusuário**: as rotas ainda leem da memória de processo. O helper
  [`supabaseSelectData`](../src/lib/backend/supabaseRest.ts) já está pronto e
  testado para trocar as leituras de `mvpRepository` (feed/leaderboards/`/me`)
  por consultas ao Postgres com escopo por usuário.
- **Migração `localStorage` → nuvem** no primeiro login (replay do histórico local).
- **Realtime** no feed (opcional, grátis).

Contratos canônicos em [`src/domain/types.ts`](../src/domain/types.ts).
