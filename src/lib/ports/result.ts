/**
 * Result — railway-oriented return type. Commands return a Result instead of
 * throwing, so callers handle success and failure exhaustively (the AppError
 * union + assertNever make a missed case a compile error). No exception ever
 * crosses the command boundary.
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T>(value: T): Result<T, never> => ({ ok: true, value });

export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok;
}

export function map<T, U, E>(result: Result<T, E>, f: (value: T) => U): Result<U, E> {
  return result.ok ? ok(f(result.value)) : result;
}

export function andThen<T, U, E>(
  result: Result<T, E>,
  f: (value: T) => Result<U, E>,
): Result<U, E> {
  return result.ok ? f(result.value) : result;
}
