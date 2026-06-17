// schema:check — asserts the persistence code and the SQL migration agree on
// the set of tables the app writes to. A string-set assertion (not a SQL
// parser), mirroring the `tokens:check` idiom: the migration is the source of
// truth, and CI fails if `buildSupabaseRow` upserts a table the migration
// doesn't declare. Catches the drift where a new persisted table is wired in
// code without a matching migration.
//
// Scope (honest limits): the `events` table stores any event type in a `jsonb`
// column, so there are no per-type columns to drift against — this checks the
// TABLE set, which is the part the schema actually pins down. It is a
// one-directional ⊆ check (code tables must exist in the migration; the
// migration may declare more, e.g. `profiles`).
//
// Usage: node scripts/check-schema.mjs   (or `npm run schema:check`)

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');

const sql = readFileSync(join(root, 'supabase', 'migrations', '0001_ecopulse_schema.sql'), 'utf8');
const rest = readFileSync(join(root, 'src', 'lib', 'backend', 'supabaseRest.ts'), 'utf8');

const migrationTables = new Set(
  [...sql.matchAll(/create table if not exists public\.(\w+)/g)].map((m) => m[1]),
);

// The explicit `case '<table>':` labels in buildSupabaseRow — the tables the BFF
// extracts columns for and therefore knows by name.
const codeTables = new Set([...rest.matchAll(/case '(\w+)':/g)].map((m) => m[1]));

if (migrationTables.size === 0) {
  console.error('schema:check — no tables found in the migration; check the SQL path/regex.');
  process.exit(1);
}

const missing = [...codeTables].filter((table) => !migrationTables.has(table));

if (missing.length > 0) {
  console.error(
    `schema:check — these tables are written in supabaseRest.ts but absent from the migration:\n  ${missing.join('\n  ')}\n` +
      'Add them to supabase/migrations/0001_ecopulse_schema.sql (or fix the table name).',
  );
  process.exit(1);
}

console.log(
  `schema:check — OK (${codeTables.size} written tables ⊆ ${migrationTables.size} migration tables)`,
);
