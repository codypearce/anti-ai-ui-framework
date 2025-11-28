import { componentLoggers } from '../utils/logger';

export interface PopupData {
  id: number;
  left: number;
  top: number;
  zIndex: number;
}

export interface PopupChaosOptions {
  popupCount?: number;
  closeOrder?: number[];
  onAllClosed?: () => void;
  onWrongClose?: (attemptedId: number, expectedId: number) => void;
  renderPopup?: (popup: PopupData, closePopup: () => void, isDenied: boolean) => HTMLElement;
}

export interface PopupChaosAPI {
  destroy: () => void;
  getPopups: () => PopupData[];
  closePopup: (id: number) => void;
  getExpectedNextId: () => number | null;
}

export function makePopupChaos(options: PopupChaosOptions = {}): PopupChaosAPI {
  const logger = componentLoggers.popupChaos;
  const count = Math.max(1, options.popupCount ?? 4);

  const order = options.closeOrder && options.closeOrder.length === count
    ? options.closeOrder.slice()
    : Array.from({ length: count }, (_, i) => i).sort(() => Math.random() - 0.5);
  let expectedIdx = 0;

  const popupData: PopupData[] = Array.from({ length: count }, (_, i) => ({
    id: i,
    left: 40 + Math.random() * 300,
    top: 40 + Math.random() * 120,
    zIndex: 100 + i,
  }));

  const activePopups = new Set(popupData.map(p => p.id));
  const popupElements = new Map<number, HTMLElement>();
  let deniedId: number | null = null;

  let container: HTMLElement | null = null;

  function isDenied(id: number): boolean {
    return deniedId === id;
  }

  function closePopupById(id: number): void {
    const expected = order[expectedIdx];
    if (id !== expected) {
      // Mark as denied
      deniedId = id;
      const elem = popupElements.get(id);
      if (elem) {
        elem.style.transform = 'translateX(4px)';
        setTimeout(() => {
          if (elem) elem.style.transform = 'none';
          deniedId = null;
        }, 300);
      }
      logger.warn(`Wrong order: expected ${expected}, got ${id}`);
      options.onWrongClose?.(id, expected);
      return;
    }

    // Correct popup
    activePopups.delete(id);
    const elem = popupElements.get(id);
    if (elem && elem.parentElement) {
      elem.parentElement.removeChild(elem);
    }
    popupElements.delete(id);

    expectedIdx += 1;
    if (expectedIdx >= order.length) {
      logger.info('All popups closed in correct order');
      options.onAllClosed?.();
      destroy();
    }
  }

  function renderDefaultPopup(popup: PopupData, close: () => void, denied: boolean): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.position = 'absolute';
    wrap.style.left = `${popup.left}px`;
    wrap.style.top = `${popup.top}px`;
    wrap.style.zIndex = `${popup.zIndex}`;
    wrap.style.width = '280px';
    wrap.style.pointerEvents = 'auto';
    wrap.style.transition = 'transform 150ms ease';
    wrap.style.transform = denied ? 'translateX(4px)' : 'none';
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
    title.textContent = `Important Notice #${popup.id + 1}`;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', close);

    head.appendChild(title);
    head.appendChild(closeBtn);

    const body = document.createElement('div');
    body.style.padding = '10px';
    const p = document.createElement('p');
    p.style.margin = '0';
    p.textContent = 'Please read and acknowledge this modal to continue.';
    body.appendChild(p);

    wrap.appendChild(head);
    wrap.appendChild(body);
    return wrap;
  }

  function render(): void {
    if (options.renderPopup) {
      // User provides custom rendering - they handle container
      for (const popup of popupData) {
        const elem = options.renderPopup(popup, () => closePopupById(popup.id), isDenied(popup.id));
        popupElements.set(popup.id, elem);
      }
    } else {
      // Default rendering with fixed overlay
      const overlay = document.createElement('div');
      overlay.style.position = 'fixed';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '9998';

      for (const popup of popupData) {
        const elem = renderDefaultPopup(popup, () => closePopupById(popup.id), false);
        popupElements.set(popup.id, elem);
        overlay.appendChild(elem);
      }

      document.body.appendChild(overlay);
      container = overlay;
    }
  }

  function destroy(): void {
    if (container && container.parentElement) {
      container.parentElement.removeChild(container);
    }
    popupElements.clear();
    activePopups.clear();
  }

  function getExpectedNextId(): number | null {
    return expectedIdx < order.length ? order[expectedIdx] : null;
  }

  render();

  return {
    destroy,
    getPopups: () => popupData.filter(p => activePopups.has(p.id)),
    closePopup: closePopupById,
    getExpectedNextId,
  };
}

