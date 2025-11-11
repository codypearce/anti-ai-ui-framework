import { warnProductionUsage, componentLoggers } from '../utils/logger';

export interface FakeDownloadGridOptions {
  rows?: number;
  cols?: number;
  realButtonIndex?: number;
  labels?: { real?: string; fake?: string };
  onRealClick?: (index: number, ev: MouseEvent) => void;
  onFakeClick?: (index: number, ev: MouseEvent) => void;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function makeFakeDownloadGrid(
  container: HTMLElement,
  options: FakeDownloadGridOptions = {}
) {
  warnProductionUsage('FakeDownloadGrid (vanilla)');
  const logger = componentLoggers.fakeDownloadGrid;

  const rows = clamp(options.rows ?? 3, 1, 10);
  const cols = clamp(options.cols ?? 3, 1, 10);
  const total = rows * cols;
  let realIndex =
    options.realButtonIndex !== undefined
      ? clamp(options.realButtonIndex, 0, total - 1)
      : Math.floor(Math.random() * total);

  const labelReal = options.labels?.real ?? 'DOWNLOAD';
  const labelFake = options.labels?.fake ?? 'DOWNLOAD';

  container.style.display = 'grid';
  container.style.gridTemplateColumns = `repeat(${cols}, minmax(100px, 1fr))`;
  container.style.gap = '12px';

  const buttons: HTMLButtonElement[] = [];
  for (let i = 0; i < total; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = i === realIndex ? labelReal : labelFake;
    btn.style.background = '#3b82f6';
    btn.style.color = '#fff';
    btn.style.border = '1px solid #0f172a';
    btn.style.padding = '10px 14px';
    btn.style.cursor = 'pointer';
    btn.setAttribute('aria-label', i === realIndex ? 'Real download' : 'Advertisement');

    btn.addEventListener('click', (ev) => {
      if (i === realIndex) {
        logger.info('Real download clicked at index', i);
        options.onRealClick?.(i, ev);
      } else {
        logger.debug('Fake download clicked at index', i);
        options.onFakeClick?.(i, ev);
        if (options.realButtonIndex === undefined) {
          realIndex = Math.floor(Math.random() * total);
          buttons.forEach((b, idx) => {
            b.textContent = idx === realIndex ? labelReal : labelFake;
            b.setAttribute('aria-label', idx === realIndex ? 'Real download' : 'Advertisement');
          });
        }
      }
    });

    buttons.push(btn);
    container.appendChild(btn);
  }

  return {
    destroy() {
      buttons.forEach((btn) => {
        const clone = btn.cloneNode(true) as HTMLButtonElement;
        btn.replaceWith(clone);
      });
      container.innerHTML = '';
    },
  };
}

