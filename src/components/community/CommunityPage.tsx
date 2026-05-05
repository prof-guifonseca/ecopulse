'use client';

import { MessageSquare } from 'lucide-react';
import { FEED_POSTS, STORIES } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useHydrated } from '@/hooks/useHydrated';
import { Icon } from '@/components/ui/Icon';
import { PageShell } from '@/components/ui/PageShell';
import { StoriesRail } from './StoriesRail';
import { FeedPostCard } from './FeedPostCard';
import { CommunitySkeleton } from './CommunitySkeleton';

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
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-soft bg-tint-1 text-[var(--text-secondary)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--text-primary)]"
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
