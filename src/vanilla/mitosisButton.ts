import { randomPosition } from '../utils/randomPosition';
import { warnProductionUsage, componentLoggers } from '../utils/logger';

export type RealIndexStrategy = 'rotate' | 'random';

export interface MitosisOptions {
  maxClones?: number;
  decayMs?: number;
  realIndexStrategy?: RealIndexStrategy;
  label?: string;
  container?: HTMLElement; // defaults to element.parentElement or body
  initialClones?: number; // initial decoys to spawn on init
  shuffleIntervalMs?: number; // how often to reassign real index (0 = disabled)
  onRealClick?: () => void;
  onFakeClick?: (index: number) => void;
}

interface CloneItem {
  el: HTMLButtonElement;
  createdAt: number;
}

export function makeMitosisButton(element: HTMLButtonElement, opts: MitosisOptions = {}) {
  const options: Required<MitosisOptions> = {
    maxClones: opts.maxClones ?? 8,
    decayMs: opts.decayMs ?? 6000,
    realIndexStrategy: opts.realIndexStrategy ?? 'rotate',
    label: opts.label ?? element.textContent ?? 'Click me',
    container: opts.container ?? (element.parentElement as HTMLElement | null) ?? document.body,
    initialClones: opts.initialClones ?? 0,
    shuffleIntervalMs: opts.shuffleIntervalMs ?? 0,
    onRealClick: opts.onRealClick ?? (() => {}),
    onFakeClick: opts.onFakeClick ?? (() => {}),
  };

  warnProductionUsage('MitosisButton (vanilla)');
  const logger = componentLoggers.semanticGaslighting; // reuse namespace

  const container = options.container;
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'absolute';
  }

  element.textContent = options.label;
  element.style.left = '50%';
  element.style.top = '50%';
  element.style.transform = 'translate(-50%, -50%)';

  let clones: CloneItem[] = [];
  let realIndex = 0; // index within [element, ...clones]

  function markReal() {
    element.removeAttribute('data-real');
    clones.forEach((c) => c.el.removeAttribute('data-real'));
    if (realIndex === 0) {
      element.setAttribute('data-real', 'true');
    } else {
      clones[realIndex - 1]?.el.setAttribute('data-real', 'true');
    }
  }

  function pickNextRealIndex(current: number, total: number): number {
    if (options.realIndexStrategy === 'rotate') {
      return (current + 1) % total;
    }
    return Math.floor(Math.random() * total);
  }

  function addClone() {
    if (clones.length >= options.maxClones) return;
    const pos = randomPosition({ minX: 10, maxX: 90, minY: 10, maxY: 90 });
    const btn = document.createElement('button');
    btn.type = 'button';
    // Inherit classes so clones look identical to the seed
    btn.className = element.className;
    btn.textContent = options.label;
    btn.style.position = 'absolute';
    btn.style.left = `${pos.x}%`;
    btn.style.top = `${pos.y}%`;
    btn.style.transform = 'translate(-50%, -50%)';
    container.appendChild(btn);

    const idx = clones.length + 1; // position index for this button in [seed, ...clonesNew]
    btn.addEventListener('click', () => handleClick(idx));

    clones.push({ el: btn, createdAt: Date.now() });
  }

  function handleClick(index: number) {
    const total = clones.length + 1;
    const isReal = index === realIndex;
    if (isReal) {
      options.onRealClick();
    } else {
      options.onFakeClick(index);
    }
    addClone();
    const nextTotal = Math.min(total + 1, options.maxClones + 1);
    realIndex = pickNextRealIndex(realIndex, nextTotal);
    markReal();
    logger.debug('MitosisButton click', { isReal, total: nextTotal });
  }

  element.addEventListener('click', () => handleClick(0));
  markReal();

  // Spawn initial clones for immediate chaos
  if (options.initialClones > 0) {
    const toAdd = Math.min(options.initialClones, options.maxClones);
    for (let i = 0; i < toAdd; i++) addClone();
    // After adding, pick a new real index based on strategy
    realIndex = pickNextRealIndex(realIndex, Math.min(1 + toAdd, options.maxClones + 1));
    markReal();
  }

  const decayInterval = options.decayMs > 0 ? window.setInterval(() => {
    const now = Date.now();
    const before = clones.length;
    clones = clones.filter((c) => now - c.createdAt < options.decayMs);
    if (clones.length !== before) {
      // Remove DOM nodes for decayed clones
      const toRemove = Array.from(container.querySelectorAll('button'))
        .filter((btn) => btn !== element && !clones.some((c) => c.el === btn));
      toRemove.forEach((btn) => btn.remove());
      // Clamp realIndex within new total
      const total = clones.length + 1;
      realIndex = Math.min(realIndex, total - 1);
      markReal();
    }
  }, Math.min(500, Math.max(200, Math.floor(options.decayMs / 6)))) : undefined;

  // Periodically shuffle which button is real
  const shuffleInterval = options.shuffleIntervalMs > 0 ? window.setInterval(() => {
    const total = clones.length + 1;
    if (total > 1) {
      realIndex = pickNextRealIndex(realIndex, total);
      markReal();
    }
  }, options.shuffleIntervalMs) : undefined;

  return function cleanup() {
    element.replaceWith(element.cloneNode(true)); // remove listener by replacing node
    clones.forEach((c) => c.el.remove());
    if (decayInterval) window.clearInterval(decayInterval);
    if (shuffleInterval) window.clearInterval(shuffleInterval);
  };
}
