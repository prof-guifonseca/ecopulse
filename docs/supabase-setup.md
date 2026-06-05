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

## 5. Próximo passo — Fase B (login anônimo + multiusuário)

Já preparado no schema/RLS. Falta plugar (melhor verificar ao vivo com as chaves):
- Login **anônimo** do Supabase (`signInAnonymously`) no client, atrás das envs.
- Trocar o `user_id` fixo `'local-user'` pelo `auth.uid()` real (RLS já cobre).
- Migração `localStorage` → nuvem no primeiro login.
- Leitura multiusuário (feed/leaderboards) e, opcionalmente, Realtime no feed.

Contratos canônicos em [`src/domain/types.ts`](../src/domain/types.ts); o ponto
de integração é [`src/lib/backend/mvpRepository.ts`](../src/lib/backend/mvpRepository.ts)
+ [`src/lib/backend/supabaseRest.ts`](../src/lib/backend/supabaseRest.ts).
