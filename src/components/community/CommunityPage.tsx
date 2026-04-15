'use client';

import { useState } from 'react';
import { Heart, MessageCircle, MessageSquare, Sparkles } from 'lucide-react';
import { FEED_POSTS, STORIES } from '@/data';
import { useSocialStore } from '@/store/socialStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { SectionHeader } from '@/components/shared/SectionHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Tabs } from '@/components/ui/Tabs';
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
    <div className="space-y-6" style={{ animation: 'fadeIn 0.35s ease' }}>
      <Card tone="hero" padded={false} className="px-5 py-5">
        <SectionHeader
          title="A rede em movimento"
          subtitle="Histórias rápidas no topo, conversa útil logo abaixo."
          right={
            <Button
              variant="secondary"
              size="sm"
              onClick={openChatList}
              leftIcon={<Icon icon={MessageSquare} size={14} />}
            >
              Mensagens
            </Button>
          }
        />

        <div className="-mx-1 flex gap-3 overflow-x-auto pb-1 pl-1 pr-1">
          {STORIES.map((story, index) => (
            <button
              key={story.user}
              onClick={() => openStory(index)}
              className="group flex min-w-[104px] shrink-0 flex-col gap-2 text-left"
            >
              <div className="relative flex h-[120px] items-end overflow-hidden rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-[linear-gradient(180deg,rgba(141,219,152,0.14),rgba(15,23,19,0.9))] px-3 py-3 transition-transform duration-200 group-hover:-translate-y-0.5">
                <span
                  aria-hidden
                  className="absolute left-0 top-0 h-full w-[3px]"
                  style={{ background: 'var(--gradient-primary)' }}
                />
                <div className="text-3xl">{story.avatar}</div>
              </div>
              <div>
                <div className="truncate text-[0.82rem] font-semibold text-text-primary">{story.user}</div>
                <div className="line-clamp-2 text-[0.72rem] leading-4 text-text-muted">{story.text}</div>
              </div>
            </button>
          ))}
        </div>
      </Card>

      <Tabs
        items={[
          { value: 'feed', label: 'Feed' },
          { value: 'hashtags', label: 'Tópicos' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {tab === 'feed' ? (
        <div className="space-y-4">
          {FEED_POSTS.map((post) => (
            <FeedPostCard
              key={post.id}
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
        showToast('Missão diária: 5 likes concluída', 'success');
      }
      if (likedPosts.length === 0) unlockBadge('first-like');
    }
  };

  return (
    <Card tone="solid" padded={false}>
      <div className="flex items-center gap-3 px-4 pt-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line-soft)] bg-white/[0.04] text-2xl">
          {post.user.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[0.9rem] font-semibold text-text-primary">{post.user.name}</div>
          <div className="text-[0.72rem] text-text-muted">
            Nível {post.user.level} · {post.time}
          </div>
        </div>
      </div>

      <div
        className="relative mt-4 h-64 overflow-hidden"
        style={{ background: post.gradient }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0)_40%,rgba(0,0,0,0.6)_100%)]" />
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {post.hashtags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full bg-black/40 px-2.5 py-1 text-[0.72rem] font-semibold text-white backdrop-blur-sm"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <div className="space-y-4 px-4 py-4">
        <p className="text-[0.88rem] leading-6 text-text-primary">{post.caption}</p>
        <div className="flex items-center gap-2 text-[0.85rem]">
          <button
            onClick={handleLike}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border border-[var(--line-soft)] px-3 py-1.5 font-semibold transition-colors',
              liked ? 'border-[rgba(227,138,132,0.4)] bg-[rgba(227,138,132,0.1)] text-accent-red' : 'bg-white/[0.02] text-text-secondary hover:text-text-primary'
            )}
          >
            <Icon icon={Heart} size={14} fill={liked ? 'currentColor' : 'none'} />
            {likeCount}
          </button>
          <button
            onClick={onOpenComments}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-soft)] bg-white/[0.02] px-3 py-1.5 font-semibold text-text-secondary transition-colors hover:text-text-primary"
          >
            <Icon icon={MessageCircle} size={14} />
            {post.comments}
          </button>
        </div>
      </div>
    </Card>
  );
}

function HashtagList() {
  return (
    <div className="space-y-3">
      {HASHTAGS.map((entry) => (
        <Card key={entry.tag} tone="solid" padded={false} className="px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[0.95rem] font-semibold text-text-primary">{entry.tag}</div>
              <div className="mt-0.5 text-[0.78rem] text-text-muted">
                {entry.count.toLocaleString('pt-BR')} posts ativos
              </div>
            </div>
            <span className="command-pill" data-active="true">
              <Icon icon={Sparkles} size={12} />
              Em alta
            </span>
          </div>
        </Card>
      ))}
    </div>
  );
}
