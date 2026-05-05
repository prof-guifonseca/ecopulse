'use client';

import Image from 'next/image';
import { Heart, MessageCircle, MessageSquare, Sparkles } from 'lucide-react';
import { FEED_POSTS, STORIES } from '@/data';
import { useSocialStore } from '@/store/socialStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { useHydrated } from '@/hooks/useHydrated';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { unsplashUrl, type UnsplashKey } from '@/lib/unsplash';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
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
    <PageShell>
      <header className="flex items-end justify-between gap-3">
        <div>
          <p className="t-eyebrow">Comunidade</p>
          <h1 className="t-display mt-1.5 leading-[1]">
            Quem caminha <span className="t-italic-soft">com você</span>
          </h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={openChatList}
          leftIcon={<Icon icon={MessageSquare} size={14} />}
        >
          Mensagens
        </Button>
      </header>

      <StoriesRail
        onOpen={openStory}
        unreadCount={unreadHint}
      />

      <div className="space-y-6">
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
              className="group flex w-[88px] shrink-0 flex-col items-center gap-1.5"
              aria-label={`Story de ${story.user}`}
            >
              <span
                className={cn(
                  'relative flex h-[88px] w-[88px] items-center justify-center rounded-full p-[3px] transition-transform duration-200 group-active:scale-95',
                  unread
                    ? 'bg-[conic-gradient(from_140deg,var(--accent-green),var(--accent-gold),var(--accent-green))]'
                    : 'bg-[var(--line-soft)]'
                )}
              >
                <span className="relative h-full w-full overflow-hidden rounded-full border-2 border-[var(--bg-primary)]">
                  {story.imageKey ? (
                    <Image
                      src={unsplashUrl(story.imageKey as UnsplashKey, { w: 220, h: 220 })}
                      alt={story.user}
                      fill
                      sizes="88px"
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center bg-[var(--tint-2)] text-3xl">
                      {story.avatar}
                    </span>
                  )}
                </span>
              </span>
              <span className="t-caption max-w-[80px] truncate text-[var(--text-secondary)]">
                {story.user}
              </span>
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
      {/* Image-dominant hero */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {post.imageKey ? (
          <Image
            src={unsplashUrl(post.imageKey as UnsplashKey, { w: 900, h: 1125 })}
            alt=""
            fill
            sizes="(max-width: 430px) 100vw, 430px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0" style={{ background: post.gradient }} />
        )}

        {/* Top fade for header legibility */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/55 to-transparent" />

        {/* Floating user header */}
        <div className="absolute left-4 top-4 right-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 bg-black/35 text-xl backdrop-blur-md">
            {post.user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="t-title leading-tight text-white drop-shadow-md">{post.user.name}</div>
            <div className="t-caption text-white/80">
              Nv {post.user.level} · {post.time}
            </div>
          </div>
        </div>

        {/* Bottom: caption + tags */}
        <div className="absolute inset-x-0 bottom-0 p-4 pb-5">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
          <div className="relative">
            <p className="t-headline mb-2 max-w-[24ch] text-white drop-shadow-md">{post.caption}</p>
            <div className="flex flex-wrap gap-1.5">
              {post.hashtags.map((tag) => (
                <span
                  key={tag}
                  className="t-caption inline-flex items-center rounded-full border border-white/25 bg-black/35 px-2.5 py-1 font-medium text-white backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Engagement strip */}
      <div className="flex items-center gap-2 px-4 pt-3">
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
        <span className="ml-auto t-caption inline-flex items-center gap-1 text-[var(--accent-green)]">
          <Icon icon={Sparkles} size={12} />
          +1 ao curtir
        </span>
      </div>

      {/* Inline first comment preview */}
      {firstComment ? (
        <button
          onClick={onOpenComments}
          className="mt-2 block w-full text-left transition-colors hover:bg-[var(--tint-1)]"
        >
          <div className="px-4 py-3">
            <p className="t-body-sm">
              <span className="font-semibold text-[var(--text-primary)]">{firstComment.user}</span>{' '}
              <span className="text-[var(--text-secondary)]">{firstComment.text}</span>
            </p>
            {post.comments > 1 ? (
              <p className="t-caption mt-1">Ver todos os {post.comments} comentários →</p>
            ) : null}
          </div>
        </button>
      ) : (
        <div className="px-4 pb-4" />
      )}
    </Card>
  );
}

function CommunitySkeleton() {
  return (
    <PageShell>
      <header className="flex items-end justify-between gap-3" aria-busy="true" aria-live="polite">
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-56" />
        </div>
        <Skeleton className="h-9 w-32 rounded-full" />
      </header>

      <section aria-label="Carregando stories">
        <div className="-mx-3 flex gap-3 overflow-hidden px-3 pb-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex w-[88px] shrink-0 flex-col items-center gap-1.5">
              <Skeleton className="h-[88px] w-[88px] rounded-full" />
              <Skeleton className="h-3 w-14" />
            </div>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} tone="solid" padded={false} className="overflow-hidden">
            <Skeleton className="aspect-[4/5] w-full rounded-none" />
            <div className="flex items-center gap-2 px-4 pt-3">
              <Skeleton className="h-8 w-14 rounded-full" />
              <Skeleton className="h-8 w-12 rounded-full" />
              <Skeleton className="ml-auto h-3 w-20" />
            </div>
            <div className="space-y-2 px-4 py-3">
              <Skeleton className="h-3 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
