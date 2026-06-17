'use client';

import { useRef, useState } from 'react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { Avatar } from '@/components/shared/Avatar';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconButton } from '@/components/ui/IconButton';

interface Props {
  avatarBase: string;
  onSubmit: (name: string) => void;
  onBack: () => void;
}

export function OnboardingStepName({ avatarBase, onSubmit, onBack }: Props) {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = name.trim();
  const canSubmit = trimmed.length >= 1;

  const handleSubmit = () => {
    if (!canSubmit) {
      inputRef.current?.focus();
      return;
    }
    onSubmit(trimmed);
  };

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(circle at 50% 24%, color-mix(in srgb, var(--accent-green) 16%, transparent) 0%, transparent 55%)',
        }}
      />

      <header className="relative flex items-center justify-between">
        <IconButton
          onClick={onBack}
          aria-label="Voltar"
          size="sm"
          variant="soft"
          icon={<Icon icon={ChevronLeft} size={18} />}
        />
        <p className="t-eyebrow">Quase lá</p>
        <span className="h-9 w-9" aria-hidden />
      </header>

      <main className="animate-fade-in relative flex flex-1 flex-col items-start justify-center gap-7">
        <div className="border-soft bg-tint-1 flex h-32 w-32 items-center justify-center rounded-full shadow-[var(--shadow-glow)]">
          <Avatar baseId={avatarBase} size="xl" />
        </div>

        <div className="space-y-3">
          <h1 className="t-display">Crie seu perfil.</h1>
          <p className="t-body max-w-[26ch] text-[var(--text-secondary)]">
            Depois do primeiro scan, o app libera missões, impacto e comunidade.
          </p>
        </div>

        <form
          className="w-full"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="input-shell flex items-center gap-3 px-4 py-3">
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={name}
              maxLength={24}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu primeiro nome"
              aria-label="Seu primeiro nome"
              className="t-body w-full bg-transparent outline-none placeholder:text-[var(--text-muted)]"
              autoComplete="given-name"
            />
          </div>
        </form>
      </main>

      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={handleSubmit}
        disabled={!canSubmit}
        rightIcon={<Icon icon={ArrowRight} size={16} />}
        className="relative"
      >
        Começar
      </Button>
    </>
  );
}
