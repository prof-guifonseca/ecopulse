'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { CONVERSATIONS, CHAT_REPLIES } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useSocialStore } from '@/store/socialStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Icon } from '@/components/ui/Icon';
import type { ChatMessage } from '@/types';

export function ChatListOverlay() {
  const close = useUIStore((s) => s.closeChatList);
  const openChat = useUIStore((s) => s.openChat);

  return (
    <div
      className="fixed inset-0 z-[600] flex justify-center bg-[rgba(5,10,8,0.92)]"
      style={{ animation: 'fadeIn 0.3s ease' }}
    >
      <div
        className="flex h-full w-full max-w-[var(--shell-width)] flex-col"
        style={{ background: 'var(--bg-primary)' }}
      >
        <header
          className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--line-soft)] px-4 py-[calc(env(safe-area-inset-top,0px)+12px)] pb-4"
          style={{ background: 'rgba(10,18,13,0.94)', backdropFilter: 'blur(14px)' }}
        >
          <button
            onClick={close}
            aria-label="Voltar"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/6 hover:text-text-primary"
          >
            <Icon icon={ArrowLeft} size={18} />
          </button>
          <div className="min-w-0">
            <div className="display-eyebrow">Mensagens</div>
            <h2 className="truncate text-[1rem] font-semibold leading-tight text-text-primary">
              Conversas da comunidade
            </h2>
          </div>
        </header>
        <ul className="flex-1 overflow-y-auto px-3 py-3">
          {CONVERSATIONS.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => openChat(c.id)}
                className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-3 text-left transition-colors hover:bg-white/[0.04]"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-white/[0.04] text-2xl">
                  {c.with.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-[0.92rem] font-semibold text-text-primary">
                      {c.with.name}
                    </span>
                    <span className="shrink-0 text-[0.72rem] text-text-muted">{c.lastTime}</span>
                  </div>
                  <p className="truncate text-[0.82rem] text-text-secondary">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <span
                    className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[0.66rem] font-bold"
                    style={{ background: 'var(--gradient-primary)', color: '#0a140e' }}
                  >
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
    <div
      className="fixed inset-0 z-[650] flex justify-center bg-[rgba(5,10,8,0.94)]"
      style={{ animation: 'fadeIn 0.3s ease' }}
    >
      <div
        className="flex h-full w-full max-w-[var(--shell-width)] flex-col"
        style={{ background: 'var(--bg-primary)' }}
      >
        <header
          className="sticky top-0 z-10 flex items-center gap-3 border-b border-[var(--line-soft)] px-4 py-[calc(env(safe-area-inset-top,0px)+12px)] pb-4"
          style={{ background: 'rgba(10,18,13,0.94)', backdropFilter: 'blur(14px)' }}
        >
          <button
            onClick={close}
            aria-label="Voltar"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-white/6 hover:text-text-primary"
          >
            <Icon icon={ArrowLeft} size={18} />
          </button>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--line-soft)] bg-white/[0.04] text-2xl">
            {conv.with.avatar}
          </span>
          <div className="min-w-0">
            <div className="truncate text-[0.92rem] font-semibold text-text-primary">{conv.with.name}</div>
            <div className="text-[0.72rem] text-text-muted">Nível {conv.with.level}</div>
          </div>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
          {messages.map((m, i) => (
            <div key={i} className={m.sent ? 'flex justify-end' : 'flex'}>
              <div
                className="max-w-[78%] rounded-[20px] px-4 py-3 text-[0.88rem] leading-5"
                style={{
                  background: m.sent ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                  color: m.sent ? '#0a140e' : 'var(--text-primary)',
                }}
              >
                {m.text}
                <div className="mt-1 text-[0.66rem] opacity-70">{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div
          className="border-t border-[var(--line-soft)] px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-4"
          style={{ background: 'rgba(10,18,13,0.92)', backdropFilter: 'blur(14px)' }}
        >
          <p className="display-eyebrow mb-2">Respostas rápidas</p>
          <div className="flex flex-wrap gap-2">
            {CHAT_REPLIES.slice(0, 5).map((r) => (
              <button
                key={r}
                onClick={() => send(r)}
                className="rounded-full border border-[var(--line-soft)] bg-white/[0.04] px-3 py-2 text-[0.82rem] font-medium text-text-primary transition-colors hover:bg-white/[0.08]"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
