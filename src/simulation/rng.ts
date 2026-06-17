export function hashString(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function seededRandom(seed: string, cursor: number): number {
  return hashString(`${seed}:${cursor}`) / 4294967296;
}

export function deterministicId(parts: Array<string | number | null | undefined>): string {
  return hashString(parts.filter((part) => part !== undefined && part !== null).join(':')).toString(
    36,
  );
}
