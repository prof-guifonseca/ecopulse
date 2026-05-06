'use client';

import Image from 'next/image';
import { Heart, MessageCircle } from 'lucide-react';
import type { FEED_POSTS } from '@/data';
import { useLikePost } from '@/hooks/useLikePost';
import { unsplashUrl, type UnsplashKey } from '@/lib/unsplash';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';

interface Props {
  post: (typeof FEED_POSTS)[number];
  onOpenComments: () => void;
}

export function FeedPostCard({ post, onOpenComments }: Props) {
  const { liked, toggle } = useLikePost(post.id);
  const likeCount = post.likes + (liked ? 1 : 0);
  const firstComment = post.commentList[0];

  return (
    <Card tone="solid" padded={false} className="overflow-hidden">
      {/* Photo only — caption sits below in clean text, not floating overlay */}
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={unsplashUrl(post.imageKey as UnsplashKey, { w: 900, h: 1125 })}
          alt={post.caption}
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

        <div className="flex items-center gap-2">
          <Chip
            active={liked}
            onClick={toggle}
            leftIcon={<Icon icon={Heart} size={14} fill={liked ? 'currentColor' : 'none'} />}
            className={cn(liked && 'text-[var(--accent-red)]')}
          >
            {likeCount}
          </Chip>
          <Chip onClick={onOpenComments} leftIcon={<Icon icon={MessageCircle} size={14} />}>
            {post.comments}
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
            {post.comments > 1 ? (
              <p className="t-caption mt-0.5">Ver comentários</p>
            ) : null}
          </button>
        ) : null}
      </div>
    </Card>
  );
}
