// Compartilhamento do cartão: usa a Web Share API com arquivos quando
// disponível (mobile), com fallback para download em qualquer navegador.

export type ShareOutcome = 'shared' | 'downloaded';

interface ShareOptions {
  fileName: string;
  title?: string;
  text?: string;
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoga depois do tick para o download iniciar.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareOrDownload(blob: Blob, options: ShareOptions): Promise<ShareOutcome> {
  const file = new File([blob], options.fileName, { type: 'image/png' });
  const nav = navigator as Navigator & {
    canShare?: (data?: ShareData) => boolean;
  };

  if (typeof nav.share === 'function' && nav.canShare?.({ files: [file] })) {
    try {
      await nav.share({ files: [file], title: options.title, text: options.text });
      return 'shared';
    } catch (error) {
      // Usuário cancelou a folha de compartilhamento: não força download.
      if (error instanceof Error && error.name === 'AbortError') return 'shared';
      // Outras falhas: cai para o download.
    }
  }

  downloadBlob(blob, options.fileName);
  return 'downloaded';
}
