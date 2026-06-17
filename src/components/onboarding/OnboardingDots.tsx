'use client';

interface Props {
  total: number;
  current: number;
}

export function OnboardingDots({ total, current }: Props) {
  return (
    <div className="flex items-center justify-center gap-2" aria-hidden>
      {Array.from({ length: total }).map((_, i) => {
        const active = i === current;
        return (
          <span
            key={i}
            className="h-1.5 rounded-full transition-all duration-300"
            style={{
              width: active ? 22 : 6,
              background: active ? 'var(--primary)' : 'var(--input)',
              opacity: active ? 1 : 0.7,
            }}
          />
        );
      })}
    </div>
  );
}
