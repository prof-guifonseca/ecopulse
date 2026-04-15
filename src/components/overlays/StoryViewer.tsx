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
    showToast('+3 Eco-Tokens por participar da enquete', 'reward');
  };

  return (
    <div className="fixed inset-0 z-[500] flex justify-center bg-[rgba(5,10,8,0.92)]" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="flex h-full w-full max-w-[var(--shell-width)] flex-col bg-[linear-gradient(180deg,#0a120d_0%,#111a14_100%)]">
        <div className="flex gap-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
          {STORIES.map((_, i) => {
            const fill = i < index ? 100 : i === index ? progress : 0;
            return (
              <div key={i} className="h-[3px] flex-1 overflow-hidden rounded bg-white/18">
                <div className="h-full bg-white transition-[width]" style={{ width: `${fill}%` }} />
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{story.avatar}</span>
            <div>
              <div className="text-sm font-semibold text-text-primary">{story.user}</div>
              <div className="text-[11px] text-text-secondary">agora na comunidade</div>
            </div>
          </div>
          <button
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg"
            aria-label="Fechar story"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-white/8 bg-white/6 text-5xl shadow-[0_18px_36px_rgba(145,216,159,0.12)]">
            {story.emoji}
          </div>
          <p className="mt-6 text-xl font-semibold leading-8 text-text-primary">{story.text}</p>
        </div>

        {story.poll && (
          <div className="px-5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
            <p className="mb-3 text-center text-sm text-text-secondary">{story.poll.q}</p>
            <div className="flex flex-col gap-2">
              {story.poll.opts.map((opt, i) => {
                const pct = story.poll!.pcts[i];
                return (
                  <button
                    key={i}
                    onClick={vote}
                    className={cn(
                      'relative overflow-hidden rounded-[20px] border bg-white/5 px-4 py-3 text-sm font-medium transition-transform active:scale-[0.97]',
                      voted ? 'border-accent-green/30' : 'border-white/8'
                    )}
                  >
                    {voted && (
                      <span
                        className="absolute inset-0 bg-accent-green/12 transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <span className="relative">{opt}</span>
                    {voted && <span className="relative float-right font-bold text-accent-green">{pct}%</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
