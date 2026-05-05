'use client';

import { FEED_POSTS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useHydrated } from '@/hooks/useHydrated';
import { PageShell } from '@/components/ui/PageShell';
import { FeedPostCard } from './FeedPostCard';
import { CommunitySkeleton } from './CommunitySkeleton';

export function CommunityPage() {
  const hydrated = useHydrated();
  const openModal = useUIStore((s) => s.openModal);

  if (!hydrated) return <CommunitySkeleton />;

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <p className="t-eyebrow">Comunidade</p>
        <h1 className="t-display mt-1.5 leading-[0.95]">
          Quem caminha <span className="t-italic-soft">com você</span>
        </h1>
      </header>

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
