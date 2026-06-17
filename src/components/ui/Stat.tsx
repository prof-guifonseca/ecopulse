import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

type Layout = 'inline' | 'block';

interface Props {
  value: ReactNode;
  label: ReactNode;
  icon?: LucideIcon;
  layout?: Layout;
  className?: string;
}

/**
 * Stat — single source of truth for label/value pairs. Replaces
 * home/InlineStat (inline ribbon-style) and profile/Stat (block stack).
 *
 *  layout="inline"  →  <Icon> 12 tokens   (one line, t-body-sm)
 *  layout="block"   →  12                 (stacked, t-headline)
 *                       Tokens
 */
export function Stat({ value, label, icon, layout = 'block', className }: Props) {
  if (layout === 'inline') {
    return (
      <span className={cn('t-body-sm inline-flex items-baseline gap-1.5', className)}>
        {icon ? (
          <Icon icon={icon} size={13} className="translate-y-[1px] text-[var(--primary)]" />
        ) : null}
        <span className="font-semibold text-[var(--foreground)]">{value}</span>
        <span className="t-caption">{label}</span>
      </span>
    );
  }

  return (
    <div className={className}>
      <div className="text-base leading-none font-bold text-[var(--foreground)]">{value}</div>
      <div className="t-caption mt-1">{label}</div>
    </div>
  );
}
