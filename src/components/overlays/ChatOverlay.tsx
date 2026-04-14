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
    <div
      className="fixed inset-0 z-[600] flex flex-col bg-bg-primary"
      style={{ animation: 'fadeIn 0.3s ease' }}
    >
      <div className="glass sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3">
        <button onClick={close} className="text-2xl" aria-label="Fechar">←</button>
        <h2 className="font-display text-base font-bold">Mensagens</h2>
      </div>
      <ul className="flex-1 overflow-y-auto px-2 py-3">
        {CONVERSATIONS.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => openChat(c.id)}
              className="flex w-full items-center gap-3 rounded-md p-3 text-left transition-colors hover:bg-bg-tertiary"
            >
              <span className="text-3xl">{c.with.avatar}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{c.with.name}</span>
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
    <div className="fixed inset-0 z-[650] flex flex-col bg-bg-primary" style={{ animation: 'fadeIn 0.3s ease' }}>
      <div className="glass sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3">
        <button onClick={close} className="text-2xl" aria-label="Voltar">←</button>
        <span className="text-2xl">{conv.with.avatar}</span>
        <div>
          <div className="text-sm font-semibold">{conv.with.name}</div>
          <div className="text-[10px] text-text-secondary">Nível {conv.with.level}</div>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.map((m, i) => (
          <div key={i} className={m.sent ? 'flex justify-end' : 'flex'}>
            <div
              className="max-w-[75%] rounded-2xl px-3 py-2 text-sm"
              style={{
                background: m.sent ? 'var(--gradient-primary)' : 'var(--bg-tertiary)',
                color: m.sent ? 'var(--bg-primary)' : 'var(--text-primary)',
              }}
            >
              {m.text}
              <div className="mt-0.5 text-[10px] opacity-70">{m.time}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-white/5 p-3">
        <p className="mb-2 text-[11px] text-text-secondary">Respostas rápidas:</p>
        <div className="flex flex-wrap gap-1.5">
          {CHAT_REPLIES.slice(0, 5).map((r) => (
            <button
              key={r}
              onClick={() => send(r)}
              className="rounded-full bg-bg-tertiary px-3 py-1.5 text-xs transition-colors hover:bg-[rgba(255,255,255,0.1)]"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
