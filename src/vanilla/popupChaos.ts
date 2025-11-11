import { warnProductionUsage, componentLoggers } from '../utils/logger';

export interface PopupChaosOptions {
  popupCount?: number;
  closeOrder?: number[];
  onAllClosed?: () => void;
}

export function makePopupChaos(options: PopupChaosOptions = {}) {
  warnProductionUsage('PopupChaos (vanilla)');
  const logger = componentLoggers.popupChaos;
  const count = Math.max(1, options.popupCount ?? 4);

  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '9998';

  const order = options.closeOrder && options.closeOrder.length === count
    ? options.closeOrder.slice()
    : Array.from({ length: count }, (_, i) => i).sort(() => Math.random() - 0.5);
  let expectedIdx = 0;

  const popups: HTMLDivElement[] = [];

  function closePopup(pop: HTMLDivElement, id: number) {
    const expected = order[expectedIdx];
    if (id !== expected) {
      pop.style.transform = 'translateX(4px)';
      setTimeout(() => (pop.style.transform = 'none'), 250);
      logger.warn(`Wrong order: expected ${expected}, got ${id}`);
      return;
    }
    pop.remove();
    expectedIdx += 1;
    if (expectedIdx >= order.length) {
      logger.info('All popups closed in correct order');
      options.onAllClosed?.();
      destroy();
    }
  }

  for (let i = 0; i < count; i++) {
    const wrap = document.createElement('div');
    wrap.style.position = 'absolute';
    wrap.style.left = `${40 + Math.random() * 300}px`;
    wrap.style.top = `${40 + Math.random() * 120}px`;
    wrap.style.zIndex = `${100 + i}`;
    wrap.style.width = '280px';
    wrap.style.pointerEvents = 'auto';
    wrap.style.transition = 'transform 150ms ease';
    wrap.style.background = '#fff';
    wrap.style.color = '#0f172a';
    wrap.style.border = '1px solid #e2e8f0';
    wrap.style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
    wrap.style.borderRadius = '8px';

    const head = document.createElement('div');
    head.style.padding = '8px';
    head.style.borderBottom = '1px solid #e2e8f0';
    head.style.display = 'flex';
    head.style.justifyContent = 'space-between';
    head.style.alignItems = 'center';
    const title = document.createElement('strong');
    title.textContent = `Important Notice #${i + 1}`;
    const close = document.createElement('button');
    close.textContent = '✕';
    close.addEventListener('click', () => closePopup(wrap, i));
    head.appendChild(title);
    head.appendChild(close);

    const body = document.createElement('div');
    body.style.padding = '10px';
    const p = document.createElement('p');
    p.style.margin = '0';
    p.textContent = 'Please read and acknowledge this modal to continue.';
    body.appendChild(p);

    wrap.appendChild(head);
    wrap.appendChild(body);
    overlay.appendChild(wrap);
    popups.push(wrap);
  }

  document.body.appendChild(overlay);

  function destroy() {
    if (overlay.parentElement) overlay.parentElement.removeChild(overlay);
  }

  return { destroy };
}

