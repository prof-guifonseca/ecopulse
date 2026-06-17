'use client';

import { Toaster } from 'sonner';

/**
 * Toast viewport — sonner, themed to EcoPulse's editorial dark card. Toasts are
 * fired through useUIStore().showToast (which routes to sonner), so call sites
 * are unchanged. sonner adds stacking, swipe-to-dismiss and focus-safe live
 * regions for free.
 */
export function Toasts() {
  return (
    <Toaster
      position="bottom-center"
      theme="dark"
      offset={88}
      gap={8}
      toastOptions={{
        classNames: {
          toast:
            'card border-soft !bg-[var(--card)] !text-[var(--foreground)] !shadow-[var(--shadow-card)]',
          title: 't-body',
          description: 't-body-sm',
          icon: 'text-[var(--primary)]',
        },
      }}
    />
  );
}
