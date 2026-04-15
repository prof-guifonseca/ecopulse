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

const HASHTAGS = [
  { tag: '#Upcycling', count: 1240 },
  { tag: '#ZeroWaste', count: 892 },
  { tag: '#HortaUrbana', count: 567 },
  { tag: '#Compostagem', count: 423 },
  { tag: '#Granel', count: 389 },
  { tag: '#DescarteCorreto', count: 312 },
  { tag: '#ConsumoConsciente', count: 285 },
  { tag: '#ModaSustentavel', count: 178 },
];

export function CommunityPage() {
  const [tab, setTab] = useState<'feed' | 'hashtags'>('feed');
  const openStory = useUIStore((s) => s.openStory);
  const openChatList = useUIStore((s) => s.openChatList);
  const openModal = useUIStore((s) => s.openModal);

  return (
    <div className="space-y-5" style={{ animation: 'fadeIn 0.35s ease' }}>
      <GlassCard variant="hud" accent="mint" className="px-5 py-5">
        <SectionHeader
          eyebrow="Comunidade"
          title="Veja o que está movimentando a rede"
          subtitle="Histórias curtas, posts úteis e conversas rápidas para manter o senso de pertencimento."
          right={
            <button
              onClick={openChatList}
              className="rounded-full bg-white/7 px-4 py-2 text-sm font-semibold text-text-primary"
            >
              Mensagens
            </button>
          }
        />

        <div className="flex gap-3 overflow-x-auto pb-1">
          {STORIES.map((story, index) => (
            <button
              key={story.user}
              onClick={() => openStory(index)}
              className="group flex min-w-[110px] shrink-0 flex-col gap-2 text-left"
            >
              <div className="surface surface-tile surface-accent-mint flex h-[132px] items-end rounded-[24px] px-4 py-4 transition-transform duration-200 group-hover:translate-y-[-2px]">
                <div>
                  <div className="text-4xl">{story.avatar}</div>
                  <div className="mt-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70">
                    story
                  </div>
                </div>
              </div>
              <div>
                <div className="truncate text-sm font-semibold text-text-primary">{story.user}</div>
                <div className="text-xs text-text-secondary">{story.text}</div>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>

      <div className="flex gap-2">
        {(['feed', 'hashtags'] as const).map((currentTab) => (
          <button
            key={currentTab}
            onClick={() => setTab(currentTab)}
            className="command-pill"
            data-active={tab === currentTab ? 'true' : undefined}
          >
            {currentTab === 'feed' ? 'Feed' : 'Tópicos'}
          </button>
        ))}
      </div>

      {tab === 'feed' ? (
        <div className="space-y-4">
          {FEED_POSTS.map((post, index) => (
            <FeedPostCard
              key={post.id}
              accent={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'amber' : 'cyan'}
              post={post}
              onOpenComments={() => openModal({ kind: 'postComments', id: post.id })}
            />
          ))}
        </div>
      ) : (
        <HashtagList />
      )}
    </div>
  );
}

function FeedPostCard({
  post,
  onOpenComments,
  accent,
}: {
  post: (typeof FEED_POSTS)[number];
  onOpenComments: () => void;
  accent: 'mint' | 'cyan' | 'amber';
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
        showToast('Missão diária: 5 likes concluída', 'success');
      }

      if (likedPosts.length === 0) unlockBadge('first-like');
    }
  };

  return (
    <GlassCard variant="panel" accent={accent} className="overflow-hidden p-0">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/7 text-2xl">
          {post.user.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-text-primary">{post.user.name}</div>
          <div className="text-xs text-text-secondary">
            Nível {post.user.level} · {post.time}
          </div>
        </div>
      </div>

      <div className="relative h-72 overflow-hidden" style={{ background: post.gradient }}>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,12,0)_30%,rgba(8,16,12,0.45)_100%)]" />
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
          {post.hashtags.map((tag) => (
            <span key={tag} className="command-pill bg-black/20 text-white/80">
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 px-5 py-5">
        <p className="text-sm leading-6 text-text-primary">{post.caption}</p>
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <button
            onClick={handleLike}
            className={cn(
              'surface surface-ghost flex items-center gap-2 rounded-full px-4 py-2 transition-transform duration-200 hover:translate-y-[-1px]',
              liked && 'text-accent-red'
            )}
          >
            <span className="text-base">{liked ? '❤️' : '🤍'}</span>
            <span className="font-semibold">{likeCount}</span>
          </button>
          <button
            onClick={onOpenComments}
            className="surface surface-ghost flex items-center gap-2 rounded-full px-4 py-2 transition-transform duration-200 hover:translate-y-[-1px]"
          >
            <span className="text-base">💬</span>
            <span className="font-semibold">{post.comments}</span>
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function HashtagList() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {HASHTAGS.map((entry, index) => (
        <GlassCard
          key={entry.tag}
          variant="tile"
          accent={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'amber' : 'cyan'}
          className="px-4 py-4"
        >
          <div className="hud-label">Tópico em alta</div>
          <div className="mt-3 text-base font-semibold text-text-primary">{entry.tag}</div>
          <div className="mt-2 text-sm text-text-secondary">
            {entry.count.toLocaleString('pt-BR')} posts ativos
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
