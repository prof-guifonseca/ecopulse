'use client';

import { useState } from 'react';
import { CONVERSATIONS, CHAT_REPLIES } from '@/data';
import { useUIStore } from '@/store/uiStore';
import { useSocialStore } from '@/store/socialStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import type { ChatMessage } from '@/types';

export function ChatListOverlay() {
  const close = useUIStore((s) => s.closeChatList);
  const openChat = useUIStore((s) => s.openChat);

  return (
    <div className="fixed inset-0 z-[600] flex justify-center bg-[rgba(5,10,8,0.92)]" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="flex h-full w-full max-w-[var(--shell-width)] flex-col bg-[linear-gradient(180deg,#0a120d_0%,#111a14_100%)]">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/6 bg-[rgba(10,18,13,0.94)] px-4 py-[calc(env(safe-area-inset-top,0px)+12px)] pb-4">
          <button onClick={close} className="text-2xl" aria-label="Fechar">
            ←
          </button>
          <div>
            <div className="hud-label">Mensagens</div>
            <h2 className="text-base font-semibold text-text-primary">Conversas da comunidade</h2>
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto px-3 py-4">
          {CONVERSATIONS.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => openChat(c.id)}
                className="flex w-full items-center gap-3 rounded-[22px] px-3 py-3 text-left transition-colors hover:bg-white/4"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/6 text-3xl">
                  {c.with.avatar}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-text-primary">{c.with.name}</span>
                    <span className="text-[10px] text-text-secondary">{c.lastTime}</span>
                  </div>
                  <p className="truncate text-xs text-text-secondary">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-green px-1.5 text-[10px] font-bold text-bg-primary">
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
    <div className="fixed inset-0 z-[650] flex justify-center bg-[rgba(5,10,8,0.94)]" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="flex h-full w-full max-w-[var(--shell-width)] flex-col bg-[linear-gradient(180deg,#0a120d_0%,#111a14_100%)]">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-white/6 bg-[rgba(10,18,13,0.94)] px-4 py-[calc(env(safe-area-inset-top,0px)+12px)] pb-4">
          <button onClick={close} className="text-2xl" aria-label="Voltar">
            ←
          </button>
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/6 text-2xl">
            {conv.with.avatar}
          </span>
          <div>
            <div className="text-sm font-semibold text-text-primary">{conv.with.name}</div>
            <div className="text-[11px] text-text-secondary">Nível {conv.with.level}</div>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {messages.map((m, i) => (
            <div key={i} className={m.sent ? 'flex justify-end' : 'flex'}>
              <div
                className="max-w-[78%] rounded-[22px] px-4 py-3 text-sm"
                style={{
                  background: m.sent ? 'var(--gradient-primary)' : 'rgba(255,255,255,0.05)',
                  color: m.sent ? 'var(--bg-primary)' : 'var(--text-primary)',
                }}
              >
                {m.text}
                <div className="mt-1 text-[10px] opacity-70">{m.time}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/6 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+18px)] pt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-muted">
            Respostas rápidas
          </p>
          <div className="flex flex-wrap gap-2">
            {CHAT_REPLIES.slice(0, 5).map((r) => (
              <button
                key={r}
                onClick={() => send(r)}
                className="rounded-full bg-white/6 px-3 py-2 text-xs font-medium text-text-primary"
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
