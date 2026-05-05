export function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <div className="t-headline leading-none">{value}</div>
      <div className="mt-1 t-caption">{label}</div>
    </div>
  );
}
