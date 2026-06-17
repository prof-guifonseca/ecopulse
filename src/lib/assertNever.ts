/**
 * Exhaustiveness guard for discriminated unions.
 *
 * Call it in the unreachable `default` branch of a `switch` over a union. While
 * every variant is handled, the argument narrows to `never` and this compiles.
 * The day a new variant is added without its own `case`, the argument is no
 * longer `never` and the call **fails to compile** — the union and its handlers
 * can never silently drift apart again.
 *
 * @example
 * switch (shape.kind) {
 *   case 'circle': return area.circle(shape);
 *   case 'square': return area.square(shape);
 *   default: return assertNever(shape); // add 'triangle' → compile error here
 * }
 */
export function assertNever(value: never, message = 'Unhandled union member'): never {
  throw new Error(`${message}: ${JSON.stringify(value)}`);
}
