'use client';

import { useEffect, useRef, useState } from 'react';

const STORY_DURATION_MS = 5500;
const TICK_MS = 60;

interface Args {
  index: number;
  total: number;
  onAdvance: (next: number) => void;
  onClose: () => void;
}

interface Result {
  progress: number;
  paused: boolean;
  setPaused: (p: boolean) => void;
  resetProgress: () => void;
}

/**
 * Drives a story progress bar: ticks while not paused, advances to the
 * next index on completion, closes after the last one, and resets when
 * the parent jumps to a different index.
 */
export function useStoryTimer({ index, total, onAdvance, onClose }: Args): Result {
  // Encoding "fresh story state" via a tracked index rather than setState-in-effect.
  const [trackedIndex, setTrackedIndex] = useState(index);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  if (trackedIndex !== index) {
    setTrackedIndex(index);
    setProgress(0);
  }
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setProgress((p) => Math.min(100, p + (100 * TICK_MS) / STORY_DURATION_MS));
    }, TICK_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, index]);

  useEffect(() => {
    if (progress < 100) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (index < total - 1) onAdvance(index + 1);
    else onClose();
  }, [progress, index, total, onAdvance, onClose]);

  return { progress, paused, setPaused, resetProgress: () => setProgress(0) };
}
