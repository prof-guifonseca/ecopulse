'use client';

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useUIStore } from '@/store/uiStore';
import { renderShareCardBlob, type ShareCardData } from '@/lib/share/renderCard';
import { shareOrDownload } from '@/lib/share/shareImage';

interface Props {
  data: ShareCardData;
  fileName: string;
  shareText?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'reward';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

/** Gera o cartão de marca no cliente e abre o compartilhamento nativo
 *  (com fallback de download). Sem backend. */
export function ShareButton({
  data,
  fileName,
  shareText,
  label = 'Compartilhar',
  variant = 'secondary',
  size = 'sm',
  fullWidth,
  className,
}: Props) {
  const [busy, setBusy] = useState(false);
  const showToast = useUIStore((s) => s.showToast);

  const onClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const blob = await renderShareCardBlob(data);
      const outcome = await shareOrDownload(blob, {
        fileName,
        title: 'EcoPulse',
        text: shareText,
      });
      if (outcome === 'downloaded') {
        showToast('Cartão salvo para compartilhar', 'info');
      }
    } catch {
      showToast('Não foi possível gerar o cartão', 'info');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      className={className}
      loading={busy}
      onClick={onClick}
      leftIcon={<Icon icon={Share2} size={16} />}
    >
      {label}
    </Button>
  );
}
