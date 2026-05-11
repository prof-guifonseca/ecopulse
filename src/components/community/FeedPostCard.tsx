'use client';

import Image from 'next/image';
import { Heart, MessageCircle, CheckCircle2, Sparkles } from 'lucide-react';
import { communityFeedImage } from '@/data';
import type { CommunityFeedPost } from '@/lib/community/realFeed';
import { useLikePost } from '@/hooks/useLikePost';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { todayKey } from '@/lib/dailyReset';
import { syncCommunityReaction } from '@/lib/client/mvpSync';

interface Props {
  post: CommunityFeedPost;
  onOpenComments: () => void;
}

export function FeedPostCard({ post, onOpenComments }: Props) {
  const { liked: locallyLiked, toggle } = useLikePost(post.id);
  const liked = post.viewerLiked || locallyLiked;
  const likeCount = post.effectiveLikes;
  const commentCount = post.commentCount ?? post.comments;
  const firstComment = post.commentList[0];
  const image = communityFeedImage(post.imageKey);

  // "Vou tentar isso" creates a one-day micro-challenge keyed by post + day,
  // and bumps the social-replicate mission counter when applicable.
  const synthChallengeId = `feed-${post.id}-${todayKey()}`;
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const tried = post.viewerPromised || activeChallenges.includes(synthChallengeId) || completedChallenges.includes(synthChallengeId);
  const showToast = useUIStore((s) => s.showToast);

  const tryThis = () => {
    if (tried) return;
    const game = useGameStore.getState();
    game.joinChallenge(synthChallengeId);
    game.incrementLikeMission();
    syncCommunityReaction(post.id, 'promise', true);
    showToast('Promessa registrada', 'success');
  };

  return (
    <Card tone="solid" padded={false} className="overflow-hidden">
      {/* Image only — caption sits below in clean text, not floating overlay */}
      <div className="relative aspect-square w-full overflow-hidden">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(max-width: 430px) 100vw, 430px"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 to-transparent" />
        <div className="absolute left-4 top-4 right-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-black/40 text-lg backdrop-blur-md">
            {post.user.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <div className="t-title leading-tight text-white drop-shadow-md">{post.user.name}</div>
            <div className="t-caption text-white/80">
              Nv {post.user.level} · {post.time}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <p className="t-body">{post.caption}</p>
        <p className="t-micro text-[var(--text-muted)]">
          Fonte: {post.sourceUrl ? (
            <a href={post.sourceUrl} target="_blank" rel="noreferrer" className="underline decoration-dotted underline-offset-2">
              {post.sourceLabel}
            </a>
          ) : (
            post.sourceLabel
          )}
        </p>

        <div className="flex items-center gap-2">
          <Chip
            active={liked}
            onClick={toggle}
            leftIcon={<Icon icon={Heart} size={14} fill={liked ? 'currentColor' : 'none'} />}
            className={cn(liked && 'text-[var(--accent-red)]')}
          >
            {likeCount}
          </Chip>
          <Chip
            onClick={onOpenComments}
            aria-label={`Comentários (${commentCount})`}
            leftIcon={<Icon icon={MessageCircle} size={14} />}
          >
            {commentCount}
          </Chip>
          <Chip
            active={tried}
            onClick={tryThis}
            leftIcon={<Icon icon={tried ? CheckCircle2 : Sparkles} size={14} />}
          >
            {tried ? 'Vou tentar' : 'Vou tentar isso'}
          </Chip>
        </div>

        {firstComment ? (
          <button
            onClick={onOpenComments}
            className="-mx-1 block w-full text-left rounded-md px-1 py-1 transition-colors hover:bg-tint-1"
          >
            <p className="t-body-sm">
              <span className="font-semibold text-[var(--text-primary)]">{firstComment.user}</span>{' '}
              <span className="text-[var(--text-secondary)]">{firstComment.text}</span>
            </p>
            {commentCount > 1 ? (
              <p className="t-caption mt-0.5">Ver comentários</p>
            ) : null}
          </button>
        ) : null}
      </div>
    </Card>
  );
}
