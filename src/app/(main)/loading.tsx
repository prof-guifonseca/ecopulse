export default function MainLoading() {
  return (
    <div
      className="flex h-full w-full items-center justify-center px-6"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="flex flex-col items-center gap-3">
        <span
          className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent"
          style={{ color: 'var(--accent-green)' }}
          aria-hidden
        />
        <p className="t-caption">Carregando…</p>
      </div>
    </div>
  );
}
