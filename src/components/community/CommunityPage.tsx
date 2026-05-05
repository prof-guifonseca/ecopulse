'use client';

import Image from 'next/image';
import { Heart, MessageCircle, MessageSquare } from 'lucide-react';
import { FEED_POSTS, STORIES } from '@/data';
import { useSocialStore } from '@/store/socialStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { useHydrated } from '@/hooks/useHydrated';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { unsplashUrl, type UnsplashKey } from '@/lib/unsplash';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { PageShell } from '@/components/ui/PageShell';
import { Skeleton } from '@/components/shared/Skeleton';
import { cn } from '@/lib/cn';

export function CommunityPage() {
  const hydrated = useHydrated();
  const openStory = useUIStore((s) => s.openStory);
  const openChatList = useUIStore((s) => s.openChatList);
  const openModal = useUIStore((s) => s.openModal);
  const unreadHint = STORIES.length;

  if (!hydrated) return <CommunitySkeleton />;

  return (
    <PageShell spacing={5}>
      <header className="flex items-start justify-between gap-3 pt-2">
        <div>
          <p className="t-eyebrow">Comunidade</p>
          <h1 className="t-display mt-1.5 leading-[0.95]">
            Quem caminha <span className="t-italic-soft">com você</span>
          </h1>
        </div>
        <button
          onClick={openChatList}
          aria-label="Abrir mensagens"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--line-soft)] bg-[var(--tint-1)] text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
        >
          <Icon icon={MessageSquare} size={16} />
        </button>
      </header>

      <StoriesRail onOpen={openStory} unreadCount={unreadHint} />

      <div className="space-y-5">
        {FEED_POSTS.map((post) => (
          <FeedPostCard
            key={post.id}
            post={post}
            onOpenComments={() => openModal({ kind: 'postComments', id: post.id })}
          />
        ))}
      </div>
    </PageShell>
  );
}

function StoriesRail({
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
                  {story.imageKey ? (
                    <Image
                      src={unsplashUrl(story.imageKey as UnsplashKey, { w: 200, h: 200 })}
                      alt={story.user}
                      fill
                      sizes="78px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[var(--tint-2)] text-2xl">
                      {story.avatar}
                    </span>
                  )}
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

function FeedPostCard({
  post,
  onOpenComments,
}: {
  post: (typeof FEED_POSTS)[number];
  onOpenComments: () => void;
}) {
  const likedPosts = useSocialStore((s) => s.likedPosts);
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const incrementLikeMission = useGameStore((s) => s.incrementLikeMission);
  const likesMission = useGameStore((s) => s.dailyMissions.likes);
  const markMission = useGameStore((s) => s.markMission);
  const showToast = useUIStore((s) => s.showToast);

  const liked = likedPosts.includes(post.id);
  const likeCount = post.likes + (liked ? 1 : 0);

  const handleLike = () => {
    const newState = toggleLike(post.id);
    if (newState) {
      awardTokens(1);
      incrementLikeMission();
      const nextCount = likesMission + 1;
      if (nextCount === 5) {
        markMission('likes', 5);
        showToast('Missão diária: 5 likes', 'success');
      }
      if (likedPosts.length === 0) unlockBadge('first-like');
    }
  };

  const firstComment = post.commentList[0];

  return (
    <Card tone="solid" padded={false} className="overflow-hidden">
      {/* Photo only — caption sits below in clean text, not floating overlay */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {post.imageKey ? (
          <Image
            src={unsplashUrl(post.imageKey as UnsplashKey, { w: 900, h: 1125 })}
            alt={post.caption}
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: post.gradient }} />
        )}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute left-4 top-4 right-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/40 text-lg backdrop-blur-md">
            {post.user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="t-title leading-tight text-white drop-shadow-md">{post.user.name}</div>
            <div className="t-caption text-white/80">
              Nv {post.user.level} · {post.time}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <p className="t-body">{post.caption}</p>

        <div className="flex items-center gap-2">
          <Chip
            active={liked}
            onClick={handleLike}
            leftIcon={<Icon icon={Heart} size={14} fill={liked ? 'currentColor' : 'none'} />}
            className={cn(liked && 'text-[var(--accent-red)]')}
          >
            {likeCount}
          </Chip>
          <Chip onClick={onOpenComments} leftIcon={<Icon icon={MessageCircle} size={14} />}>
            {post.comments}
          </Chip>
        </div>

        {firstComment ? (
          <button
            onClick={onOpenComments}
            className="-mx-1 block w-full text-left rounded-md px-1 py-1 transition-colors hover:bg-[var(--tint-1)]"
          >
            <p className="t-body-sm">
              <span className="font-semibold text-[var(--text-primary)]">{firstComment.user}</span>{' '}
              <span className="text-[var(--text-secondary)]">{firstComment.text}</span>
            </p>
            {post.comments > 1 ? (
              <p className="t-caption mt-0.5">Ver todos os {post.comments} comentários →</p>
            ) : null}
          </button>
        ) : null}
      </div>
    </Card>
  );
}

function CommunitySkeleton() {
  return (
    <PageShell spacing={5}>
      <header className="flex items-start justify-between gap-3 pt-2" aria-busy="true" aria-live="polite">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-9 w-56" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full" />
      </header>
      <section aria-label="Carregando stories">
        <div className="-mx-3 flex gap-3 overflow-hidden px-3 pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex w-[78px] shrink-0 flex-col items-center gap-1.5">
              <Skeleton className="h-[78px] w-[78px] rounded-full" />
              <Skeleton className="h-3 w-12" />
            </div>
          ))}
        </div>
      </section>
      <div className="space-y-5">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} tone="solid" padded={false} className="overflow-hidden">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="space-y-2 px-4 py-4">
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 w-14 rounded-full" />
                <Skeleton className="h-8 w-12 rounded-full" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
