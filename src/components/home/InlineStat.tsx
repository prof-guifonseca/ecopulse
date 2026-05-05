import type { LucideIcon } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';

export function InlineStat({ icon, value, label }: { icon: LucideIcon; value: number | string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 t-body-sm">
      <Icon icon={icon} size={13} className="translate-y-[1px] text-[var(--accent-green)]" />
      <span className="font-semibold text-[var(--text-primary)]">{value}</span>
      <span className="t-caption">{label}</span>
    </span>
  );
}
