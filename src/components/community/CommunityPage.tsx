'use client';

import { useMemo } from 'react';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { useSocialStore } from '@/store/socialStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useUserStore } from '@/store/userStore';
import { useHydrated } from '@/hooks/useHydrated';
import { buildLocalCommunityFeed } from '@/lib/community/localFeed';
import { PageShell } from '@/components/ui/PageShell';
import { FeedPostCard } from './FeedPostCard';
import { CommunitySkeleton } from './CommunitySkeleton';

export function CommunityPage() {
  const hydrated = useHydrated();
  const openModal = useUIStore((s) => s.openModal);
  const likedPostIds = useSocialStore((s) => s.likedPosts);
  const comments = useSocialStore((s) => s.comments);
  const history = useScanHistoryStore((s) => s.history);
  const viewerName = useUserStore((s) => s.name);
  const visitedPointIds = useGameStore((s) => s.visitedPoints);
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);

  const feed = useMemo(() => {
    return buildLocalCommunityFeed({
      history,
      visitedPointIds,
      likedPostIds,
      activeChallenges,
      completedChallenges,
      comments,
      viewerName,
    });
  }, [activeChallenges, comments, completedChallenges, history, likedPostIds, viewerName, visitedPointIds]);

  if (!hydrated) return <CommunitySkeleton />;

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <h1 className="t-headline">Comunidade</h1>
        <p className="mt-1 t-caption">Londrina</p>
      </header>

      <div className="stagger space-y-5">
        {feed.map((post) => (
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
