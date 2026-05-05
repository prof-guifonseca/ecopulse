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
            className="flex gap-3 rounded-[var(--radius-md)] border-soft bg-tint-1 px-3 py-3"
          >
            <span className="text-xl leading-none">{c.avatar}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <span className="t-title truncate">{c.user}</span>
                <span className="t-caption shrink-0">{c.time}</span>
              </div>
              <p className="t-body-sm mt-0.5">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}
