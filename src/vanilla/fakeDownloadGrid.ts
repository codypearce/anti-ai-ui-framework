import { componentLoggers } from '../utils/logger';

export interface RenderButtonProps {
  onClick: (ev: MouseEvent) => void;
  index: number;
}

export interface FakeDownloadGridOptions {
  /** Number of fake buttons to display (real button is always included) */
  buttonCount?: number;
  /** Callback when the real download button is clicked */
  onRealClick?: (ev: MouseEvent) => void;
  /** Callback when a fake button is clicked */
  onFakeClick?: (ev: MouseEvent) => void;
  /** Custom render function for the real download button */
  renderRealButton?: (props: RenderButtonProps) => HTMLElement;
  /** Custom render function for fake download buttons */
  renderFakeButton?: (props: RenderButtonProps) => HTMLElement;
}

type ButtonConfig = {
  id: string;
  isReal?: boolean;
  groupWith?: string;
  createWrapper?: () => HTMLElement;
  create: (onClick: (ev: MouseEvent) => void) => HTMLElement;
};

function createButton(styles: Partial<CSSStyleDeclaration>, content: string | HTMLElement): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  Object.assign(btn.style, styles);
  if (typeof content === 'string') {
    btn.innerHTML = content;
  } else {
    btn.appendChild(content);
  }
  return btn;
}

const buttonConfigs: ButtonConfig[] = [
  {
    id: 'primary',
    create: (onClick) => {
      const btn = createButton({
        width: '100%',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        padding: '16px 24px',
        fontSize: '16px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
      }, `<span style="font-size:1.2em">\u2B07</span><div style="display:flex;flex-direction:column;align-items:flex-start"><span>DOWNLOAD NOW</span><span style="font-size:11px;opacity:0.85">Free - Safe - Fast</span></div>`);
      btn.onclick = onClick;
      return btn;
    },
  },
  {
    id: 'mirror',
    createWrapper: () => {
      const wrapper = document.createElement('div');
      Object.assign(wrapper.style, {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '12px',
      });
      return wrapper;
    },
    create: (onClick) => {
      const btn = createButton({
        width: '100%',
        background: '#1e293b',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '12px 16px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }, `<span>\uD83D\uDCE5</span><div style="display:flex;flex-direction:column;align-items:flex-start"><span>Alternative Mirror</span><span style="font-size:11px;opacity:0.7">Faster speeds</span></div>`);
      btn.onclick = onClick;
      return btn;
    },
  },
  {
    id: 'green',
    groupWith: 'blue',
    create: (onClick) => {
      const btn = createButton({
        flex: '1',
        background: '#22c55e',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '12px 16px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 3px 10px rgba(34, 197, 94, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }, `<span>\u25BC</span>FREE DOWNLOAD<span style="font-size:11px;opacity:0.8">2.4 MB</span>`);
      btn.onclick = onClick;
      return btn;
    },
  },
  {
    id: 'blue',
    groupWith: 'green',
    create: (onClick) => {
      const btn = createButton({
        flex: '1',
        background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '12px 16px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 3px 10px rgba(59, 130, 246, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }, `<span>\u2B07</span>Download Now`);
      btn.onclick = onClick;
      return btn;
    },
  },
  {
    id: 'sponsored',
    createWrapper: () => {
      const wrapper = document.createElement('div');
      Object.assign(wrapper.style, {
        background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)',
        border: '1px solid #e9d5ff',
        borderRadius: '8px',
        padding: '12px',
        position: 'relative',
      });
      const label = document.createElement('span');
      Object.assign(label.style, {
        position: 'absolute',
        top: '-8px',
        left: '12px',
        background: '#a855f7',
        color: '#fff',
        fontSize: '9px',
        fontWeight: '700',
        padding: '2px 6px',
        borderRadius: '3px',
      });
      label.textContent = 'RECOMMENDED';
      wrapper.appendChild(label);
      return wrapper;
    },
    create: (onClick) => {
      const btn = createButton({
        width: '100%',
        background: 'linear-gradient(135deg, #a855f7, #9333ea)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '14px 18px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }, `<span>\uD83D\uDE80</span><div style="display:flex;flex-direction:column;align-items:flex-start"><span>Premium Download</span><span style="font-size:11px;opacity:0.85">10x faster speeds</span></div>`);
      btn.onclick = onClick;
      return btn;
    },
  },
  {
    id: 'real',
    isReal: true,
    create: (onClick) => {
      const btn = createButton({
        width: '100%',
        background: '#f1f5f9',
        color: '#475569',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        padding: '10px 14px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }, `<span>\u2193</span>Download File`);
      btn.onclick = onClick;
      return btn;
    },
  },
  {
    id: 'urgent',
    create: (onClick) => {
      const btn = createButton({
        width: '100%',
        background: 'linear-gradient(135deg, #f97316, #ea580c)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '14px 18px',
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
      }, `<span style="background:#dc2626;font-size:9px;padding:2px 6px;border-radius:3px">LIMITED TIME</span><span>Download Free Premium Version</span>`);
      btn.onclick = onClick;
      return btn;
    },
  },
  {
    id: 'minimal',
    create: (onClick) => {
      const btn = createButton({
        background: 'transparent',
        color: '#3b82f6',
        border: 'none',
        padding: '8px 12px',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        textDecoration: 'underline',
      }, `\u2193 Download (Free)`);
      btn.onclick = onClick;
      return btn;
    },
  },
  {
    id: 'gradient',
    create: (onClick) => {
      const btn = createButton({
        width: '100%',
        background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        padding: '14px 18px',
        fontSize: '14px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        position: 'relative',
      }, `<span style="position:absolute;top:-6px;right:-6px;background:#22c55e;color:#fff;font-size:9px;padding:2px 5px;border-radius:3px;font-weight:700">NEW</span><span>\u26A1</span>INSTANT DOWNLOAD`);
      btn.onclick = onClick;
      return btn;
    },
  },
];

export function makeFakeDownloadGrid(
  container: HTMLElement,
  options: FakeDownloadGridOptions = {}
) {
  const logger = componentLoggers.fakeDownloadGrid;
  const buttonCount = options.buttonCount ?? 8;

  // Setup container styles
  Object.assign(container.style, {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    background: '#fff',
    borderRadius: '8px',
  });

  // Shuffle buttons but always include the real one
  const fakeButtons = buttonConfigs.filter(b => !b.isReal);
  const realButton = buttonConfigs.find(b => b.isReal)!;

  const shuffled = [...fakeButtons].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(buttonCount - 1, shuffled.length));

  const realPosition = Math.floor(Math.random() * (selected.length + 1));
  selected.splice(realPosition, 0, realButton);

  const handleClick = (config: ButtonConfig) => (ev: MouseEvent) => {
    if (config.isReal) {
      logger.info('Real download clicked');
      options.onRealClick?.(ev);
    } else {
      logger.debug('Fake download clicked:', config.id);
      options.onFakeClick?.(ev);
    }
  };

  // If custom renderers provided, use simple grid layout
  if (options.renderRealButton || options.renderFakeButton) {
    let fakeIndex = 0;
    selected.forEach((config, index) => {
      let element: HTMLElement;
      if (config.isReal && options.renderRealButton) {
        element = options.renderRealButton({ onClick: handleClick(config), index });
      } else if (!config.isReal && options.renderFakeButton) {
        element = options.renderFakeButton({ onClick: handleClick(config), index: fakeIndex++ });
      } else {
        element = config.create(handleClick(config));
      }
      container.appendChild(element);
    });
    return {
      destroy() {
        container.innerHTML = '';
      },
    };
  }

  // Render buttons with default styling
  const processed = new Set<string>();
  let elementCount = 0;

  selected.forEach((config) => {
    if (processed.has(config.id)) return;
    processed.add(config.id);

    // Check if this button should be grouped with another
    if (config.groupWith) {
      const partner = selected.find(b => b.id === config.groupWith);
      if (partner && !processed.has(partner.id)) {
        processed.add(partner.id);
        const row = document.createElement('div');
        Object.assign(row.style, { display: 'flex', gap: '8px' });
        row.appendChild(config.create(handleClick(config)));
        row.appendChild(partner.create(handleClick(partner)));
        container.appendChild(row);
        elementCount++;
        return;
      }
    }

    // Render with wrapper if present
    if (config.createWrapper) {
      const wrapper = config.createWrapper();
      wrapper.appendChild(config.create(handleClick(config)));
      container.appendChild(wrapper);
    } else {
      container.appendChild(config.create(handleClick(config)));
    }
    elementCount++;

    // Add content text after second element
    if (elementCount === 2) {
      const p = document.createElement('p');
      Object.assign(p.style, { margin: '0', fontSize: '13px', color: '#64748b' });
      p.textContent = 'Click the download button above to get the latest version.';
      container.appendChild(p);
    }
  });

  return {
    destroy() {
      container.innerHTML = '';
    },
  };
}
