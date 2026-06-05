'use client';

import { useEffect } from 'react';
import { ensureSupabaseSession, isSupabaseBrowserConfigured } from '@/lib/client/supabaseBrowser';

/**
 * Establishes an anonymous Supabase session on load so the visitor's actions
 * persist under a real `auth.users` id (and the BFF can scope per user). Fully
 * gated: inert without NEXT_PUBLIC_SUPABASE_*, keeping the app local-first.
 */
export function SupabaseAuthInit() {
  useEffect(() => {
    if (!isSupabaseBrowserConfigured()) return;
    void ensureSupabaseSession();
  }, []);

  return null;
}
