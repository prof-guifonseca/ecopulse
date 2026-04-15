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

export function Tabs<Value extends string>({ items, value, onChange, className, fitted = true }: Props<Value>) {
  return (
    <div
      role="tablist"
      className={cn(
        'relative flex gap-1 border-b border-[var(--line-soft)]',
        fitted ? 'w-full' : 'inline-flex',
        className
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
              'relative flex-1 px-3 py-3 text-sm font-semibold transition-colors duration-200',
              active ? 'text-text-primary' : 'text-text-muted hover:text-text-secondary'
            )}
          >
            {item.label}
            <span
              aria-hidden
              className={cn(
                'pointer-events-none absolute -bottom-px left-4 right-4 h-[2px] rounded-full transition-opacity duration-200',
                active ? 'opacity-100' : 'opacity-0'
              )}
              style={{ background: 'var(--gradient-primary)' }}
            />
          </button>
        );
      })}
    </div>
  );
}
