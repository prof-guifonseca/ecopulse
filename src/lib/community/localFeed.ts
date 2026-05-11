import type { CommunityComment } from '@/domain';
import type { ScanRecord } from '@/store/scanHistoryStore';
import { todayKey } from '@/lib/dailyReset';
import { buildRealCommunityFeed, type CommunityFeedPost } from './realFeed';

export function promisedPostIdsForDay(
  activeChallenges: readonly string[],
  completedChallenges: readonly string[],
  day: string = todayKey()
): string[] {
  return [...activeChallenges, ...completedChallenges]
    .filter((id) => id.startsWith('feed-') && id.endsWith(`-${day}`))
    .map((id) => id.slice('feed-'.length, -`-${day}`.length));
}

export function commentCountsByPost(comments: readonly CommunityComment[]): Record<string, number> {
  return comments.reduce<Record<string, number>>((acc, comment) => {
    acc[comment.postId] = (acc[comment.postId] ?? 0) + 1;
    return acc;
  }, {});
}

export function buildLocalCommunityFeed(input: {
  history: readonly ScanRecord[];
  visitedPointIds: readonly string[];
  likedPostIds: readonly string[];
  activeChallenges: readonly string[];
  completedChallenges: readonly string[];
  comments: readonly CommunityComment[];
  viewerName: string;
}): CommunityFeedPost[] {
  return buildRealCommunityFeed({
    scans: input.history,
    visitedPointIds: input.visitedPointIds,
    likedPostIds: input.likedPostIds,
    promisedPostIds: promisedPostIdsForDay(input.activeChallenges, input.completedChallenges),
    commentCounts: commentCountsByPost(input.comments),
    viewerName: input.viewerName,
  });
}
