import type { ShareCardData } from './renderCard';

// Single source of truth for encoding a share card into query params, shared by
// the ShareButton (builds the link) and the /s page + /api/og route (consume it).

export function shareCardToParams(data: ShareCardData): URLSearchParams {
  const params = new URLSearchParams();
  params.set('eyebrow', data.eyebrow);
  params.set('title', data.title);
  params.set('caption', data.caption);
  if (data.accent) params.set('accent', data.accent);
  data.stats.slice(0, 3).forEach((stat) => params.append('stat', `${stat.value}|${stat.label}`));
  return params;
}

/** Relative path to the shareable landing page (with link-unfurl OG image). */
export function buildSharePath(data: ShareCardData): string {
  return `/s?${shareCardToParams(data).toString()}`;
}
