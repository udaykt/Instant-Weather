// shareCard.ts — capture the main panel as PNG, offer download + clipboard copy

import html2canvas from 'html2canvas';

export async function shareWeatherCard(): Promise<void> {
  const panel = document.querySelector<HTMLElement>('.main-panel');
  if (!panel) return;

  const shareBtn = document.getElementById('share-btn') as HTMLButtonElement | null;
  if (shareBtn) shareBtn.disabled = true;

  let canvas: HTMLCanvasElement;
  try {
    canvas = await html2canvas(panel, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      logging: false,
    });
  } catch {
    if (shareBtn) shareBtn.disabled = false;
    return;
  }

  if (shareBtn) shareBtn.disabled = false;

  const supportsClipboard =
    typeof navigator.clipboard?.write === 'function' && typeof ClipboardItem !== 'undefined';

  const menu = buildShareMenu(canvas, supportsClipboard);
  document.body.appendChild(menu);

  // Position near the share button
  const rect = shareBtn?.getBoundingClientRect();
  if (rect) {
    const top = rect.bottom + 8;
    const right = window.innerWidth - rect.right;
    menu.style.top = `${top}px`;
    menu.style.right = `${right}px`;
  } else {
    menu.style.top = '64px';
    menu.style.right = '20px';
  }

  const dismiss = (e: MouseEvent) => {
    if (!menu.contains(e.target as Node)) {
      menu.remove();
      document.removeEventListener('click', dismiss);
    }
  };
  // Use a microtask so the current click doesn't immediately dismiss
  setTimeout(() => document.addEventListener('click', dismiss), 0);
}

function buildShareMenu(canvas: HTMLCanvasElement, supportsClipboard: boolean): HTMLDivElement {
  const menu = document.createElement('div');
  menu.className = 'share-menu';

  const downloadBtn = document.createElement('a');
  downloadBtn.className = 'share-menu-btn';
  downloadBtn.href = canvas.toDataURL('image/png');
  downloadBtn.download = 'weather-card.png';
  downloadBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
         stroke-linejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
    Download PNG`;
  menu.appendChild(downloadBtn);

  if (supportsClipboard) {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'share-menu-btn';
    copyBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
           stroke-linejoin="round" aria-hidden="true">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
      </svg>
      Copy Image`;
    copyBtn.addEventListener('click', async () => {
      try {
        await new Promise<void>((resolve, reject) => {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error('blob null'));
              return;
            }
            try {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
              copyBtn.textContent = 'Copied!';
              setTimeout(() => menu.remove(), 1200);
              resolve();
            } catch (err) {
              reject(err);
            }
          }, 'image/png');
        });
      } catch {
        copyBtn.textContent = 'Copy failed';
      }
    });
    menu.appendChild(copyBtn);
  }

  return menu;
}
