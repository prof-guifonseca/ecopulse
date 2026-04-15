type SearchParamsLike = {
  get(name: string): string | null;
  toString(): string;
};

type QueryUpdates = Record<string, string | null | undefined>;

export function isDemoMode(searchParams?: SearchParamsLike | null) {
  return searchParams?.get('demo') === '1';
}

export function buildSearchHref(
  pathname: string,
  searchParams: SearchParamsLike | null | undefined,
  updates: QueryUpdates = {}
) {
  const params = new URLSearchParams(searchParams?.toString() ?? '');

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') {
      params.delete(key);
      return;
    }

    params.set(key, value);
  });

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function buildDemoHref(pathname: string, demoMode: boolean, updates: QueryUpdates = {}) {
  const params = new URLSearchParams();

  if (demoMode) params.set('demo', '1');

  Object.entries(updates).forEach(([key, value]) => {
    if (value === null || value === undefined || value === '') return;
    params.set(key, value);
  });

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}
