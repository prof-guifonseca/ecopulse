'use client';

import { useEffect, useRef, useState } from 'react';
import { STORIES } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { awardTokens } from '@/lib/gameActions';
import { cn } from '@/lib/cn';

interface Props {
  index: number;
}

export function StoryViewer({ index }: Props) {
  const close = useUIStore((s) => s.closeStory);
  const openStory = useUIStore((s) => s.openStory);
  const showToast = useUIStore((s) => s.showToast);
  const [progress, setProgress] = useState(0);
  const [voted, setVoted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const story = STORIES[index];

  useEffect(() => {
    setProgress(0);
    setVoted(false);
    intervalRef.current = setInterval(() => {
      setProgress((p) => (p >= 100 ? 100 : p + 2));
    }, 100);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [index]);

  useEffect(() => {
    if (progress < 100) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (index < STORIES.length - 1) openStory(index + 1);
    else close();
  }, [progress, index, close, openStory]);

  if (!story) return null;

  const vote = () => {
    if (voted) return;
    setVoted(true);
    awardTokens(3);
    showToast('+3 Eco-Tokens! Votou na enquete', 'reward');
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex flex-col bg-bg-primary"
      style={{ animation: 'fadeIn 0.3s ease' }}
    >
      {/* Progress bars */}
      <div className="flex gap-1 px-4 pt-3">
        {STORIES.map((_, i) => {
          const fill = i < index ? 100 : i === index ? progress : 0;
          return (
            <div key={i} className="h-[3px] flex-1 overflow-hidden rounded bg-white/20">
              <div className="h-full bg-white transition-[width]" style={{ width: `${fill}%` }} />
            </div>
          );
        })}
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{story.avatar}</span>
          <div>
            <div className="text-sm font-semibold">{story.user}</div>
            <div className="text-[11px] text-text-secondary">há 2h</div>
          </div>
        </div>
        <button
          onClick={close}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-lg"
          aria-label="Fechar story"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
        <div className="mb-3 text-5xl">{story.emoji}</div>
        <p className="text-lg font-semibold leading-snug">{story.text}</p>
      </div>

      {/* Poll */}
      {story.poll && (
        <div className="px-6 pb-8">
          <p className="mb-3 text-center text-sm text-text-secondary">{story.poll.q}</p>
          <div className="flex flex-col gap-2">
            {story.poll.opts.map((opt, i) => {
              const pct = story.poll!.pcts[i];
              return (
                <button
                  key={i}
                  onClick={vote}
                  className={cn(
                    'relative overflow-hidden rounded-md border bg-bg-secondary px-4 py-3 text-sm font-medium transition-transform active:scale-[0.97]',
                    voted ? 'border-accent-green' : 'border-white/8'
                  )}
                >
                  {voted && (
                    <span
                      className="absolute inset-0 bg-accent-green/10 transition-[width] duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <span className="relative">{opt}</span>
                  {voted && (
                    <span className="relative float-right font-bold text-accent-green">{pct}%</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
