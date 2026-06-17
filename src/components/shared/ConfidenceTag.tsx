import { BadgeCheck, CircleDashed } from 'lucide-react';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

export type Confidence = 'estimated' | 'verified';

/**
 * Selo de honestidade: distingue uma métrica **verificada** (ação que o usuário
 * registrou de fato no app) de uma **estimada** (magnitude derivada de
 * evidências/metodologia local). Espelha o contrato `ImpactEntry.confidence`.
 */
export function ConfidenceTag({ kind, className }: { kind: Confidence; className?: string }) {
  const verified = kind === 'verified';
  return (
    <span
      className={cn(
        't-micro inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold',
        verified
          ? 'bg-tint-green-2 text-[var(--primary)]'
          : 'bg-tint-1 text-[var(--muted-foreground)]',
        className,
      )}
      title={
        verified
          ? 'Ação registrada por você no app'
          : 'Estimativa derivada de evidências e metodologia local'
      }
    >
      <Icon icon={verified ? BadgeCheck : CircleDashed} size={11} strokeWidth={2.2} />
      {verified ? 'Verificado' : 'Estimado'}
    </span>
  );
}
