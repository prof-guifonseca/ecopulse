'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  ArenaRivalMastery,
  ArenaStageTheme,
  BattleAction,
  BattleResult,
  BattleSession,
} from '@/types';
import { sessionToBattleResult } from '@/lib/battle/rules';
import { battleArenaXpReward } from '@/lib/arena/progress';
import { battleEventToVisualCue } from '@/lib/arena/presentation';
import { ArenaActionDock } from './ArenaActionDock';
import { ArenaResultOverlay } from './ArenaResultOverlay';
import { ArenaRoundTimeline } from './ArenaRoundTimeline';
import { ArenaStageScene } from './ArenaStageScene';

interface Props {
  session: BattleSession;
  stageTheme?: ArenaStageTheme;
  masteryAtStart?: ArenaRivalMastery;
  onAction: (action: BattleAction) => void;
  onComplete: (result: BattleResult) => void;
  onRematch: () => void;
  onChangeOpponent: () => void;
}

export function BattleStage({
  session,
  stageTheme = 'forest',
  masteryAtStart,
  onAction,
  onComplete,
  onRematch,
  onChangeOpponent,
}: Props) {
  const [reviewingRound, setReviewingRound] = useState(false);
  const completedRef = useRef(false);
  const latestRound = session.rounds.at(-1);
  const lastEvent = session.events.at(-1) ?? session.events[0];
  const cue = battleEventToVisualCue(lastEvent, session);
  const result = useMemo(
    () => (session.status === 'finished' ? sessionToBattleResult(session) : null),
    [session],
  );
  const reward = useMemo(
    () => (result ? battleArenaXpReward(result, masteryAtStart) : null),
    [masteryAtStart, result],
  );
  const currentEvents = useMemo(() => {
    if (session.status === 'finished') return session.events.slice(-5);
    if (reviewingRound && latestRound) return latestRound.events.slice(-5);
    return session.events.slice(-3);
  }, [latestRound, reviewingRound, session.events, session.status]);

  useEffect(() => {
    if (!result || completedRef.current) return undefined;
    completedRef.current = true;
    const timer = window.setTimeout(() => onComplete(result), 180);
    return () => window.clearTimeout(timer);
  }, [onComplete, result]);

  const canChooseAction = session.status === 'active' && !reviewingRound;

  return (
    <section className="space-y-3" aria-label="Teste tático de loadout por round">
      <ArenaStageScene session={session} stageTheme={stageTheme} cue={cue} />

      {result && reward ? (
        <ArenaResultOverlay
          result={result}
          reward={reward}
          onRematch={onRematch}
          onChangeOpponent={onChangeOpponent}
        />
      ) : null}

      <div className="sticky bottom-[calc(env(safe-area-inset-bottom,0px)+84px)] z-30">
        <ArenaActionDock
          session={session}
          reviewingRound={reviewingRound}
          canChooseAction={canChooseAction}
          onAction={(action) => {
            setReviewingRound(true);
            onAction(action);
          }}
          onNextRound={() => setReviewingRound(false)}
        />
      </div>

      <ArenaRoundTimeline
        session={session}
        events={currentEvents}
        activeEventId={lastEvent?.id}
        reviewingRound={reviewingRound}
      />
    </section>
  );
}
