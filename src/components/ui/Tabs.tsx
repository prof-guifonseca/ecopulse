'use client';

import { cn } from '@/lib/cn';

interface TabItem<Value extends string> {
  value: Value;
  label: string;
}

interface Props<Value extends string> {
  items: readonly TabItem<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
  fitted?: boolean;
}

export function Tabs<Value extends string>({
  items,
  value,
  onChange,
  className,
  fitted = true,
}: Props<Value>) {
  return (
    <div
      role="tablist"
      className={cn(
        'bg-tint-1 relative flex gap-1 rounded-[var(--radius-md)] border border-[var(--border)] p-1',
        fitted ? 'w-full' : 'inline-flex',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative flex-1 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-semibold transition-colors duration-200',
              active
                ? 'bg-[var(--card)] text-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--text-secondary)]',
            )}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
