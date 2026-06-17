'use client';

import { useCallback, useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'ecopulse:pwa-install-dismissed';

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * Banner discreto de "instalar app". No Android/Chromium usa o evento
 * `beforeinstallprompt`; no iOS (que não expõe esse evento) mostra a instrução
 * manual de "Compartilhar → Adicionar à Tela de Início". Esconde quando o app
 * já está instalado (standalone) ou após ser dispensado.
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isStandalone()) return;
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* localStorage indisponível: segue mostrando */
    }

    // Roteia o reveal por um helper (mesmo padrão de useHydrated) para não
    // chamar setState de forma síncrona no corpo do effect.
    const reveal = (asIOS: boolean) => {
      if (asIOS) setIsIOS(true);
      setShow(true);
    };

    const ua = navigator.userAgent.toLowerCase();
    const ios =
      /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    if (ios) {
      reveal(true);
      return;
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setShow(true);
    };
    const onInstalled = () => {
      setShow(false);
      setDeferred(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const remember = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* sem persistência: reaparece na próxima sessão */
    }
  }, []);

  const dismiss = useCallback(() => {
    setShow(false);
    remember();
  }, [remember]);

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice.catch(() => null);
    setDeferred(null);
    setShow(false);
    if (choice?.outcome !== 'accepted') remember();
  }, [deferred, remember]);

  if (!show) return null;

  return (
    <div className="px-4 pb-2 sm:px-8">
      <div className="border-soft bg-tint-2 mx-auto flex w-full max-w-[var(--content-width)] items-center gap-3 rounded-[var(--radius-md)] px-4 py-3">
        <span className="bg-tint-green-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-sm)] text-[var(--accent-green)]">
          <Icon icon={isIOS ? Share : Download} size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="t-body-sm font-semibold text-[var(--text-primary)]">Instalar o EcoPulse</p>
          {isIOS ? (
            <p className="t-caption">Toque em Compartilhar e em “Adicionar à Tela de Início”.</p>
          ) : (
            <p className="t-caption">Acesse direto da tela inicial, mesmo offline.</p>
          )}
        </div>
        {!isIOS && (
          <Button variant="primary" size="sm" onClick={install}>
            Instalar
          </Button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar"
          className="hover:bg-tint-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
        >
          <Icon icon={X} size={16} />
        </button>
      </div>
    </div>
  );
}
