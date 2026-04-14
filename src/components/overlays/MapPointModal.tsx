'use client';

import { MAP_POINTS, MAP_DETAIL_LABELS } from '@/data';
import { useGameStore } from '@/store/gameStore';
import { useUIStore } from '@/store/uiStore';
import { awardTokens, unlockBadge } from '@/lib/gameActions';
import { Modal } from './Modal';

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
      showToast('Missão diária: visitar Mapa ✅', 'success');
    } else {
      showToast('+10 Eco-Tokens! 🗺️', 'reward');
    }
    if (visitedPoints.length >= 3) unlockBadge('map-explorer');
    closeModal();
  };

  return (
    <Modal onClose={closeModal}>
      <div>
        <div className="mb-4 flex items-center gap-3">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full text-2xl"
            style={{ background: `${point.color}25` }}
          >
            {point.emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display text-base font-bold">{point.name}</h3>
            <span
              className="mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold"
              style={{ background: `${point.color}25`, color: point.color }}
            >
              {MAP_DETAIL_LABELS[point.type]}
            </span>
          </div>
        </div>

        <div className="space-y-3 rounded-md bg-bg-tertiary p-3 text-sm">
          <Row icon="📍" label="Endereço" value={point.address} />
          <Row icon="🕐" label="Horário" value={point.hours} />
          <Row icon="📏" label="Distância" value={point.distance} />
        </div>

        <button
          type="button"
          onClick={visit}
          disabled={visited}
          className="mt-5 w-full rounded-full py-3 text-sm font-bold text-bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'var(--gradient-primary)' }}
        >
          {visited ? '✅ Já visitado' : '📍 Marcar como visitado · 10 Tokens'}
        </button>
      </div>
    </Modal>
  );
}

function Row({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-text-secondary">
        <span aria-hidden>{icon}</span>
        <span className="text-xs">{label}</span>
      </span>
      <span className="truncate text-right text-sm font-medium">{value}</span>
    </div>
  );
}
