'use client';

import { useEffect, useState } from 'react';
import { Signal, Wifi, BatteryMedium } from 'lucide-react';

/**
 * Cosmetic iPhone-style status bar shown only at desktop sizes (≥640px),
 * where the device-shell sits inside a framed canvas. On mobile the real
 * device chrome already provides this — no need to fake it.
 *
 * The clock is real (updates each minute); signal/wifi/battery are static
 * decorations that complete the "this is a phone screenshot" reading.
 */
export function FauxStatusBar() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${mm}`);
    };
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div
      aria-hidden
      className="t-micro hidden shrink-0 items-center justify-between px-6 py-2 text-[var(--text-secondary)] sm:flex"
    >
      <span className="text-[var(--text-primary)]">{time ?? '—:—'}</span>
      <span className="inline-flex items-center gap-1.5">
        <Signal size={11} strokeWidth={2.4} />
        <Wifi size={11} strokeWidth={2.4} />
        <BatteryMedium size={14} strokeWidth={2.4} />
      </span>
    </div>
  );
}
