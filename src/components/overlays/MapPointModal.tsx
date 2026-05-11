'use client';

import { CheckCircle2, Clock, ExternalLink, MapPin, Phone, Ruler, ShieldCheck } from 'lucide-react';
import {
  ENVIRONMENTAL_CATEGORY_DETAIL_LABELS,
  ENVIRONMENTAL_CATEGORY_ICON,
  ENVIRONMENTAL_SOURCE_LABELS,
  getLocalEnvironmentalPointById,
  getRegisteredEnvironmentalPoint,
  mapPointTypeForEnvironmentalPoint,
  type EnvironmentalPoint,
} from '@/lib/esg';
import { effectiveMapTypes, getMissionTemplate } from '@/data';
import type { TribeId } from '@/data/tribes';
import { useGameStore } from '@/store/gameStore';
import { useSimulationStore } from '@/store/simulationStore';
import { useUIStore } from '@/store/uiStore';
import { useUserStore } from '@/store/userStore';
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
  const point = resolvePoint(id);
  const closeModal = useUIStore((s) => s.closeModal);
  const visited = useGameStore((s) => s.visitedPoints.includes(id));
  const addVisited = useGameStore((s) => s.addVisitedPoint);
  const showToast = useUIStore((s) => s.showToast);
  const recordSimulationEvent = useSimulationStore((s) => s.recordEvent);

  if (!point) return null;

  const PointIcon = resolveIcon(ENVIRONMENTAL_CATEGORY_ICON[point.category]) ?? MapPin;
  const detailLabel = ENVIRONMENTAL_CATEGORY_DETAIL_LABELS[point.category];

  const visit = () => {
    addVisited(id);
    recordSimulationEvent({
      type: 'map_visit_marked',
      payload: {
        pointId: point.id,
        source: point.source,
        category: point.category,
        lat: point.lat,
        lng: point.lng,
        confidence: point.confidence,
      },
    });
    awardTokens(10);

    const game = useGameStore.getState();
    const { dailyMissions, markMission, todaysMissionIds } = game;
    const tribe = (useUserStore.getState().tribe ?? 'guardioes') as TribeId;
    const mapTemplateId = todaysMissionIds.find((mid) => getMissionTemplate(mid)?.slot === 'map');
    const mapTemplate = getMissionTemplate(mapTemplateId);
    const acceptedMapTypes = mapTemplate ? effectiveMapTypes(mapTemplate, tribe) : undefined;
    const pointType = mapPointTypeForEnvironmentalPoint(point);
    const eligible =
      !mapTemplate ||
      !acceptedMapTypes ||
      acceptedMapTypes.length === 0 ||
      (pointType ? acceptedMapTypes.includes(pointType) : false);

    if (eligible && !dailyMissions.map) {
      markMission('map', true);
      showToast('Missão diária: visitar Mapa concluída', 'success');
    } else {
      showToast('+10 tokens', 'reward');
    }
    if (useGameStore.getState().visitedPoints.length >= 3) unlockBadge('map-explorer');
    closeModal();
  };

  return (
    <ModalShell eyebrow={detailLabel} title={point.name}>
      <div>
        <div className="flex items-center gap-3">
          <IconTile size="lg" tone="brand" icon={<Icon icon={PointIcon} size={24} />} />
          <div className="min-w-0 flex-1">
            <div className="t-caption">{point.address}</div>
          </div>
        </div>

        <ListCard as="div" className="mt-5">
          <Row icon={MapPin} label="Endereço" value={point.address} />
          <Row icon={Clock} label="Horário" value={point.openingHours ?? 'Não informado'} />
          <Row
            icon={Ruler}
            label="Distância"
            value={distanceFromCenter({ lat: point.lat, lng: point.lng })}
          />
          {point.phone ? <Row icon={Phone} label="Telefone" value={point.phone} /> : null}
          {point.website ? <Row icon={ExternalLink} label="Site" value={point.website} /> : null}
          <Row
            icon={ShieldCheck}
            label="Fonte"
            value={`${ENVIRONMENTAL_SOURCE_LABELS[point.source]} · ${point.confidence}%`}
          />
          <Row icon={CheckCircle2} label="Verificado" value={verificationLabel(point)} />
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

function resolvePoint(id: string): EnvironmentalPoint | null {
  return getRegisteredEnvironmentalPoint(id) ?? getLocalEnvironmentalPointById(id);
}

function verificationLabel(point: EnvironmentalPoint): string {
  if (point.lastVerifiedDays !== undefined) {
    return `há ${point.lastVerifiedDays} dia${point.lastVerifiedDays === 1 ? '' : 's'}`;
  }
  if (!point.lastVerifiedAt) return 'fonte aberta';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(
    new Date(point.lastVerifiedAt)
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
