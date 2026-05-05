'use client';

import { useSocialStore } from '@/store/socialStore';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';

const LIKE_MISSION_TARGET = 5;

/**
 * Likes/unlikes a post and routes the side-effects (token award, daily
 * likes mission, first-like badge) through the canonical game actions.
 */
export function useLikePost(postId: string): { liked: boolean; toggle: () => void } {
  const likedPosts = useSocialStore((s) => s.likedPosts);
  const toggleLike = useSocialStore((s) => s.toggleLike);
  const incrementLikeMission = useGameStore((s) => s.incrementLikeMission);
  const likesMission = useGameStore((s) => s.dailyMissions.likes);
  const markMission = useGameStore((s) => s.markMission);
  const showToast = useUIStore((s) => s.showToast);

  const liked = likedPosts.includes(postId);

  const toggle = () => {
    const becameLiked = toggleLike(postId);
    if (!becameLiked) return;

    awardTokens(1);
    incrementLikeMission();

    if (likesMission + 1 === LIKE_MISSION_TARGET) {
      markMission('likes', LIKE_MISSION_TARGET);
      showToast(`Missão diária: ${LIKE_MISSION_TARGET} likes`, 'success');
    }
    if (likedPosts.length === 0) unlockBadge('first-like');
  };

  return { liked, toggle };
}
