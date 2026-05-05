'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { STORIES } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { awardTokens } from '@/lib/gameActions';
import { unsplashUrl, type UnsplashKey } from '@/lib/unsplash';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface Props {
  index: number;
}

const STORY_DURATION_MS = 5500;
const TICK_MS = 60;

export function StoryViewer({ index }: Props) {
  const close = useUIStore((s) => s.closeStory);
  const openStory = useUIStore((s) => s.openStory);
  const showToast = useUIStore((s) => s.showToast);
  // Encoding "fresh story state" via a key reset rather than setState-in-effect.
  // We track the index this state belongs to; when it diverges we reset locally.
  const [stateForIndex, setStateForIndex] = useState(index);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [voted, setVoted] = useState(false);
  if (stateForIndex !== index) {
    setStateForIndex(index);
    setProgress(0);
    setVoted(false);
  }
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX = useRef<number | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const story = STORIES[index];

  // Tick progress; pause when held
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(() => {
      setProgress((p) => Math.min(100, p + (100 * TICK_MS) / STORY_DURATION_MS));
    }, TICK_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, index]);

  // Advance when full
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
    showToast('+3 Eco-Tokens por votar', 'reward');
  };

  // Tap zones (left/right) advance stories; hold pauses; swipe also advances
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    holdTimer.current = setTimeout(() => setPaused(true), 220);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    setPaused(false);
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const endX = e.changedTouches[0]?.clientX ?? start;
    const dx = endX - start;
    if (dx > 60) {
      if (index > 0) openStory(index - 1);
    } else if (dx < -60) {
      if (index < STORIES.length - 1) openStory(index + 1);
      else close();
    }
  };

  const handleZoneClick = (zone: 'prev' | 'next') => {
    if (zone === 'prev') {
      if (progress > 12 && !paused) {
        setProgress(0);
      } else if (index > 0) {
        openStory(index - 1);
      }
    } else if (index < STORIES.length - 1) {
      openStory(index + 1);
    } else {
      close();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[500] flex justify-center bg-black"
      style={{ animation: 'fadeIn 0.25s ease' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative flex h-full w-full max-w-[var(--shell-width)] flex-col">
        {/* Background photo */}
        {story.imageKey ? (
          <Image
            src={unsplashUrl(story.imageKey as UnsplashKey, { w: 900, h: 1600, q: 80 })}
            alt=""
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#182a21,#0a120e)]" />
        )}

        {/* Cinematic gradient overlay for legibility */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.85) 100%)',
          }}
        />

        {/* Top: progress bars */}
        <div className="relative z-10 flex gap-1 px-4 pt-[calc(env(safe-area-inset-top,0px)+12px)]">
          {STORIES.map((_, i) => {
            const fill = i < index ? 100 : i === index ? progress : 0;
            return (
              <div key={i} className="h-[3px] flex-1 overflow-hidden rounded bg-white/25">
                <div className="h-full bg-white" style={{ width: `${fill}%`, transition: 'width 60ms linear' }} />
              </div>
            );
          })}
        </div>

        {/* Top: user info + close */}
        <div className="relative z-10 flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{story.avatar}</span>
            <div>
              <div className="t-title text-white">{story.user}</div>
              <div className="t-caption text-white/70">Há instantes</div>
            </div>
          </div>
          <button
            onClick={close}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25"
            aria-label="Fechar story"
          >
            <Icon icon={X} size={18} />
          </button>
        </div>

        {/* Tap zones — left/right thirds of the screen */}
        <button
          aria-label="Story anterior"
          className="absolute inset-y-0 left-0 z-10 w-1/3"
          onClick={() => handleZoneClick('prev')}
        />
        <button
          aria-label="Próximo story"
          className="absolute inset-y-0 right-0 z-10 w-1/3"
          onClick={() => handleZoneClick('next')}
        />

        {/* Center spacer (so caption aligns to bottom even on tall screens) */}
        <div className="relative z-0 flex-1" />

        {/* Caption + poll */}
        <div className="relative z-10 px-5 pb-[calc(env(safe-area-inset-bottom,0px)+24px)]">
          <h2 className="t-headline mb-4 max-w-[24ch] text-white drop-shadow-lg">{story.text}</h2>

          {story.poll && (
            <div className="rounded-[var(--radius-lg)] bg-black/35 p-3 backdrop-blur-md">
              <p className="t-caption mb-2 text-center text-white/85">{story.poll.q}</p>
              <div className="flex flex-col gap-1.5">
                {story.poll.opts.map((opt, i) => {
                  const pct = story.poll!.pcts[i];
                  return (
                    <button
                      key={i}
                      onClick={vote}
                      className={cn(
                        'relative overflow-hidden rounded-full border bg-white/12 px-4 py-2.5 text-left t-body-sm font-medium text-white transition-transform active:scale-[0.98]',
                        voted ? 'border-[var(--accent-green)]/55' : 'border-white/20'
                      )}
                    >
                      {voted && (
                        <span
                          className="absolute inset-0 bg-[var(--accent-green)]/22 transition-[width] duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <span className="relative">{opt}</span>
                      {voted && (
                        <span className="relative float-right font-semibold text-[var(--accent-green)]">{pct}%</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hold-to-pause hint, only shown briefly on first story */}
          {index === 0 && !paused && progress < 8 ? (
            <p className="t-caption mt-3 text-center text-white/60">
              Toque pra avançar · Segure pra pausar
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
