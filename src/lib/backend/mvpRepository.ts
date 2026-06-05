import type {
  CommunityComment,
  CommunityFeedItem,
  EcoPulseEvent,
  ImpactEntry,
  ScanResult,
} from '@/domain';
import { buildRealServerCommunityFeed } from '@/lib/community/realFeed';
import { persistRow } from './supabaseRest';

interface CommunityReaction {
  postId: string;
  reaction: 'like' | 'promise';
  active: boolean;
  userId: string;
  updatedAt: string;
}

interface MvpStore {
  events: EcoPulseEvent[];
  scans: ScanResult[];
  impactEntries: ImpactEntry[];
  communityReactions: CommunityReaction[];
  communityComments: CommunityComment[];
}

const globalForMvp = globalThis as typeof globalThis & {
  __ecopulseMvpStore?: MvpStore;
};

function store(): MvpStore {
  globalForMvp.__ecopulseMvpStore ??= {
    events: [],
    scans: [],
    impactEntries: [],
    communityReactions: [],
    communityComments: [],
  };
  globalForMvp.__ecopulseMvpStore.communityComments ??= [];
  return globalForMvp.__ecopulseMvpStore;
}

export async function saveEvent(event: EcoPulseEvent): Promise<EcoPulseEvent> {
  const s = store();
  s.events = [event, ...s.events.filter((item) => item.id !== event.id)].slice(0, 500);
  await persistRow('events', event);
  return event;
}

export function listEvents(userId = 'local-user'): EcoPulseEvent[] {
  return store().events.filter((event) => event.userId === userId || event.userId === 'local-user');
}

export async function saveScan(scan: ScanResult): Promise<ScanResult> {
  const s = store();
  s.scans = [scan, ...s.scans.filter((item) => item.id !== scan.id)].slice(0, 200);
  await persistRow('scan_results', scan);
  return scan;
}

export function listScans(): ScanResult[] {
  return store().scans;
}

export async function saveImpactEntry(entry: ImpactEntry): Promise<ImpactEntry> {
  const s = store();
  s.impactEntries = [entry, ...s.impactEntries.filter((item) => item.id !== entry.id)].slice(0, 500);
  await persistRow('impact_entries', entry);
  return entry;
}

export function listImpactEntries(): ImpactEntry[] {
  return store().impactEntries;
}

export async function recordCommunityReaction(reaction: CommunityReaction): Promise<CommunityReaction> {
  const s = store();
  s.communityReactions = [
    reaction,
    ...s.communityReactions.filter(
      (item) =>
        !(item.userId === reaction.userId && item.postId === reaction.postId && item.reaction === reaction.reaction)
    ),
  ].slice(0, 1000);
  await persistRow('community_reactions', reaction);
  return reaction;
}

export function buildServerCommunityFeed(userId = 'local-user'): CommunityFeedItem[] {
  const s = store();
  const reactions = s.communityReactions.filter((item) => item.userId === userId || item.userId === 'local-user');
  const activeLikes = new Set(reactions.filter((item) => item.reaction === 'like' && item.active).map((item) => item.postId));
  const activePromises = new Set(reactions.filter((item) => item.reaction === 'promise' && item.active).map((item) => item.postId));
  const commentCounts = s.communityComments.reduce<Record<string, number>>((acc, comment) => {
    acc[comment.postId] = (acc[comment.postId] ?? 0) + 1;
    return acc;
  }, {});
  const visitedPointIds = s.events
    .filter(isMapVisitEvent)
    .map((event) => event.payload.pointId);

  return buildRealServerCommunityFeed({
    scans: s.scans,
    visitedPointIds,
    likedPostIds: [...activeLikes],
    promisedPostIds: [...activePromises],
    commentCounts,
  }).map((post) => ({
    id: post.id,
    actorName: post.user.name,
    actorAvatar: post.user.avatar,
    caption: post.caption,
    imageKey: post.imageKey,
    createdAt: post.time,
    likes: post.effectiveLikes,
    comments: post.commentCount,
    commentCount: post.commentCount,
    viewerLiked: post.viewerLiked,
    viewerPromised: post.viewerPromised,
    source: post.source,
    sourceLabel: post.sourceLabel,
    sourceUrl: post.sourceUrl,
  }));
}

export async function saveCommunityComment(comment: CommunityComment): Promise<CommunityComment> {
  const s = store();
  s.communityComments = [comment, ...s.communityComments.filter((item) => item.id !== comment.id)].slice(0, 1000);
  await persistRow('community_comments', comment);
  return comment;
}

export function listCommunityComments(postId: string): CommunityComment[] {
  return store()
    .communityComments
    .filter((comment) => comment.postId === postId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

function isMapVisitEvent(event: EcoPulseEvent): event is EcoPulseEvent<'map_visit_marked'> {
  return event.type === 'map_visit_marked';
}
