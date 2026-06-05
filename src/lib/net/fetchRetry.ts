// Small retry wrapper for outbound provider calls. Retries only on *thrown*
// errors (network/DNS/connection blips), with exponential backoff. It does NOT
// retry aborts (timeouts/cancels won't succeed) nor HTTP error responses — the
// callers already treat a non-ok response as a definitive miss and fall back to
// their local snapshot, so retrying 4xx/5xx would only add latency.

type Fetcher = typeof fetch;

interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
}

export async function fetchWithRetry(
  fetcher: Fetcher,
  input: Parameters<Fetcher>[0],
  init?: Parameters<Fetcher>[1],
  options: RetryOptions = {},
): Promise<Response> {
  const retries = options.retries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 200;
  let lastError: unknown;

  for (let attempt = 0; ; attempt++) {
    try {
      return await fetcher(input, init);
    } catch (error) {
      lastError = error;
      if ((error as { name?: string } | null)?.name === 'AbortError') throw error;
      if (attempt >= retries) break;
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * 2 ** attempt));
    }
  }

  throw lastError;
}
