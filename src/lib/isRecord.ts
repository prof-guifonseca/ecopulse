/**
 * `isRecord` — a plain object (not null, not an array). The one shape primitive
 * shared by the boundary parsers (`src/domain/parse.ts`) and the persistence
 * rehydration guard (`src/store/storage.ts`). It lives here, importing nothing,
 * so neither side forms a module cycle: the `@/domain` barrel transitively
 * reaches the store (domain → esg → region → store), so the store must not
 * import `@/domain`, but it can freely import this leaf.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
