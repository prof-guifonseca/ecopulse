function canVibrate(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function';
}

export function hapticTap(): void {
  if (canVibrate()) {
    try {
      navigator.vibrate(10);
    } catch {
      /* ignore */
    }
  }
}

export function hapticSuccess(): void {
  if (canVibrate()) {
    try {
      navigator.vibrate([12, 40, 18]);
    } catch {
      /* ignore */
    }
  }
}
