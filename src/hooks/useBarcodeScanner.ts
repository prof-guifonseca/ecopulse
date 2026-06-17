'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type BarcodeDetectorResult = { rawValue: string };
type BarcodeDetectorCtor = new (options?: { formats?: string[] }) => {
  detect: (source: HTMLVideoElement) => Promise<BarcodeDetectorResult[]>;
};

/** EAN/UPC apenas — barcodes de produto de varejo. */
const NATIVE_FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e'];

interface Options {
  /** Chamado com o barcode cru assim que um código é lido. */
  onDetect: (raw: string) => void;
}

interface BarcodeScanner {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  active: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

/**
 * Leitura de barcode por câmera com dois motores: usa a API nativa
 * `BarcodeDetector` quando existe (Android/Chrome) e cai para o decoder
 * open-source ZXing (lazy-loaded) onde ela falta — notadamente iOS/Safari.
 * Em ambos os casos, ao detectar, fecha a câmera e dispara `onDetect`.
 */
export function useBarcodeScanner({ onDetect }: Options): BarcodeScanner {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const zxingControlsRef = useRef<{ stop: () => void } | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mantém o callback atual sem re-disparar o loop de decode.
  const onDetectRef = useRef(onDetect);
  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  const stop = useCallback(() => {
    zxingControlsRef.current?.stop();
    zxingControlsRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Câmera indisponível neste navegador.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      setError(null);
      setActive(true);
    } catch {
      setError('Permissão de câmera não concedida.');
    }
  }, []);

  // Conecta o stream ao <video> (necessário para o BarcodeDetector ler frames).
  useEffect(() => {
    const video = videoRef.current;
    if (!active || !video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    void video.play().catch(() => undefined);
  }, [active]);

  // Loop de decodificação: nativo preferido, ZXing como fallback.
  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;

    const handleRaw = (raw: string) => {
      stop();
      onDetectRef.current(raw);
    };

    const Detector = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
      .BarcodeDetector;

    if (Detector) {
      const detector = new Detector({ formats: NATIVE_FORMATS });
      let cancelled = false;
      let frame = 0;
      const tick = async () => {
        if (cancelled) return;
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const codes = await detector.detect(video).catch(() => []);
          const raw = codes[0]?.rawValue;
          if (raw) {
            cancelled = true;
            handleRaw(raw);
            return;
          }
        }
        frame = window.requestAnimationFrame(tick);
      };
      frame = window.requestAnimationFrame(tick);
      return () => {
        cancelled = true;
        window.cancelAnimationFrame(frame);
      };
    }

    // Fallback ZXing (carregado sob demanda para não pesar o bundle inicial).
    let disposed = false;
    const stream = streamRef.current;
    if (!stream) return;
    void (async () => {
      try {
        const [{ BrowserMultiFormatReader }, { DecodeHintType, BarcodeFormat }] = await Promise.all(
          [import('@zxing/browser'), import('@zxing/library')],
        );
        if (disposed) return;
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
        ]);
        const reader = new BrowserMultiFormatReader(hints);
        const controls = await reader.decodeFromStream(stream, video, (result) => {
          if (result) handleRaw(result.getText());
        });
        if (disposed) {
          controls.stop();
          return;
        }
        zxingControlsRef.current = controls;
      } catch {
        setError('Leitor de câmera indisponível neste navegador.');
      }
    })();

    return () => {
      disposed = true;
      zxingControlsRef.current?.stop();
      zxingControlsRef.current = null;
    };
  }, [active, stop]);

  // Garante o desligamento da câmera ao desmontar.
  useEffect(() => () => stop(), [stop]);

  return { videoRef, active, error, start, stop };
}
