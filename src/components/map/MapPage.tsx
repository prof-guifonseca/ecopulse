'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import { ChevronRight, Database, LocateFixed, MapPin, RefreshCw, Search } from 'lucide-react';
import { effectiveMapTypes, getMissionTemplate } from '@/data';
import { useCurrentRegion } from '@/lib/region';
import { approximateDistanceM } from '@/lib/region';
import { useUIStore } from '@/store/uiStore';
import { useGameStore } from '@/store/gameStore';
import { useUserStore } from '@/store/userStore';
import {
  ENVIRONMENTAL_CATEGORIES,
  ENVIRONMENTAL_CATEGORY_ICON,
  ENVIRONMENTAL_CATEGORY_LABELS,
  ENVIRONMENTAL_SOURCE_LABELS,
  formatDistanceMeters,
  getLocalEnvironmentalPoints,
  mapPointTypeToEnvironmentalCategory,
  rankEnvironmentalPoints,
  rememberEnvironmentalPoints,
  type EnvironmentalCategory,
  type EnvironmentalPoint,
  type EnvironmentalPointSource,
  type EsgPlaceSearchResult,
} from '@/lib/esg';
import { Icon } from '@/components/ui/Icon';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/AsyncState';
import { ListCard } from '@/components/ui/ListCard';
import { PageShell } from '@/components/ui/PageShell';
import { Button } from '@/components/ui/Button';
import { resolveIcon } from '@/lib/iconRegistry';
import { fetchWithRetry } from '@/lib/net/fetchRetry';
import { cn } from '@/lib/cn';
import { MapCanvas } from './MapCanvas';
import type { LatLng, RegionBBox } from '@/lib/region/types';
import type { TribeId } from '@/data/tribes';

const FILTERS: Array<'todos' | EnvironmentalCategory> = ['todos', ...ENVIRONMENTAL_CATEGORIES];
const LIVE_DISCOVERY_ENABLED = process.env.NEXT_PUBLIC_ENABLE_LIVE_ESG_DISCOVERY !== 'false';

export type LoadStatus = 'ready' | 'loading' | 'fallback' | 'error';

/**
 * Decides the post-fetch status from a search result or error, isolated from
 * the IO shell so the source/error matrix is unit-testable without a DOM
 * (mirrors lib/game/rules.ts vs gameActions.ts: pure decision, thin wrapper).
 */
export function resolveMapLoadStatus(
  result: EsgPlaceSearchResult | null,
  error?: unknown,
): LoadStatus {
  if (error !== undefined) return 'error';
  if (!result) return 'fallback';
  return result.source === 'official' ? 'fallback' : 'ready';
}

export function MapPage() {
  const region = useCurrentRegion();
  const events = region.events;
  const [allPoints, setAllPoints] = useState<EnvironmentalPoint[]>(() =>
    getLocalEnvironmentalPoints(region.mapPoints),
  );
  const [filter, setFilter] = useState<'todos' | EnvironmentalCategory>('todos');
  const [panel, setPanel] = useState<'places' | 'events'>('places');
  const [status, setStatus] = useState<LoadStatus>('ready');
  const [dataSource, setDataSource] = useState<EnvironmentalPointSource>('official');
  const [sourceReason, setSourceReason] = useState<string | null>(null);
  const [focusCenter, setFocusCenter] = useState<LatLng | undefined>(undefined);
  const [scopeLabel, setScopeLabel] = useState(region.blurb);
  const [locationQuery, setLocationQuery] = useState('');
  const openModal = useUIStore((s) => s.openModal);
  const showToast = useUIStore((s) => s.showToast);
  const visited = useGameStore((s) => s.visitedPoints);
  const todaysMissionIds = useGameStore((s) => s.todaysMissionIds);
  const tribe = useUserStore((s) => s.tribe);

  const fallbackPoints = useMemo(
    () => getLocalEnvironmentalPoints(region.mapPoints, { limit: 120 }),
    [region.mapPoints],
  );

  const preferredCategories = useMemo(() => {
    const mapTemplateId = todaysMissionIds.find((id) => getMissionTemplate(id)?.slot === 'map');
    const template = getMissionTemplate(mapTemplateId);
    return template
      ? effectiveMapTypes(template, (tribe ?? 'guardioes') as TribeId)?.map(
          mapPointTypeToEnvironmentalCategory,
        )
      : undefined;
  }, [todaysMissionIds, tribe]);

  const pins = useMemo(() => {
    const visible =
      filter === 'todos' ? allPoints : allPoints.filter((point) => point.category === filter);
    return rankEnvironmentalPoints(visible, {
      visitedPointIds: visited,
      preferredCategories,
      center: focusCenter ?? region.center,
    });
  }, [allPoints, filter, focusCenter, preferredCategories, region.center, visited]);

  const requestPlaces = useCallback(
    async (opts: {
      bbox?: RegionBBox;
      center?: LatLng;
      query?: string;
      label: string;
      signal?: AbortSignal;
    }) => {
      if (!LIVE_DISCOVERY_ENABLED) {
        setAllPoints(fallbackPoints);
        setDataSource('official');
        setSourceReason('live-disabled');
        setStatus('fallback');
        return;
      }

      setStatus('loading');
      setSourceReason(null);
      const params = new URLSearchParams({
        regionId: region.id,
        limit: '80',
        categories: ENVIRONMENTAL_CATEGORIES.join(','),
      });
      if (opts.bbox) {
        params.set(
          'bbox',
          `${opts.bbox.south},${opts.bbox.west},${opts.bbox.north},${opts.bbox.east}`,
        );
      }
      if (opts.center) {
        params.set('lat', String(opts.center.lat));
        params.set('lng', String(opts.center.lng));
        params.set('radiusMeters', '4500');
      }
      if (opts.query) params.set('q', opts.query);

      try {
        const response = await fetchWithRetry(fetch, `/api/esg/places?${params.toString()}`, {
          signal: opts.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = (await response.json()) as EsgPlaceSearchResult;
        const nextPoints =
          Array.isArray(result.points) && result.points.length > 0 ? result.points : fallbackPoints;
        rememberEnvironmentalPoints(nextPoints);
        setAllPoints(nextPoints);
        setDataSource(result.source);
        setSourceReason(result.reason ?? null);
        setFocusCenter(result.center ?? opts.center);
        setScopeLabel(opts.label);
        setStatus(resolveMapLoadStatus(result));
      } catch (error) {
        if (opts.signal?.aborted) return;
        rememberEnvironmentalPoints(fallbackPoints);
        setAllPoints(fallbackPoints);
        setDataSource('official');
        setSourceReason(error instanceof Error ? error.message : 'request-error');
        setStatus(resolveMapLoadStatus(null, error));
      }
    },
    [fallbackPoints, region.id],
  );

  useEffect(() => {
    rememberEnvironmentalPoints(fallbackPoints);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      void requestPlaces({
        bbox: region.bbox,
        label: region.blurb,
        signal: controller.signal,
      });
    }, 0);
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [fallbackPoints, region.bbox, region.blurb, requestPlaces]);

  const openPoint = useCallback(
    (point: EnvironmentalPoint) => {
      rememberEnvironmentalPoints([point]);
      openModal({ kind: 'mapPoint', id: point.id });
    },
    [openModal],
  );

  const refresh = useCallback(() => {
    void requestPlaces({
      bbox: focusCenter ? undefined : region.bbox,
      center: focusCenter,
      label: scopeLabel,
    });
  }, [focusCenter, region.bbox, requestPlaces, scopeLabel]);

  const locateNearby = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Localização indisponível', 'info');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const center = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setFocusCenter(center);
        void requestPlaces({
          center,
          label: 'Perto de você',
        });
      },
      () => {
        setStatus('ready');
        showToast('Não foi possível acessar a localização', 'info');
      },
      { enableHighAccuracy: false, maximumAge: 300_000, timeout: 8000 },
    );
  }, [requestPlaces, showToast]);

  const submitSearch = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const query = locationQuery.trim();
      if (query.length < 3) return;
      void requestPlaces({
        query,
        label: query,
      });
    },
    [locationQuery, requestPlaces],
  );

  return (
    <PageShell spacing={5}>
      <header className="pt-2">
        <h1 className="t-headline">Mapa</h1>
        <p className="t-caption mt-1">{scopeLabel} · pontos com fonte, distância e confiança.</p>
      </header>

      <MapCanvas
        region={region}
        points={pins}
        visitedPointIds={visited}
        focusCenter={focusCenter}
        onSelectPoint={openPoint}
      />

      <form className="flex gap-2" onSubmit={submitSearch}>
        <label className="sr-only" htmlFor="map-location-search">
          Buscar localidade
        </label>
        <input
          id="map-location-search"
          value={locationQuery}
          onChange={(event) => setLocationQuery(event.target.value)}
          className="border-soft bg-tint-1 min-w-0 flex-1 rounded-[var(--radius-sm)] px-3 text-sm text-[var(--foreground)] transition-colors outline-none placeholder:text-[var(--muted-foreground)] focus:border-[var(--line-active)]"
          placeholder="Londrina, bairro ou endereço"
          autoComplete="off"
        />
        <Button
          variant="secondary"
          type="submit"
          size="md"
          leftIcon={<Icon icon={Search} size={15} />}
          disabled={locationQuery.trim().length < 3 || status === 'loading'}
        >
          Buscar
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={locateNearby}
          leftIcon={<Icon icon={LocateFixed} size={14} />}
          disabled={status === 'loading'}
        >
          Usar localização
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={refresh}
          leftIcon={<Icon icon={RefreshCw} size={14} />}
          loading={status === 'loading'}
        >
          Atualizar
        </Button>
        <Chip
          asStatic
          staticRole="note"
          leftIcon={<Icon icon={Database} size={13} />}
          className="shrink-0"
        >
          {status === 'loading' ? 'Atualizando' : ENVIRONMENTAL_SOURCE_LABELS[dataSource]}
        </Chip>
      </div>

      {sourceReason ? (
        <p className="t-caption -mt-2 text-[var(--muted-foreground)]">
          {dataSource === 'official' || status === 'fallback' || status === 'error'
            ? 'Snapshot oficial/curado ativo enquanto a fonte aberta responde.'
            : 'Resultado reaproveitado de consulta recente.'}
        </p>
      ) : null}

      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {FILTERS.map((currentFilter) => {
          const iconName =
            currentFilter === 'todos' ? 'mapPin' : ENVIRONMENTAL_CATEGORY_ICON[currentFilter];
          const Lucide = resolveIcon(iconName);
          return (
            <Chip
              key={currentFilter}
              active={filter === currentFilter}
              onClick={() => setFilter(currentFilter)}
              leftIcon={Lucide ? <Icon icon={Lucide} size={13} /> : null}
              className="shrink-0 whitespace-nowrap"
            >
              {currentFilter === 'todos' ? 'Todos' : ENVIRONMENTAL_CATEGORY_LABELS[currentFilter]}
            </Chip>
          );
        })}
      </div>

      <div className="border-soft bg-tint-1 flex gap-1 rounded-full p-1">
        {[
          { v: 'places' as const, label: `Locais (${pins.length})` },
          { v: 'events' as const, label: `Agenda (${events.length})` },
        ].map((opt) => (
          <button
            key={opt.v}
            onClick={() => setPanel(opt.v)}
            className={cn(
              'flex-1 rounded-full px-3 py-1.5 text-sm font-semibold transition-colors',
              panel === opt.v
                ? 'bg-[var(--card)] text-[var(--foreground)] shadow-[var(--shadow-card)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--text-secondary)]',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {panel === 'places' ? (
        pins.length === 0 ? (
          <EmptyState
            title="Nenhum ponto neste filtro"
            description="Tente outro filtro, busque outra região ou atualize a lista."
          />
        ) : (
          <ListCard className="stagger">
            {pins.map((point) => {
              const Lucide = resolveIcon(ENVIRONMENTAL_CATEGORY_ICON[point.category]) ?? MapPin;
              const isVisited = visited.includes(point.id);
              const distance = formatDistanceMeters(
                approximateDistanceM(focusCenter ?? region.center, {
                  lat: point.lat,
                  lng: point.lng,
                }),
              );
              return (
                <li key={point.id}>
                  <button
                    onClick={() => openPoint(point)}
                    className="hover:bg-tint-2 flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-sm)]',
                        isVisited
                          ? 'border-active bg-tint-green-2 text-[var(--primary)]'
                          : 'border-soft bg-tint-2 text-[var(--text-secondary)]',
                      )}
                    >
                      <Icon icon={Lucide} size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="t-title truncate">{point.name}</h3>
                      <p className="t-caption truncate">
                        {distance} · {point.address}
                      </p>
                      <p className="t-micro mt-0.5 tracking-normal text-[var(--muted-foreground)]">
                        {ENVIRONMENTAL_SOURCE_LABELS[point.source]} · confiança {point.confidence}%
                      </p>
                    </div>
                    <Icon
                      icon={ChevronRight}
                      size={16}
                      className="shrink-0 text-[var(--muted-foreground)]"
                    />
                  </button>
                </li>
              );
            })}
          </ListCard>
        )
      ) : (
        <ListCard>
          {events.map((event) => (
            <li key={event.id} className="flex items-center gap-4 px-4 py-3">
              <div className="border-soft bg-tint-2 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-[var(--radius-sm)]">
                <span className="text-sm leading-none font-semibold text-[var(--foreground)]">
                  {event.day}
                </span>
                <span className="t-caption mt-0.5 leading-none">{event.month}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="t-title">{event.title}</h3>
                <p className="t-caption">
                  {event.time} · {event.rsvp} confirmados
                </p>
              </div>
            </li>
          ))}
        </ListCard>
      )}
    </PageShell>
  );
}
