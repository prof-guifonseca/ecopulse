-- EcoPulse — esquema inicial do MVP (Supabase free tier).
-- Espelha os contratos canônicos de src/domain/types.ts. Cada linha guarda o
-- objeto completo em `data` (jsonb) + colunas extraídas para consulta/índice.
-- O BFF grava via service-role (ignora RLS); as policies abaixo já preparam o
-- acesso por usuário para quando o login anônimo (Fase B) entrar.
--
-- Como aplicar: Supabase Studio → SQL Editor → cole e rode; ou
-- `supabase db push` com a CLI. Idempotente (IF NOT EXISTS / drop policy).

-- ── Perfis ───────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          text primary key,          -- auth.uid()::text (ou 'local-user' antes do login)
  name        text,
  tribe       text,
  region_id   text,
  created_at  timestamptz not null default now()
);

-- ── Eventos auditáveis ───────────────────────────────────────────────────────
create table if not exists public.events (
  id          text primary key,
  user_id     text not null default 'local-user',
  type        text,
  day         text,
  source      text,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

-- ── Scans de produto ─────────────────────────────────────────────────────────
create table if not exists public.scan_results (
  id          text primary key,
  user_id     text not null default 'local-user',
  score       text,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

-- ── Métricas de impacto (estimado/verificado) ───────────────────────────────
create table if not exists public.impact_entries (
  id          text primary key,
  user_id     text not null default 'local-user',
  metric      text,
  confidence  text,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

-- ── Reações da comunidade (like/promise) ────────────────────────────────────
create table if not exists public.community_reactions (
  id          text primary key,          -- "<user_id>:<post_id>:<reaction>"
  user_id     text not null default 'local-user',
  post_id     text not null,
  reaction    text not null check (reaction in ('like', 'promise')),
  active      boolean not null default true,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

-- ── Comentários da comunidade ────────────────────────────────────────────────
create table if not exists public.community_comments (
  id          text primary key,
  user_id     text not null default 'local-user',
  post_id     text not null,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);

create index if not exists events_user_idx            on public.events             (user_id, created_at desc);
create index if not exists scan_results_user_idx       on public.scan_results       (user_id, created_at desc);
create index if not exists impact_entries_user_idx     on public.impact_entries     (user_id, created_at desc);
create index if not exists community_reactions_user_idx on public.community_reactions (user_id);
create index if not exists community_comments_post_idx on public.community_comments (post_id, created_at desc);

-- ── Row-Level Security ───────────────────────────────────────────────────────
-- O service-role (usado pelo BFF em /api/*) ignora RLS, então a gravação atual
-- segue funcionando. As policies valem para acesso direto do cliente autenticado
-- (Fase B): cada pessoa lê/escreve o que é seu; feed e comentários são legíveis
-- por qualquer usuário autenticado.
alter table public.profiles            enable row level security;
alter table public.events              enable row level security;
alter table public.scan_results        enable row level security;
alter table public.impact_entries      enable row level security;
alter table public.community_reactions enable row level security;
alter table public.community_comments  enable row level security;

drop policy if exists "own profile"          on public.profiles;
drop policy if exists "own events"           on public.events;
drop policy if exists "own scans"            on public.scan_results;
drop policy if exists "own impact"           on public.impact_entries;
drop policy if exists "read reactions"       on public.community_reactions;
drop policy if exists "write own reactions"  on public.community_reactions;
drop policy if exists "update own reactions" on public.community_reactions;
drop policy if exists "read comments"        on public.community_comments;
drop policy if exists "write own comments"   on public.community_comments;

create policy "own profile" on public.profiles
  for all using (id = auth.uid()::text) with check (id = auth.uid()::text);

create policy "own events" on public.events
  for all using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

create policy "own scans" on public.scan_results
  for all using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

create policy "own impact" on public.impact_entries
  for all using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

create policy "read reactions" on public.community_reactions
  for select using (auth.role() = 'authenticated');
create policy "write own reactions" on public.community_reactions
  for insert with check (user_id = auth.uid()::text);
create policy "update own reactions" on public.community_reactions
  for update using (user_id = auth.uid()::text) with check (user_id = auth.uid()::text);

create policy "read comments" on public.community_comments
  for select using (auth.role() = 'authenticated');
create policy "write own comments" on public.community_comments
  for insert with check (user_id = auth.uid()::text);
