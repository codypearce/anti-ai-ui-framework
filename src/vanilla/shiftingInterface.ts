import { warnProductionUsage, componentLoggers } from '../utils/logger';

export interface ShiftingInterfaceOptions {
  shiftInterval?: number;
  duplicateChance?: number;
  colorChangeInterval?: number;
}

const colors = ['#0ea5e9', '#22c55e', '#ef4444', '#a855f7', '#f59e0b'];

export function makeShiftingInterface(container: HTMLElement, options: ShiftingInterfaceOptions = {}) {
  warnProductionUsage('ShiftingInterface (vanilla)');
  const logger = componentLoggers.shiftingInterface;
  const shiftInterval = options.shiftInterval ?? 1200;
  const duplicateChance = options.duplicateChance ?? 0.2;
  const colorChangeInterval = options.colorChangeInterval ?? 1800;

  container.style.position = 'relative';
  container.style.width = '380px';
  container.style.height = '220px';
  container.style.border = '1px dashed #94a3b8';
  container.style.borderRadius = '6px';

  type Item = { el: HTMLElement; id: string; left: number; top: number; color: string; type: 'input'|'password'|'button'; label: string };
  const items: Item[] = [];

  function addItem(id: string, label: string, type: Item['type'], left: number, top: number, color = colors[0]) {
    const wrap = document.createElement('div');
    wrap.style.position = 'absolute';
    wrap.style.left = `${left}px`;
    wrap.style.top = `${top}px`;
    wrap.style.transition = 'left 200ms linear, top 200ms linear';
    let inner: HTMLElement;
    if (type === 'button') {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.style.background = color;
      btn.style.color = '#fff';
      btn.style.border = '1px solid #0f172a';
      btn.style.padding = '6px 10px';
      inner = btn;
    } else {
      const labelEl = document.createElement('label');
      labelEl.style.display = 'flex';
      labelEl.style.gap = '6px';
      labelEl.style.alignItems = 'center';
      const span = document.createElement('span');
      span.textContent = label;
      span.style.color = '#334155';
      const input = document.createElement('input');
      input.type = type === 'password' ? 'password' : 'text';
      input.style.border = '1px solid #cbd5e1';
      input.style.padding = '6px 8px';
      labelEl.appendChild(span);
      labelEl.appendChild(input);
      inner = labelEl;
    }
    wrap.appendChild(inner);
    container.appendChild(wrap);
    items.push({ el: wrap, id, left, top, color, type, label });
  }

  addItem('username', 'Username', 'input', 30, 30, colors[0]);
  addItem('password', 'Password', 'password', 30, 80, colors[1]);
  addItem('submit', 'Login', 'button', 30, 130, colors[2]);

  const shiftTimer = window.setInterval(() => {
    items.forEach((it) => {
      it.left = Math.max(10, Math.min(320, it.left + (Math.random() - 0.5) * 120));
      it.top = Math.max(10, Math.min(180, it.top + (Math.random() - 0.5) * 60));
      it.el.style.left = `${it.left}px`;
      it.el.style.top = `${it.top}px`;
    });
    if (Math.random() < duplicateChance && items.length < 6) {
      const base = items[Math.floor(Math.random() * items.length)];
      addItem(`${base.id}-${Math.random().toString(36).slice(2,6)}`, base.label, base.type, base.left + 20, base.top + 10, base.color);
      logger.debug('Duplicated element');
    }
  }, shiftInterval);

  const colorTimer = window.setInterval(() => {
    items.forEach((it) => {
      if (it.type === 'button') {
        const btn = it.el.querySelector('button') as HTMLButtonElement | null;
        const c = colors[Math.floor(Math.random() * colors.length)];
        if (btn) btn.style.background = c;
      }
    });
  }, colorChangeInterval);

  return {
    destroy() {
      window.clearInterval(shiftTimer);
      window.clearInterval(colorTimer);
      container.innerHTML = '';
    },
  };
}

