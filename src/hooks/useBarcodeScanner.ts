'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';

/**
 * Wraps @zxing/browser into a tiny imperative API for the scanner page.
 *
 * Lifecycle:
 *   - call start(videoEl) when the user opts into camera scan;
 *   - the hook resolves a barcode string via onResult and auto-stops;
 *   - call stop() to abort manually (back button, route change).
 *
 * Why a hook instead of inline logic in the page: the cleanup discipline is
 * non-trivial (reader.stop, track.stop on every camera track) and we want a
 * single place to evolve the strategy (BarcodeDetector fallback, format hints).
 */

export type CameraStatus = 'idle' | 'starting' | 'scanning' | 'denied' | 'unsupported' | 'error';

export interface UseBarcodeScannerOptions {
  onResult: (barcode: string) => void;
  /** When true, the hook does nothing — useful to gate behind a user gesture. */
  enabled?: boolean;
}

export function useBarcodeScanner({ onResult, enabled = true }: UseBarcodeScannerOptions) {
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const onResultRef = useRef(onResult);

  // Keep the latest callback without re-running the start effect.
  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setStatus('idle');
  }, []);

  const start = useCallback(
    async (videoEl: HTMLVideoElement) => {
      if (!enabled) return;
      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported');
        return;
      }
      setError(null);
      setStatus('starting');

      try {
        const reader = new BrowserMultiFormatReader();
        const controls = await reader.decodeFromVideoDevice(undefined, videoEl, (result) => {
          if (!result) return;
          const text = result.getText();
          // Stop immediately on first decode — caller decides whether to restart.
          controls.stop();
          controlsRef.current = null;
          setStatus('idle');
          onResultRef.current(text);
        });
        controlsRef.current = controls;
        setStatus('scanning');
      } catch (e: unknown) {
        const err = e as { name?: string; message?: string };
        if (err?.name === 'NotAllowedError' || err?.name === 'SecurityError') {
          setStatus('denied');
        } else if (err?.name === 'NotFoundError' || err?.name === 'OverconstrainedError') {
          setStatus('unsupported');
        } else {
          setStatus('error');
          setError(err?.message ?? 'Erro ao iniciar câmera');
        }
      }
    },
    [enabled]
  );

  // Always release the camera if the host component unmounts mid-scan.
  useEffect(() => () => stop(), [stop]);

  return { status, error, start, stop };
}
