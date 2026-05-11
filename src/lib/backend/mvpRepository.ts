import type {
  CommunityFeedItem,
  EcoPulseEvent,
  ImpactEntry,
  ScanResult,
} from '@/domain';
import { buildRealServerCommunityFeed } from '@/lib/community/realFeed';

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
  };
  return globalForMvp.__ecopulseMvpStore;
}

export async function saveEvent(event: EcoPulseEvent): Promise<EcoPulseEvent> {
  const s = store();
  s.events = [event, ...s.events.filter((item) => item.id !== event.id)].slice(0, 500);
  await persistToSupabase('events', event);
  return event;
}

export function listEvents(userId = 'local-user'): EcoPulseEvent[] {
  return store().events.filter((event) => event.userId === userId || event.userId === 'local-user');
}

export async function saveScan(scan: ScanResult): Promise<ScanResult> {
  const s = store();
  s.scans = [scan, ...s.scans.filter((item) => item.id !== scan.id)].slice(0, 200);
  await persistToSupabase('scan_results', scan);
  return scan;
}

export function listScans(): ScanResult[] {
  return store().scans;
}

export async function saveImpactEntry(entry: ImpactEntry): Promise<ImpactEntry> {
  const s = store();
  s.impactEntries = [entry, ...s.impactEntries.filter((item) => item.id !== entry.id)].slice(0, 500);
  await persistToSupabase('impact_entries', entry);
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
  await persistToSupabase('community_reactions', reaction);
  return reaction;
}

export function buildServerCommunityFeed(userId = 'local-user'): CommunityFeedItem[] {
  const s = store();
  const reactions = s.communityReactions.filter((item) => item.userId === userId || item.userId === 'local-user');
  const activeLikes = new Set(reactions.filter((item) => item.reaction === 'like' && item.active).map((item) => item.postId));
  const activePromises = new Set(reactions.filter((item) => item.reaction === 'promise' && item.active).map((item) => item.postId));
  const visitedPointIds = s.events
    .filter(isMapVisitEvent)
    .map((event) => event.payload.pointId);

  return buildRealServerCommunityFeed({
    scans: s.scans,
    visitedPointIds,
    likedPostIds: [...activeLikes],
    promisedPostIds: [...activePromises],
  }).map((post) => ({
    id: post.id,
    actorName: post.user.name,
    actorAvatar: post.user.avatar,
    caption: post.caption,
    imageKey: post.imageKey,
    createdAt: post.time,
    likes: post.effectiveLikes,
    comments: post.comments,
    viewerLiked: post.viewerLiked,
    viewerPromised: post.viewerPromised,
    source: post.source,
  }));
}

function isMapVisitEvent(event: EcoPulseEvent): event is EcoPulseEvent<'map_visit_marked'> {
  return event.type === 'map_visit_marked';
}

async function persistToSupabase(table: string, row: unknown): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;

  try {
    await fetch(`${url.replace(/\/$/, '')}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: key,
        authorization: `Bearer ${key}`,
        'content-type': 'application/json',
        prefer: 'return=minimal',
      },
      body: JSON.stringify(row),
    });
  } catch {
    // The MVP must stay navigable even when Supabase is not configured yet.
  }
}
