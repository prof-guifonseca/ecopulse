'use client';

import { Clock, MapPin, Ruler } from 'lucide-react';
import { MAP_POINTS, MAP_DETAIL_LABELS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { ModalShell } from './ModalShell';
import type { LucideIcon } from 'lucide-react';

interface Props {
  id: string;
}

export function MapPointModal({ id }: Props) {
  const point = MAP_POINTS.find((p) => p.id === id);
  const closeModal = useUIStore((s) => s.closeModal);
  const visited = useGameStore((s) => s.visitedPoints.includes(id));
  const addVisited = useGameStore((s) => s.addVisitedPoint);
  const showToast = useUIStore((s) => s.showToast);

  if (!point) return null;

  const visit = () => {
    addVisited(id);
    awardTokens(10);
    const { visitedPoints, dailyMissions, markMission } = useGameStore.getState();
    if (!dailyMissions.map) {
      markMission('map', true);
      showToast('Missão diária: visitar Mapa concluída', 'success');
    } else {
      showToast('+10 Eco-Tokens', 'reward');
    }
    if (visitedPoints.length >= 3) unlockBadge('map-explorer');
    closeModal();
  };

  return (
    <ModalShell eyebrow={MAP_DETAIL_LABELS[point.type]} title={point.name}>
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-[14px] border border-[var(--line-soft)] bg-white/[0.04] text-3xl">
            {point.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[0.78rem] text-text-muted">{point.address}</div>
          </div>
        </div>

        <div className="mt-5 divide-y divide-[var(--line-soft)] rounded-[var(--radius-md)] border border-[var(--line-soft)] bg-white/[0.02]">
          <Row icon={MapPin} label="Endereço" value={point.address} />
          <Row icon={Clock} label="Horário" value={point.hours} />
          <Row icon={Ruler} label="Distância" value={point.distance} />
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5"
          onClick={visit}
          disabled={visited}
          leftIcon={<Icon icon={MapPin} size={16} />}
        >
          {visited ? 'Já visitado' : 'Marcar como visitado · +10 Tokens'}
        </Button>
      </div>
    </ModalShell>
  );
}

function Row({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="inline-flex items-center gap-2 text-text-muted">
        <Icon icon={icon} size={14} />
        <span className="text-[0.78rem]">{label}</span>
      </span>
      <span className="truncate text-right text-[0.88rem] font-medium text-text-primary">{value}</span>
    </div>
  );
}
