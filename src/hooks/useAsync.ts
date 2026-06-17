'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useAsync (P4) — the one client-side async state machine. Wraps a task in
 * loading/success/error state with an AbortController that cancels the previous
 * run and aborts on unmount (so a late response never sets state on a gone
 * component, and overlapping triggers don't race — last call wins). The task
 * receives the signal; pair it with `fetchWithRetry(fetch, url, { signal })`
 * for retry on transient network blips. An aborted run is a no-op, never an
 * error. Optional `onError` for a toast/breadcrumb at the call site.
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  error: Error | null;
}

interface UseAsyncResult<Args extends unknown[], T> extends AsyncState<T> {
  isLoading: boolean;
  run: (...args: Args) => Promise<T | null>;
  reset: () => void;
}

export function useAsync<Args extends unknown[], T>(
  task: (signal: AbortSignal, ...args: Args) => Promise<T>,
  options: { onError?: (error: Error) => void } = {},
): UseAsyncResult<Args, T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: null,
    error: null,
  });

  const controllerRef = useRef<AbortController | null>(null);
  const mountedRef = useRef(true);
  const taskRef = useRef(task);
  const onErrorRef = useRef(options.onError);

  // Keep the latest task/onError without re-creating `run` (refs are updated in
  // an effect, never during render). `run` reads them at call time — always from
  // an event handler, after effects have flushed.
  useEffect(() => {
    taskRef.current = task;
    onErrorRef.current = options.onError;
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const run = useCallback(async (...args: Args): Promise<T | null> => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState((prev) => ({ ...prev, status: 'loading', error: null }));

    try {
      const data = await taskRef.current(controller.signal, ...args);
      if (controller.signal.aborted || !mountedRef.current) return null;
      setState({ status: 'success', data, error: null });
      return data;
    } catch (cause) {
      const aborted =
        controller.signal.aborted || (cause as { name?: string } | null)?.name === 'AbortError';
      if (aborted) return null;
      const error = cause instanceof Error ? cause : new Error(String(cause));
      if (mountedRef.current) setState({ status: 'error', data: null, error });
      onErrorRef.current?.(error);
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    controllerRef.current?.abort();
    setState({ status: 'idle', data: null, error: null });
  }, []);

  return {
    status: state.status,
    data: state.data,
    error: state.error,
    isLoading: state.status === 'loading',
    run,
    reset,
  };
}
