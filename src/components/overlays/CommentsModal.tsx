'use client';

import { FEED_POSTS } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { Modal } from './Modal';

interface Props {
  id: string;
}

export function CommentsModal({ id }: Props) {
  const post = FEED_POSTS.find((p) => p.id === id);
  const closeModal = useUIStore((s) => s.closeModal);
  if (!post) return null;

  return (
    <Modal onClose={closeModal}>
      <h3 className="mb-4 text-base font-semibold">Comentários</h3>
      <div className="space-y-3">
        {post.commentList.map((c, i) => (
          <div key={i} className="flex gap-2.5 rounded-[18px] bg-bg-tertiary p-3">
            <span className="text-2xl leading-none">{c.avatar}</span>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-bold">{c.user}</span>
                <span className="text-[0.68rem] text-text-secondary">{c.time}</span>
              </div>
              <p className="mt-0.5 text-sm">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
