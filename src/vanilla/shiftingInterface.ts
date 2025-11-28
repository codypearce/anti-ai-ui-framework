import { componentLoggers } from '../utils/logger';

export interface ShiftingInterfaceOptions {
  shiftInterval?: number;
  duplicateChance?: number;
  colorChangeInterval?: number;
  colors?: string[];
  maxDuplicates?: number;
}

const DEFAULT_COLORS = ['#0ea5e9', '#22c55e', '#ef4444', '#a855f7', '#f59e0b'];

export function makeShiftingInterface(container: HTMLElement, options: ShiftingInterfaceOptions = {}) {
  const logger = componentLoggers.shiftingInterface;
  const shiftInterval = options.shiftInterval ?? 1200;
  const duplicateChance = options.duplicateChance ?? 0.2;
  const colorChangeInterval = options.colorChangeInterval ?? 1800;
  const colors = options.colors ?? DEFAULT_COLORS;
  const maxDuplicates = options.maxDuplicates ?? 6;

  // Set default styles only if not already set
  if (!container.style.position || container.style.position === 'static') {
    container.style.position = 'relative';
  }
  if (!container.style.width) {
    container.style.width = '380px';
  }
  if (!container.style.height) {
    container.style.height = '220px';
  }
  if (!container.style.border) {
    container.style.border = '1px dashed #94a3b8';
  }
  if (!container.style.borderRadius) {
    container.style.borderRadius = '6px';
  }

  type Item = {
    wrapper: HTMLElement;
    contentElement: HTMLElement;
    id: string;
    left: number;
    top: number;
    colorIndex: number;
  };
  const items: Item[] = [];

  // Get container dimensions
  const getContainerDimensions = () => {
    const rect = container.getBoundingClientRect();
    return {
      width: rect.width || 380,
      height: rect.height || 220,
    };
  };

  // Clone existing children as initial items
  const existingChildren = Array.from(container.children);
  container.innerHTML = ''; // Clear container

  existingChildren.forEach((child, index) => {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = '30px';
    wrapper.style.top = `${30 + index * 50}px`;
    wrapper.style.transition = 'left 200ms linear, top 200ms linear';

    const clonedChild = child.cloneNode(true) as HTMLElement;
    wrapper.appendChild(clonedChild);
    container.appendChild(wrapper);

    items.push({
      wrapper,
      contentElement: clonedChild,
      id: `item-${index}`,
      left: 30,
      top: 30 + index * 50,
      colorIndex: index % colors.length,
    });
  });

  function applyColorToElement(element: HTMLElement, color: string) {
    if (element.tagName === 'BUTTON') {
      element.style.backgroundColor = color;
    } else if (element.tagName === 'INPUT') {
      element.style.borderColor = color;
    } else {
      element.style.color = color;
    }

    // Apply to children as well
    const buttons = element.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.style.backgroundColor = color;
    });

    const inputs = element.querySelectorAll('input');
    inputs.forEach((inp) => {
      inp.style.borderColor = color;
    });
  }

  function duplicateItem(baseItem: Item) {
    const wrapper = document.createElement('div');
    wrapper.style.position = 'absolute';
    wrapper.style.left = `${baseItem.left + 20}px`;
    wrapper.style.top = `${baseItem.top + 10}px`;
    wrapper.style.transition = 'left 200ms linear, top 200ms linear';

    const clonedContent = baseItem.contentElement.cloneNode(true) as HTMLElement;
    wrapper.appendChild(clonedContent);
    container.appendChild(wrapper);

    const newItem: Item = {
      wrapper,
      contentElement: clonedContent,
      id: `${baseItem.id}-${Math.random().toString(36).slice(2, 6)}`,
      left: baseItem.left + 20,
      top: baseItem.top + 10,
      colorIndex: baseItem.colorIndex,
    };

    items.push(newItem);
    logger.debug('Duplicated element', newItem.id);
  }

  const shiftTimer = window.setInterval(() => {
    const dims = getContainerDimensions();
    const maxLeft = dims.width - 60;
    const maxTop = dims.height - 40;

    items.forEach((it) => {
      it.left = Math.max(10, Math.min(maxLeft, it.left + (Math.random() - 0.5) * 120));
      it.top = Math.max(10, Math.min(maxTop, it.top + (Math.random() - 0.5) * 60));
      it.wrapper.style.left = `${it.left}px`;
      it.wrapper.style.top = `${it.top}px`;
    });

    if (Math.random() < duplicateChance && items.length < maxDuplicates) {
      const base = items[Math.floor(Math.random() * items.length)];
      duplicateItem(base);
    }
  }, shiftInterval);

  const colorTimer = window.setInterval(() => {
    items.forEach((it) => {
      it.colorIndex = Math.floor(Math.random() * colors.length);
      applyColorToElement(it.contentElement, colors[it.colorIndex]);
    });
  }, colorChangeInterval);

  // Apply initial colors
  items.forEach((it) => {
    applyColorToElement(it.contentElement, colors[it.colorIndex]);
  });

  return {
    destroy() {
      window.clearInterval(shiftTimer);
      window.clearInterval(colorTimer);
      container.innerHTML = '';
    },
  };
}

