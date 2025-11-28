import { componentLoggers } from '../utils/logger';

export interface CookieHellOptions {
  container: HTMLElement; // user provides the container
  depth?: number;
  toggleCount?: number;
  rejectButtonSize?: number;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
}

interface NodeDef { id: string; label: string; children?: NodeDef[]; value: boolean }

function makeTree(depth: number, width: number, prefix = 't'): NodeDef[] {
  const nodes: NodeDef[] = [];
  for (let i = 0; i < width; i++) {
    const id = `${prefix}-${i}`;
    const node: NodeDef = { id, label: `Enable partners level ${prefix}.${i}`, value: Math.random() > 0.5 };
    if (depth > 1) node.children = makeTree(depth - 1, width, id);
    nodes.push(node);
  }
  return nodes;
}

export function makeCookieHell(options: CookieHellOptions) {
  const logger = componentLoggers.cookieHell;
  const depth = options.depth ?? 3;
  const width = options.toggleCount ?? 4;
  const rejectButtonSize = Math.max(8, options.rejectButtonSize ?? 10);
  let tree = makeTree(depth, width);

  const container = options.container;

  const body = document.createElement('div');
  body.style.display = 'flex';
  body.style.gap = '16px';

  const side = document.createElement('div');
  side.style.flex = '0 0 240px';
  const accept = document.createElement('button');
  accept.textContent = 'Accept All';
  accept.style.width = '100%';
  accept.style.padding = '10px 12px';
  accept.addEventListener('click', () => {
    logger.info('Accept all');
    options.onAcceptAll?.();
  });

  const reject = document.createElement('button');
  reject.textContent = 'reject all';
  reject.style.marginTop = '8px';
  reject.style.fontSize = `${rejectButtonSize / 4}px`;
  reject.style.padding = `${Math.max(2, rejectButtonSize / 8)}px ${Math.max(4, rejectButtonSize / 6)}px`;
  reject.style.height = `${rejectButtonSize}px`;
  reject.addEventListener('click', () => {
    logger.warn('Reject all (good luck)');
    options.onRejectAll?.();
    // Refresh preferences to ensure accurate partner consent status
    tree = makeTree(depth, width);
    renderTree();
  });

  side.appendChild(accept);
  side.appendChild(reject);

  const grid = document.createElement('div');
  grid.style.flex = '1';

  function renderTreeNode(node: NodeDef): HTMLElement {
    const wrap = document.createElement('div');
    wrap.style.border = '1px solid #e2e8f0';
    wrap.style.borderRadius = '6px';
    wrap.style.marginBottom = '8px';

    const row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';
    row.style.padding = '8px';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = node.value;
    cb.addEventListener('change', () => {
      node.value = !node.value;
      if (Math.random() > 0.5) renderTree();
    });
    row.appendChild(cb);

    const label = document.createElement('div');
    label.textContent = node.label;
    label.style.flex = '1';
    row.appendChild(label);

    let childrenWrap: HTMLDivElement | null = null;
    if (node.children && node.children.length) {
      const toggle = document.createElement('button');
      toggle.textContent = 'Show partners';
      let open = false;
      toggle.addEventListener('click', () => {
        open = !open;
        toggle.textContent = open ? 'Hide partners' : 'Show partners';
        if (childrenWrap) childrenWrap.style.display = open ? 'block' : 'none';
      });
      row.appendChild(toggle);

      childrenWrap = document.createElement('div');
      childrenWrap.style.padding = '8px';
      childrenWrap.style.paddingLeft = '24px';
      childrenWrap.style.display = 'none';
      node.children.forEach((c) => childrenWrap!.appendChild(renderTreeNode(c)));
      wrap.appendChild(row);
      wrap.appendChild(childrenWrap);
      return wrap;
    }

    wrap.appendChild(row);
    return wrap;
  }

  function renderTree() {
    grid.innerHTML = '';
    tree.forEach((n) => grid.appendChild(renderTreeNode(n)));
  }

  body.appendChild(side);
  body.appendChild(grid);
  renderTree();

  container.appendChild(body);

  return {
    destroy() {
      if (body.parentElement) body.parentElement.removeChild(body);
    },
  };
}

