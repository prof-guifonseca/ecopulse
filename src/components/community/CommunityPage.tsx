'use client';

import { useState } from 'react';
import { FEED_POSTS, STORIES } from '@/data';
import { useSocialStore } from '@/store/socialStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { GlassCard } from '@/components/shared/GlassCard';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { cn } from '@/lib/cn';

export function CommunityPage() {
  const [tab, setTab] = useState<'feed' | 'hashtags'>('feed');
  const openStory = useUIStore((s) => s.openStory);
  const openChatList = useUIStore((s) => s.openChatList);
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="space-y-5" style={{ animation: 'fadeIn 0.35s ease' }}>
      <div className="flex items-center justify-between">
        <SectionHeader title="Comunidade" subtitle="Histórias, dicas e amigos" />
        <button
          onClick={openChatList}
          className="relative rounded-full bg-bg-tertiary p-2 text-lg"
          aria-label="Mensagens"
        >
          💬
          <span
            className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-bg-primary"
            style={{ background: 'var(--accent-red)' }}
          >
            3
          </span>
        </button>
      </div>

      {/* Stories */}
      <section>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STORIES.map((s, i) => (
            <button
              key={s.user}
              onClick={() => openStory(i)}
              className="flex shrink-0 flex-col items-center gap-1"
            >
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full p-[2px]"
                style={{ background: 'var(--gradient-primary)' }}
              >
                <div className="flex h-full w-full items-center justify-center rounded-full bg-bg-primary text-2xl">
                  {s.avatar}
                </div>
              </div>
              <span className="max-w-[64px] truncate text-[10px] text-text-secondary">
                {s.user}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {(['feed', 'hashtags'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 border-b-2 py-2 text-xs font-semibold transition-colors',
              tab === t
                ? 'border-accent-green text-text-primary'
                : 'border-transparent text-text-secondary'
            )}
          >
            {t === 'feed' ? 'Feed' : '#Hashtags'}
          </button>
        ))}
      </div>

      {tab === 'feed' ? (
        <ul className="space-y-4">
          {FEED_POSTS.map((p) => (
            <FeedPostCard
              key={p.id}
              post={p}
              onOpenComments={() => openModal({ kind: 'postComments', id: p.id })}
            />
          ))}
        </ul>
      ) : (
        <HashtagList />
      )}
    </div>
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
        showToast('Missão diária: 5 likes ✅', 'success');
      }
      if (likedPosts.length === 0) unlockBadge('first-like');
    }
  };

  return (
    <li>
      <GlassCard className="p-0">
        <div className="flex items-center gap-2 p-3">
          <span className="text-2xl">{post.user.avatar}</span>
          <div className="flex-1 min-w-0">
            <div className="truncate text-sm font-semibold">{post.user.name}</div>
            <div className="text-[10px] text-text-secondary">
              Nível {post.user.level} · {post.time}
            </div>
          </div>
        </div>
        <div className="h-48" style={{ background: post.gradient }} />
        <div className="p-3">
          <p className="text-sm">{post.caption}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {post.hashtags.map((h) => (
              <span key={h} className="text-[11px]" style={{ color: 'var(--accent-cyan)' }}>
                {h}
              </span>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-4 text-xs text-text-secondary">
            <button
              onClick={handleLike}
              className="flex items-center gap-1.5 transition-transform active:scale-95"
              style={liked ? { color: 'var(--accent-red)' } : undefined}
            >
              <span className="text-base">{liked ? '❤️' : '🤍'}</span>
              <span className="font-semibold">{likeCount}</span>
            </button>
            <button
              onClick={onOpenComments}
              className="flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <span className="text-base">💬</span>
              <span className="font-semibold">{post.comments}</span>
            </button>
          </div>
        </div>
      </GlassCard>
    </li>
  );
}

function HashtagList() {
  const tags = [
    { tag: '#Upcycling', count: 1240 },
    { tag: '#ZeroWaste', count: 892 },
    { tag: '#HortaUrbana', count: 567 },
    { tag: '#Compostagem', count: 423 },
    { tag: '#Granel', count: 389 },
    { tag: '#DescarteCorreto', count: 312 },
    { tag: '#ConsumoConsciente', count: 285 },
    { tag: '#ModaSustentavel', count: 178 },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3">
      {tags.map((t) => (
        <li key={t.tag}>
          <GlassCard className="text-center">
            <div className="text-sm font-bold" style={{ color: 'var(--accent-cyan)' }}>
              {t.tag}
            </div>
            <div className="mt-1 text-[11px] text-text-secondary">
              {t.count.toLocaleString('pt-BR')} posts
            </div>
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
