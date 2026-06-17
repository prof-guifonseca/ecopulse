'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useScanHistoryStore } from '@/store/scanHistoryStore';
import { useSocialStore } from '@/store/socialStore';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
import { buildLocalCommunityFeed } from '@/lib/community/localFeed';
import { syncCommunityComment } from '@/lib/client/mvpSync';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ModalShell } from './ModalShell';

interface Props {
  id: string;
}

export function CommentsModal({ id }: Props) {
  const closeModal = useUIStore((s) => s.closeModal);
  const history = useScanHistoryStore((s) => s.history);
  const likedPostIds = useSocialStore((s) => s.likedPosts);
  const comments = useSocialStore((s) => s.comments);
  const addComment = useSocialStore((s) => s.addComment);
  const viewerName = useUserStore((s) => s.name);
  const visitedPointIds = useGameStore((s) => s.visitedPoints);
  const activeChallenges = useGameStore((s) => s.activeChallenges);
  const completedChallenges = useGameStore((s) => s.completedChallenges);
  const [text, setText] = useState('');

  const feed = useMemo(
    () =>
      buildLocalCommunityFeed({
        history,
        visitedPointIds,
        likedPostIds,
        activeChallenges,
        completedChallenges,
        comments,
        viewerName,
      }),
    [
      activeChallenges,
      comments,
      completedChallenges,
      history,
      likedPostIds,
      viewerName,
      visitedPointIds,
    ],
  );
  const post = feed.find((item) => item.id === id);
  const postComments = comments.filter((comment) => comment.postId === id);

  if (!post) return null;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = text.trim();
    if (value.length < 2) return;
    const comment = addComment({
      postId: id,
      text: value,
      userName: viewerName || 'Você',
      userAvatar: '🌱',
    });
    syncCommunityComment({
      postId: id,
      text: comment.text,
      userName: comment.userName,
      userAvatar: comment.userAvatar,
      userId: comment.userId,
    });
    setText('');
  };

  return (
    <ModalShell eyebrow={post.sourceLabel} title="Comentários" onClose={closeModal}>
      <div className="space-y-4">
        <p className="t-body-sm text-[var(--text-secondary)]">{post.caption}</p>

        <div className="space-y-2">
          {postComments.length > 0 ? (
            postComments.map((comment) => (
              <div
                key={comment.id}
                className="border-soft bg-tint-1 flex gap-3 rounded-[var(--radius-md)] px-3 py-3"
              >
                <span className="text-xl leading-none">{comment.userAvatar}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="t-title truncate">{comment.userName}</span>
                    <span className="t-caption shrink-0">{relativeTime(comment.createdAt)}</span>
                  </div>
                  <p className="t-body-sm mt-0.5">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="border-soft bg-tint-1 rounded-[var(--radius-md)] px-4 py-5 text-center">
              <Icon icon={MessageCircle} size={18} className="mx-auto text-[var(--text-muted)]" />
              <p className="t-body-sm mt-2">Nenhum comentário ainda.</p>
              <p className="t-caption mt-1">
                Abra a conversa com uma observação real sobre este item.
              </p>
            </div>
          )}
        </div>

        <form className="flex gap-2" onSubmit={submit}>
          <label className="sr-only" htmlFor="community-comment-input">
            Novo comentário
          </label>
          <input
            id="community-comment-input"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={500}
            className="border-soft bg-tint-1 min-w-0 flex-1 rounded-[var(--radius-sm)] px-3 text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--line-active)]"
            placeholder="Escreva um comentário"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={text.trim().length < 2}
            leftIcon={<Icon icon={Send} size={14} />}
          >
            Enviar
          </Button>
        </form>
      </div>
    </ModalShell>
  );
}

function relativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'agora';
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
  if (minutes < 2) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.round(hours / 24)}d`;
}
