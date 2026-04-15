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
    <div className="space-y-6 lg:space-y-8" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.1fr)_320px]">
        <GlassCard variant="hud" accent="violet" className="px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <SectionHeader
                eyebrow="social relay"
                title="Comunidade"
                subtitle="Historias, dicas, tribos e trocas em uma camada mais viva e menos quadrada."
              />
              <div className="flex flex-wrap gap-2">
                <span className="command-pill" data-active="true">story relay</span>
                <span className="command-pill">faction chatter</span>
                <span className="command-pill">field posts</span>
              </div>
            </div>

            <button
              onClick={openChatList}
              className="surface surface-tile surface-accent-violet flex items-center gap-3 self-start rounded-full px-4 py-3"
              aria-label="Mensagens"
            >
              <span className="text-2xl">💬</span>
              <div className="text-left">
                <div className="hud-label">inbox</div>
                <div className="font-display text-lg font-bold">3 sinais novos</div>
              </div>
            </button>
          </div>

          <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
            {STORIES.map((story, index) => (
              <button
                key={story.user}
                onClick={() => openStory(index)}
                className="group flex min-w-[104px] shrink-0 flex-col gap-2 text-left"
              >
                <div className="surface surface-tile surface-accent-cyan flex h-[132px] items-end rounded-[24px] px-4 py-4 transition-transform duration-200 group-hover:translate-y-[-4px]">
                  <div>
                    <div className="text-4xl">{story.avatar}</div>
                    <div className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70">live</div>
                  </div>
                </div>
                <div>
                  <div className="truncate text-sm font-semibold text-text-primary">{story.user}</div>
                  <div className="text-xs text-text-secondary">story chain</div>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>

        <GlassCard variant="panel" accent="cyan" className="px-5 py-5">
          <div className="hud-label">stream filters</div>
          <div className="mt-3 flex gap-2">
            {(['feed', 'hashtags'] as const).map((currentTab) => (
              <button
                key={currentTab}
                onClick={() => setTab(currentTab)}
                className="command-pill"
                data-active={tab === currentTab ? 'true' : undefined}
              >
                {currentTab === 'feed' ? 'Feed' : 'Hashtags'}
              </button>
            ))}
          </div>
          <div className="mt-6 space-y-3">
            <GlassCard variant="ghost" accent="mint" className="px-4 py-4">
              <div className="hud-label">status</div>
              <div className="mt-2 font-display text-2xl font-bold">setor ativo</div>
              <div className="mt-2 text-sm text-text-secondary">
                O feed esta priorizando historias recentes e operacoes em grupo.
              </div>
            </GlassCard>
            <GlassCard variant="ghost" accent="violet" className="px-4 py-4">
              <div className="hud-label">ritmo social</div>
              <div className="mt-2 text-sm text-text-secondary">
                Curta, comente e participe dos chats para acelerar missoes de comunidade.
              </div>
            </GlassCard>
          </div>
        </GlassCard>
      </section>

      {tab === 'feed' ? (
        <ul className="grid gap-5 xl:grid-cols-2">
          {FEED_POSTS.map((post, index) => (
            <FeedPostCard
              key={post.id}
              accent={index % 3 === 0 ? 'mint' : index % 3 === 1 ? 'violet' : 'cyan'}
              post={post}
              onOpenComments={() => openModal({ kind: 'postComments', id: post.id })}
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
  accent,
}: {
  post: (typeof FEED_POSTS)[number];
  onOpenComments: () => void;
  accent: 'mint' | 'cyan' | 'violet';
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
        showToast('Missao diaria: 5 likes ✅', 'success');
      }

      if (likedPosts.length === 0) unlockBadge('first-like');
    }
  };

  return (
    <li>
      <GlassCard variant="panel" accent={accent} className="overflow-hidden p-0">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
            {post.user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-display text-xl font-bold">{post.user.name}</div>
            <div className="text-sm text-text-secondary">
              Nivel {post.user.level} · {post.time}
            </div>
          </div>
          <div className="command-pill">signal</div>
        </div>

        <div className="relative h-72 overflow-hidden sm:h-80" style={{ background: post.gradient }}>
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,17,0)_30%,rgba(7,11,17,0.35)_100%)]" />
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-2">
            {post.hashtags.map((tag) => (
              <span key={tag} className="command-pill bg-black/25 text-white/80">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4 px-5 py-5">
          <p className="text-base text-text-primary">{post.caption}</p>
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
    </li>
  );
}

function HashtagList() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {HASHTAGS.map((entry, index) => (
        <li key={entry.tag}>
          <GlassCard
            variant="tile"
            accent={index % 4 === 0 ? 'cyan' : index % 4 === 1 ? 'mint' : index % 4 === 2 ? 'violet' : 'amber'}
            className="px-5 py-5"
          >
            <div className="hud-label">trend packet</div>
            <div className="mt-4 font-display text-2xl font-bold" style={{ color: 'var(--accent-cyan)' }}>
              {entry.tag}
            </div>
            <div className="mt-3 text-sm text-text-secondary">{entry.count.toLocaleString('pt-BR')} posts ativos</div>
          </GlassCard>
        </li>
      ))}
    </ul>
  );
}
