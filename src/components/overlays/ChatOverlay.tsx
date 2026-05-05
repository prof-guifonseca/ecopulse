'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CONVERSATIONS, CHAT_REPLIES } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useSocialStore } from '@/store/socialStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { cn } from '@/lib/cn';
import type { ChatMessage } from '@/types';

export function ChatListOverlay() {
  const close = useUIStore((s) => s.closeChatList);
  const openChat = useUIStore((s) => s.openChat);

  return (
    <div className="animate-fade-in fixed inset-0 z-[600] flex justify-center bg-[rgba(5,10,8,0.92)]">
      <div className="flex h-full w-full max-w-[var(--shell-width)] flex-col bg-[var(--bg-primary)]">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--line-soft)] bg-[var(--glass-bg)] px-4 py-[calc(env(safe-area-inset-top,0px)+12px)] pb-4 backdrop-blur-md">
          <button
            onClick={close}
            aria-label="Voltar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--tint-3)] hover:text-[var(--text-primary)]"
          >
            <Icon icon={ArrowLeft} size={18} />
          </button>
          <div className="min-w-0">
            <div className="t-eyebrow">Mensagens</div>
            <h2 className="t-title truncate">Conversas da comunidade</h2>
          </div>
        </header>
        <ul className="flex-1 overflow-y-auto px-3 py-3">
          {CONVERSATIONS.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => openChat(c.id)}
                className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left transition-colors hover:bg-[var(--tint-2)]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--tint-2)] text-2xl">
                  {c.with.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="t-title truncate">{c.with.name}</span>
                    <span className="t-caption shrink-0">{c.lastTime}</span>
                  </div>
                  <p className="t-body-sm truncate">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <span className="gradient-primary t-micro flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 font-bold text-[var(--on-primary)]">
                    {c.unread}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function ChatConversationOverlay({ id }: { id: string }) {
  const conv = CONVERSATIONS.find((c) => c.id === id);
  const close = useUIStore((s) => s.closeChat);
  const markSent = useSocialStore((s) => s.markChatSent);
  const chatSentFirst = useSocialStore((s) => s.chatSentFirst);
  const [messages, setMessages] = useState<ChatMessage[]>(conv?.messages ?? []);

  if (!conv) return null;

  const send = (text: string) => {
    const next: ChatMessage = { from: 'me', text, time: 'agora', sent: true };
    setMessages((m) => [...m, next]);
    awardTokens(2);
    if (!chatSentFirst) {
      markSent();
      unlockBadge('chat-first');
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-[650] flex justify-center bg-[rgba(5,10,8,0.94)]">
      <div className="flex h-full w-full max-w-[var(--shell-width)] flex-col bg-[var(--bg-primary)]">
        <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--line-soft)] bg-[var(--glass-bg)] px-4 py-[calc(env(safe-area-inset-top,0px)+12px)] pb-4 backdrop-blur-md">
          <button
            onClick={close}
            aria-label="Voltar"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[var(--text-secondary)] transition-colors hover:bg-[var(--tint-3)] hover:text-[var(--text-primary)]"
          >
            <Icon icon={ArrowLeft} size={18} />
          </button>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-[var(--tint-2)] text-2xl">
            {conv.with.avatar}
          </span>
          <div className="min-w-0">
            <div className="t-title truncate">{conv.with.name}</div>
            <div className="t-caption">Nível {conv.with.level}</div>
          </div>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {messages.map((m, i) => (
            <div key={i} className={m.sent ? 'flex justify-end' : 'flex'}>
              <div
                className={cn(
                  't-body max-w-[78%] rounded-[var(--radius-md)] px-4 py-3',
                  m.sent
                    ? 'gradient-primary text-[var(--on-primary)]'
                    : 'bg-[var(--tint-2)] text-[var(--text-primary)]'
                )}
              >
                {m.text}
                <div className="t-micro mt-1 opacity-70">{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--line-soft)] bg-[var(--glass-bg)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-4 backdrop-blur-md">
          <p className="t-eyebrow mb-2">Respostas rápidas</p>
          <div className="flex flex-wrap gap-2">
            {CHAT_REPLIES.slice(0, 5).map((r) => (
              <Chip key={r} onClick={() => send(r)}>
                {r}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
