import type { ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

export const tileVariants = cva('rounded-[var(--radius-md)] border', {
  variants: {
    tone: {
      default: 'border-[var(--line-soft)] bg-tint-1',
      brand: 'border-[var(--line-active)] bg-tint-green-1',
      reward:
        'border-[color:color-mix(in_srgb,var(--accent-gold)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--accent-gold)_8%,transparent)]',
    },
    size: {
      sm: 'px-3 py-2.5',
      md: 'px-4 py-3',
    },
    align: {
      center: 'text-center',
      start: 'text-left',
    },
  },
  defaultVariants: { tone: 'default', size: 'md', align: 'center' },
});

const tileValueVariants = cva('mt-1.5 leading-none font-semibold', {
  variants: {
    tone: {
      default: 'text-[var(--text-primary)]',
      brand: 'text-[var(--accent-green)]',
      reward: 'text-[var(--accent-gold)]',
    },
    size: {
      sm: 'text-base',
      md: 'text-lg',
    },
  },
  defaultVariants: { tone: 'default', size: 'md' },
});

interface Props extends VariantProps<typeof tileVariants> {
  label: ReactNode;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

/**
 * Tile — compact inset surface for metrics: label/value, hint, optional icon.
 */
export function Tile({ label, value, hint, icon, tone, size, align = 'center', className }: Props) {
  return (
    <div className={cn(tileVariants({ tone, size, align }), className)}>
      <div className={cn('flex items-center gap-1.5', align === 'center' ? 'justify-center' : '')}>
        {icon ? <span className="text-[var(--accent-green)]">{icon}</span> : null}
        <span className="t-label">{label}</span>
      </div>
      <div className={tileValueVariants({ tone, size })}>{value}</div>
      {hint ? <div className="t-caption mt-1">{hint}</div> : null}
    </div>
  );
}
