import type { Metadata } from 'next';
import Link from 'next/link';

type SearchParams = Record<string, string | string[] | undefined>;

function paramsFrom(sp: SearchParams): URLSearchParams {
  const params = new URLSearchParams();
  for (const key of ['eyebrow', 'title', 'caption', 'accent'] as const) {
    const value = sp[key];
    if (typeof value === 'string') params.set(key, value);
  }
  const stat = sp.stat;
  if (Array.isArray(stat)) stat.forEach((entry) => params.append('stat', entry));
  else if (typeof stat === 'string') params.append('stat', stat);
  return params;
}

function metadataBase(): URL | undefined {
  const site = process.env.NEXT_PUBLIC_SITE_URL;
  if (!site) return undefined;
  try {
    return new URL(site);
  } catch {
    return undefined;
  }
}

function readTitle(sp: SearchParams): string {
  return typeof sp.title === 'string' && sp.title ? sp.title : 'Meu impacto no EcoPulse';
}

function readCaption(sp: SearchParams): string {
  return typeof sp.caption === 'string' && sp.caption
    ? sp.caption
    : 'Sustentabilidade é lifestyle.';
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const ogPath = `/api/og?${paramsFrom(sp).toString()}`;
  const title = `${readTitle(sp)} · EcoPulse`;
  const description = readCaption(sp);
  return {
    metadataBase: metadataBase(),
    title,
    description,
    openGraph: {
      type: 'website',
      title,
      description,
      images: [{ url: ogPath, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogPath],
    },
  };
}

export default async function SharePage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;
  const ogPath = `/api/og?${paramsFrom(sp).toString()}`;
  const title = readTitle(sp);
  const caption = readCaption(sp);

  return (
    <main className="mx-auto flex min-h-[100dvh] w-[min(100vw,var(--canvas-width))] max-w-full flex-col items-center justify-center gap-6 px-6 py-10 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element -- /api/og is a dynamic route, not a static asset */}
      <img
        src={ogPath}
        alt={title}
        width={1200}
        height={630}
        className="border-soft w-full max-w-[480px] rounded-[var(--radius-lg)]"
      />
      <div className="space-y-2">
        <h1 className="t-headline">{title}</h1>
        <p className="t-body text-[var(--text-secondary)]">{caption}</p>
      </div>
      <Link
        href="/home"
        className="gradient-primary inline-flex h-11 items-center justify-center rounded-[var(--radius-sm)] px-6 font-semibold text-[var(--on-primary)]"
      >
        Abrir o EcoPulse
      </Link>
      <p className="t-caption text-[var(--text-muted)]">Hábitos sustentáveis com impacto real.</p>
    </main>
  );
}
