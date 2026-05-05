import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      className="device-shell mx-auto flex h-[100dvh] w-full max-w-[var(--shell-width)] flex-col items-center justify-center gap-3 px-6 text-center sm:h-[calc(100dvh-3rem)] sm:max-h-[920px] sm:rounded-[var(--radius-shell)]"
    >
      <p className="t-eyebrow">404</p>
      <h1 className="t-display">Não achamos essa página.</h1>
      <p className="t-body-sm" style={{ maxWidth: 280 }}>
        O caminho mudou ou nunca existiu. Volte para o início e siga a rotina.
      </p>
      <Link
        href="/home"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-full px-6 font-semibold"
        style={{
          background: 'var(--gradient-primary)',
          color: 'var(--on-primary)',
        }}
      >
        Voltar ao início
      </Link>
    </div>
  );
}
