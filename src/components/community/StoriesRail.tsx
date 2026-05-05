'use client';

import Image from 'next/image';
import { STORIES } from '@/data';
import { unsplashUrl, type UnsplashKey } from '@/lib/unsplash';
import { cn } from '@/lib/cn';

export function StoriesRail({
  onOpen,
  unreadCount,
}: {
  onOpen: (i: number) => void;
  unreadCount: number;
}) {
  return (
    <section aria-label="Stories da comunidade">
      <div className="-mx-3 flex gap-3 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {STORIES.map((story, index) => {
          const unread = index < unreadCount;
          return (
            <button
              key={story.user}
              onClick={() => onOpen(index)}
              className="group flex w-[78px] shrink-0 flex-col items-center gap-1.5"
              aria-label={`Story de ${story.user}`}
            >
              <span
                className={cn(
                  'relative flex h-[78px] w-[78px] items-center justify-center rounded-full p-[2px] transition-transform duration-200 group-active:scale-95',
                  unread
                    ? 'bg-[color:color-mix(in_srgb,var(--accent-green)_55%,transparent)]'
                    : 'bg-[var(--line-soft)]'
                )}
              >
                <span className="relative h-full w-full overflow-hidden rounded-full border-2 border-[var(--bg-primary)]">
                  <Image
                    src={unsplashUrl(story.imageKey as UnsplashKey, { w: 200, h: 200 })}
                    alt={story.user}
                    fill
                    sizes="78px"
                    className="object-cover"
                  />
                </span>
              </span>
              <span className="t-caption max-w-[72px] truncate">{story.user}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
