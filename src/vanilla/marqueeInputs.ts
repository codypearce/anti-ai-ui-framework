import { componentLoggers } from '../utils/logger';

export type MarqueeDirection = 'left' | 'right';

export interface MarqueeInputsOptions {
  count?: number;
  lanes?: number;
  speed?: number; // px per second
  direction?: MarqueeDirection;
  inputWidth?: number; // px
  placeholder?: string;
  className?: string; // applied to all inputs
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  initialValue?: string;
}

export function makeMarqueeInputs(container: HTMLElement, options: MarqueeInputsOptions = {}) {
  const logger = componentLoggers.shiftingInterface;

  const count = options.count ?? 6;
  const lanes = Math.max(1, options.lanes ?? 2);
  const speed = options.speed ?? 120;
  const direction = options.direction ?? 'right';
  const inputWidth = options.inputWidth ?? 160;
  const placeholder = options.placeholder ?? 'Type while it moves…';
  const initialValue = options.initialValue ?? '';

  const cs = getComputedStyle(container);
  if (cs.position === 'static') container.style.position = 'relative';
  container.style.overflow = 'hidden';

  const inputs: HTMLInputElement[] = [];
  const positions: { x: number; lane: number }[] = [];
  let rect = container.getBoundingClientRect();
  let width = rect.width || container.clientWidth || container.offsetWidth || window.innerWidth || 300;
  let height = rect.height || container.clientHeight || container.offsetHeight || 200;
  // As a last resort, if height is still tiny, use 200px
  if (height < 10) height = 200;
  const laneHeight = height / (lanes + 1);

  const minX = inputWidth * 0.5;
  const maxX = Math.max(minX, width - inputWidth * 0.5);
  for (let i = 0; i < count; i++) {
    const el = document.createElement('input');
    if (options.className) el.className = options.className;
    el.placeholder = placeholder;
    el.value = initialValue;
    el.style.position = 'absolute';
    el.style.width = `${inputWidth}px`;
    container.appendChild(el);
    inputs.push(el);

    const t = count > 1 ? i / (count - 1) : 0.5;
    const base = minX + t * (maxX - minX);
    const x = direction === 'right' ? base : maxX - (base - minX);
    const lane = i % lanes;
    positions.push({ x, lane });
  }

  let rafId: number | null = null;
  let lastTs: number | null = null;
  // Initial layout before animation
  for (let i = 0; i < inputs.length; i++) {
    const p = positions[i];
    const top = (p.lane + 1) * laneHeight;
    const el = inputs[i];
    el.style.left = `${p.x}px`;
    el.style.top = `${top}px`;
    el.style.transform = 'translate(-50%, -50%)';
  }
  
  const animate = (ts: number) => {
    if (lastTs == null) lastTs = ts;
    const dt = (ts - (lastTs || ts)) / 1000;
    lastTs = ts;
    const dx = speed * dt * (direction === 'right' ? 1 : -1);

    for (let i = 0; i < inputs.length; i++) {
      const p = positions[i];
      p.x += dx;
      if (p.x > width + inputWidth) p.x = -inputWidth;
      if (p.x < -inputWidth) p.x = width + inputWidth;
      const top = (p.lane + 1) * laneHeight;
      const el = inputs[i];
      el.style.left = `${p.x}px`;
      el.style.top = `${top}px`;
      el.style.transform = 'translate(-50%, -50%)';
    }

    rafId = requestAnimationFrame(animate);
  };
  rafId = requestAnimationFrame(animate);

  // Sync values across all inputs
  const onInput = (e: Event) => {
    const val = (e.target as HTMLInputElement).value;
    inputs.forEach((inp) => {
      if (inp !== e.target) inp.value = val;
    });
    options.onChange?.(val);
  };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      options.onSubmit?.((e.target as HTMLInputElement).value);
      logger.debug('MarqueeInputs submit', { value: (e.target as HTMLInputElement).value });
    }
  };
  inputs.forEach((inp) => {
    inp.addEventListener('input', onInput);
    inp.addEventListener('keydown', onKey);
  });

  return {
    destroy() {
      if (rafId) cancelAnimationFrame(rafId);
      inputs.forEach((inp) => {
        inp.removeEventListener('input', onInput);
        inp.removeEventListener('keydown', onKey);
        inp.remove();
      });
    },
  };
}
