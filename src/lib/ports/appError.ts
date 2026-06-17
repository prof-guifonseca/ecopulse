/**
 * AppError — the closed failure vocabulary returned by commands (P1). A
 * discriminated union so handlers stay exhaustive via assertNever, and so the
 * runtime seam can map each kind to the right user-facing feedback.
 */
export type AppError =
  | { kind: 'validation'; message: string; field?: string }
  | { kind: 'empty-catalog'; message: string }
  | { kind: 'not-found'; message: string }
  | { kind: 'persistence'; message: string; cause?: string };

export const validationError = (message: string, field?: string): AppError => ({
  kind: 'validation',
  message,
  field,
});

export const emptyCatalogError = (message: string): AppError => ({
  kind: 'empty-catalog',
  message,
});

export const notFoundError = (message: string): AppError => ({ kind: 'not-found', message });

export const persistenceError = (message: string, cause?: string): AppError => ({
  kind: 'persistence',
  message,
  cause,
});
