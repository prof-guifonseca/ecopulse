'use client';

import { CheckCircle2, Clock, MapPin, Phone, Ruler } from 'lucide-react';
import { MAP_POINTS, MAP_DETAIL_LABELS, MAP_TYPE_ICON } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { IconTile } from '@/components/ui/IconTile';
import { ListCard } from '@/components/ui/ListCard';
import { resolveIcon } from '@/lib/iconRegistry';
import { distanceFromCenter } from '@/lib/map/londrina';
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

  const PointIcon = resolveIcon(MAP_TYPE_ICON[point.type]) ?? MapPin;

  const visit = () => {
    addVisited(id);
    awardTokens(10);
    const { visitedPoints, dailyMissions, markMission } = useGameStore.getState();
    if (!dailyMissions.map) {
      markMission('map', true);
      showToast('Missão diária: visitar Mapa concluída', 'success');
    } else {
      showToast('+10 tokens', 'reward');
    }
    if (visitedPoints.length >= 3) unlockBadge('map-explorer');
    closeModal();
  };

  return (
    <ModalShell eyebrow={MAP_DETAIL_LABELS[point.type]} title={point.name}>
      <div>
        <div className="flex items-center gap-3">
          <IconTile size="lg" tone="brand" icon={<Icon icon={PointIcon} size={24} />} />
          <div className="min-w-0 flex-1">
            <div className="t-caption">{point.address}</div>
          </div>
        </div>

        <ListCard as="div" className="mt-5">
          <Row icon={MapPin} label="Endereço" value={point.address} />
          <Row icon={Clock} label="Horário" value={point.hours} />
          <Row
            icon={Ruler}
            label="Distância"
            value={distanceFromCenter({ lat: point.lat, lng: point.lng })}
          />
          {point.phone ? <Row icon={Phone} label="Telefone" value={point.phone} /> : null}
          <Row
            icon={CheckCircle2}
            label="Verificado"
            value={`há ${point.lastVerifiedDays} dia${point.lastVerifiedDays === 1 ? '' : 's'}`}
          />
        </ListCard>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          className="mt-5"
          onClick={visit}
          disabled={visited}
          leftIcon={<Icon icon={MapPin} size={16} />}
        >
          {visited ? 'Visitado' : 'Marcar visita'}
        </Button>
        {!visited ? <p className="t-caption mt-2 text-center">+10 tokens</p> : null}
      </div>
    </ModalShell>
  );
}

function Row({ icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="inline-flex items-center gap-2 text-[var(--text-muted)]">
        <Icon icon={icon} size={14} />
        <span className="t-caption">{label}</span>
      </span>
      <span className="t-body truncate text-right font-medium">{value}</span>
    </div>
  );
}
