'use client';

import { FEED_POSTS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { ModalShell } from './ModalShell';

interface Props {
  id: string;
}

export function CommentsModal({ id }: Props) {
  const post = FEED_POSTS.find((p) => p.id === id);
  const closeModal = useUIStore((s) => s.closeModal);
  if (!post) return null;

  return (
    <ModalShell eyebrow="Conversa" title="Comentários" onClose={closeModal}>
      <div className="space-y-2">
        {post.commentList.map((c, i) => (
          <div
            key={i}
            className="flex gap-3 rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02] px-3 py-3"
          >
            <span className="text-xl leading-none">{c.avatar}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="truncate text-[0.85rem] font-semibold text-text-primary">{c.user}</span>
                <span className="shrink-0 text-[0.7rem] text-text-muted">{c.time}</span>
              </div>
              <p className="mt-0.5 text-[0.88rem] leading-5 text-text-secondary">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
