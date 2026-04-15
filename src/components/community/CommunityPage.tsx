'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FEED_POSTS, STORIES } from '@/data';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { buildDemoHref, isDemoMode } from '@/lib/demoMode';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { useGameStore } from '@/store/gameStore';
import { useSocialStore } from '@/store/socialStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/cn';

const HASHTAGS = [
  { tag: '#Upcycling', count: 1240 },
  { tag: '#ZeroWaste', count: 892 },
  { tag: '#HortaUrbana', count: 567 },
  { tag: '#Compostagem', count: 423 },
  { tag: '#Granel', count: 389 },
];

export function CommunityPage() {
  const searchParams = useSearchParams();
  const demoMode = isDemoMode(searchParams);
  const currentView = searchParams.get('view') === 'topics' ? 'topics' : 'feed';
  const openStory = useUIStore((s) => s.openStory);
  const openChatList = useUIStore((s) => s.openChatList);
  const openModal = useUIStore((s) => s.openModal);
  const featuredPost = FEED_POSTS[0];

  return (
    <div className="space-y-6 pb-3" style={{ animation: 'fadeIn 0.35s ease' }}>
      <section className="overflow-hidden rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(17,25,21,0.98),rgba(8,13,11,0.96))] px-5 py-5 shadow-[0_30px_80px_rgba(1,8,5,0.34)]">
        <div className="flex items-start justify-between gap-3">
          <div className="max-w-[18ch]">
            <div className="text-[0.76rem] font-medium text-text-secondary">Fluxo de apoio</div>
            <h1 className="mt-3 text-[2.2rem] font-semibold leading-[0.94] tracking-[-0.05em] text-text-primary">
              Prova social, sem ruído.
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              Stories primeiro, um post hero por vez e acesso rápido às mensagens quando a demo precisar de conversa.
            </p>
          </div>

          <button
            onClick={openChatList}
            className="flex min-h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-text-primary"
          >
            Mensagens
          </button>
        </div>

        <div className="mt-6 flex gap-3 overflow-x-auto pb-1">
          {STORIES.map((story, index) => (
            <button
              key={story.user}
              onClick={() => openStory(index)}
              className="group flex min-w-[120px] shrink-0 flex-col gap-2 text-left"
            >
              <div className="flex h-[138px] items-end rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(24,36,29,0.95),rgba(13,20,16,0.9))] px-4 py-4 transition-transform duration-200 group-hover:translate-y-[-1px]">
                <div>
                  <div className="text-4xl">{story.avatar}</div>
                  <div className="mt-3 text-[0.74rem] font-medium text-text-secondary">Story</div>
                </div>
              </div>
              <div>
                <div className="truncate text-sm font-semibold text-text-primary">{story.user}</div>
                <div className="text-xs leading-5 text-text-secondary">{story.text}</div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => openModal({ kind: 'postComments', id: featuredPost.id })}
          className="mt-6 block w-full overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(135deg,rgba(18,26,22,0.92),rgba(10,15,13,0.92))] text-left"
        >
          <div className="relative h-60 overflow-hidden" style={{ background: featuredPost.gradient }}>
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,16,12,0.02)_35%,rgba(8,16,12,0.72)_100%)]" />
            <div className="absolute bottom-4 left-4 right-4">
              <div className="text-[0.76rem] font-medium text-white/74">Post em destaque</div>
              <div className="mt-2 text-[1.08rem] font-semibold leading-6 text-white">{featuredPost.user.name}</div>
              <p className="mt-2 text-sm leading-6 text-white/86">{featuredPost.caption}</p>
            </div>
          </div>
        </button>
      </section>

      <div className="flex gap-2">
        <Link
          href={buildDemoHref('/community', demoMode, { view: 'feed' })}
          className="command-pill"
          data-active={currentView === 'feed' ? 'true' : undefined}
        >
          Feed
        </Link>
        <Link
          href={buildDemoHref('/community', demoMode, { view: 'topics' })}
          className="command-pill"
          data-active={currentView === 'topics' ? 'true' : undefined}
        >
          Tópicos
        </Link>
      </div>

      {currentView === 'feed' ? (
        <section className="space-y-3">
          <SectionHeader
            title="Mais posts da comunidade"
            subtitle="Itens de apoio para continuar a apresentação sem virar um feed infinito."
          />
          <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] shadow-[0_20px_56px_rgba(1,8,5,0.22)]">
            {FEED_POSTS.slice(1, 4).map((post, index) => (
              <FeedRow
                key={post.id}
                post={post}
                onOpenComments={() => openModal({ kind: 'postComments', id: post.id })}
                withDivider={index !== 2}
              />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <SectionHeader
            title="Tópicos para navegar"
            subtitle="A demo pode alternar para um estado de descoberta sem mudar de linguagem."
          />
          <div className="space-y-3">
            {HASHTAGS.map((entry) => (
              <article
                key={entry.tag}
                className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,26,22,0.94),rgba(11,16,14,0.9))] px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-base font-semibold text-text-primary">{entry.tag}</div>
                    <div className="mt-1 text-sm text-text-secondary">
                      {entry.count.toLocaleString('pt-BR')} publicações ativas
                    </div>
                  </div>
                  <span className="command-pill">Em alta</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function FeedRow({
  post,
  onOpenComments,
  withDivider,
}: {
  post: (typeof FEED_POSTS)[number];
  onOpenComments: () => void;
  withDivider: boolean;
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

    if (!newState) return;

    awardTokens(1);
    incrementLikeMission();
    const nextCount = likesMission + 1;

    if (nextCount === 5) {
      markMission('likes', 5);
      showToast('Missão diária de likes concluída', 'success');
    }

    if (likedPosts.length === 0) unlockBadge('first-like');
  };

  return (
    <article className="px-4 py-4" style={withDivider ? { borderBottom: '1px solid rgba(255,255,255,0.06)' } : undefined}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-[20px] border border-white/8 bg-white/6 text-2xl">
          {post.user.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-text-primary">{post.user.name}</div>
          <div className="text-xs text-text-secondary">
            Nível {post.user.level} · {post.time}
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-text-primary">{post.caption}</p>

      <div className="mt-4 flex items-center gap-3 text-sm text-text-secondary">
        <button
          onClick={handleLike}
          className={cn(
            'flex min-h-10 items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 transition-transform duration-200 hover:translate-y-[-1px]',
            liked && 'text-accent-red'
          )}
        >
          <span className="text-base">{liked ? '❤️' : '🤍'}</span>
          <span className="font-medium">{likeCount}</span>
        </button>
        <button
          onClick={onOpenComments}
          className="flex min-h-10 items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 transition-transform duration-200 hover:translate-y-[-1px]"
        >
          <span className="text-base">💬</span>
          <span className="font-medium">{post.comments}</span>
        </button>
      </div>
    </article>
  );
}
