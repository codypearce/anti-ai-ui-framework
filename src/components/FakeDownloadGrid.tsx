import React, { useMemo, useState } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props passed to renderRealButton
 */
export interface RenderRealButtonProps {
  onClick: () => void;
}

/**
 * Props passed to renderFakeButton
 */
export interface RenderFakeButtonProps {
  onClick: () => void;
  /** The button variant/style id (e.g., 'primary', 'mirror', 'sponsored') */
  variant: string;
  /** Index of this fake button */
  index: number;
}

export interface FakeDownloadGridProps {
  /** Number of fake buttons to display (real button is always included) */
  buttonCount?: number;
  /** Callback when the real download button is clicked */
  onRealClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Callback when a fake button is clicked */
  onFakeClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Custom render function for the real download button
   */
  renderRealButton?: (props: RenderRealButtonProps) => React.ReactNode;
  /**
   * Custom render function for fake download buttons
   */
  renderFakeButton?: (props: RenderFakeButtonProps) => React.ReactNode;
  /** Custom class name for the container */
  className?: string;
  /** Custom styles for the container */
  style?: React.CSSProperties;
}

// Button definitions - each is completely different
const buttonConfigs = [
  {
    id: 'primary',
    render: (onClick: () => void) => (
      <button
        key="primary"
        onClick={onClick}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '16px 24px',
          fontSize: '16px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
        }}
      >
        <span style={{ fontSize: '1.2em' }}>{'\u2B07'}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>DOWNLOAD NOW</span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>Free - Safe - Fast</span>
        </div>
      </button>
    ),
  },
  {
    id: 'mirror',
    wrapper: (child: React.ReactNode) => (
      <div key="mirror-box" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
        {child}
      </div>
    ),
    render: (onClick: () => void) => (
      <button
        key="mirror"
        onClick={onClick}
        style={{
          width: '100%',
          background: '#1e293b',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span>{'\uD83D\uDCE5'}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>Alternative Mirror</span>
          <span style={{ fontSize: '11px', opacity: 0.7 }}>Faster speeds</span>
        </div>
      </button>
    ),
  },
  {
    id: 'green',
    render: (onClick: () => void) => (
      <button
        key="green"
        onClick={onClick}
        style={{
          flex: 1,
          background: '#22c55e',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(34, 197, 94, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <span>{'\u25BC'}</span>
        FREE DOWNLOAD
        <span style={{ fontSize: '11px', opacity: 0.8 }}>2.4 MB</span>
      </button>
    ),
    groupWith: 'blue',
  },
  {
    id: 'blue',
    render: (onClick: () => void) => (
      <button
        key="blue"
        onClick={onClick}
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 3px 10px rgba(59, 130, 246, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <span>{'\u2B07'}</span>
        Download Now
      </button>
    ),
    groupWith: 'green',
  },
  {
    id: 'sponsored',
    wrapper: (child: React.ReactNode) => (
      <div key="sponsored-box" style={{ background: 'linear-gradient(135deg, #faf5ff, #f3e8ff)', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '12px', position: 'relative' as const }}>
        <span style={{ position: 'absolute', top: '-8px', left: '12px', background: '#a855f7', color: '#fff', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px' }}>RECOMMENDED</span>
        {child}
      </div>
    ),
    render: (onClick: () => void) => (
      <button
        key="sponsored"
        onClick={onClick}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #a855f7, #9333ea)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '14px 18px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <span>{'\uD83D\uDE80'}</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <span>Premium Download</span>
          <span style={{ fontSize: '11px', opacity: 0.85 }}>10x faster speeds</span>
        </div>
      </button>
    ),
  },
  {
    id: 'real',
    isReal: true,
    render: (onClick: () => void) => (
      <button
        key="real"
        onClick={onClick}
        style={{
          width: '100%',
          background: '#f1f5f9',
          color: '#475569',
          border: '1px solid #cbd5e1',
          borderRadius: '6px',
          padding: '10px 14px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
        }}
      >
        <span>{'\u2193'}</span>
        Download File
      </button>
    ),
  },
  {
    id: 'urgent',
    render: (onClick: () => void) => (
      <button
        key="urgent"
        onClick={onClick}
        style={{
          width: '100%',
          background: 'linear-gradient(135deg, #f97316, #ea580c)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '14px 18px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(249, 115, 22, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span style={{ background: '#dc2626', fontSize: '9px', padding: '2px 6px', borderRadius: '3px' }}>LIMITED TIME</span>
        <span>Download Free Premium Version</span>
      </button>
    ),
  },
  {
    id: 'minimal',
    render: (onClick: () => void) => (
      <button
        key="minimal"
        onClick={onClick}
        style={{
          background: 'transparent',
          color: '#3b82f6',
          border: 'none',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: 500,
          cursor: 'pointer',
          textDecoration: 'underline',
        }}
      >
        {'\u2193'} Download (Free)
      </button>
    ),
  },
  {
    id: 'gradient',
    render: (onClick: () => void) => (
      <button
        key="gradient"
        onClick={onClick}
        style={{
          width: '100%',
          background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
          color: '#fff',
          border: 'none',
          borderRadius: '6px',
          padding: '14px 18px',
          fontSize: '14px',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          position: 'relative' as const,
        }}
      >
        <span style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#22c55e', color: '#fff', fontSize: '9px', padding: '2px 5px', borderRadius: '3px', fontWeight: 700 }}>NEW</span>
        <span>{'\u26A1'}</span>
        INSTANT DOWNLOAD
      </button>
    ),
  },
];

export const FakeDownloadGrid: React.FC<FakeDownloadGridProps> = ({
  buttonCount = 8,
  onRealClick,
  onFakeClick,
  renderRealButton,
  renderFakeButton,
  className,
  style,
}) => {
  const logger = useMemo(() => componentLoggers.fakeDownloadGrid, []);

  // Shuffle buttons but always include the real one
  const [shuffledButtons] = useState(() => {
    const fakeButtons = buttonConfigs.filter(b => !b.isReal);
    const realButton = buttonConfigs.find(b => b.isReal)!;

    // Shuffle fakes
    const shuffled = [...fakeButtons].sort(() => Math.random() - 0.5);

    // Take the requested number of fake buttons
    const selected = shuffled.slice(0, Math.min(buttonCount - 1, shuffled.length));

    // Insert real button at a random position
    const realPosition = Math.floor(Math.random() * (selected.length + 1));
    selected.splice(realPosition, 0, realButton);

    return selected;
  });

  const handleClick = (config: typeof buttonConfigs[0]) => () => {
    if (config.isReal) {
      logger.info('Real download clicked');
      onRealClick?.({} as React.MouseEvent<HTMLButtonElement>);
    } else {
      logger.debug('Fake download clicked:', config.id);
      onFakeClick?.({} as React.MouseEvent<HTMLButtonElement>);
    }
  };

  // Default render for real button
  const defaultRenderRealButton = ({ onClick }: RenderRealButtonProps) => (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: '#f1f5f9',
        color: '#475569',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
        padding: '10px 14px',
        fontSize: '12px',
        fontWeight: 500,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
      }}
    >
      <span>{'\u2193'}</span>
      Download File
    </button>
  );

  // Group buttons that should be in a row together
  const renderButtons = () => {
    const elements: React.ReactNode[] = [];
    const processed = new Set<string>();
    let fakeIndex = 0;

    shuffledButtons.forEach((config) => {
      if (processed.has(config.id)) return;
      processed.add(config.id);

      // Handle real button with custom renderer
      if (config.isReal) {
        const realRenderer = renderRealButton ?? defaultRenderRealButton;
        elements.push(
          <React.Fragment key="real">
            {realRenderer({ onClick: handleClick(config) })}
          </React.Fragment>
        );
        return;
      }

      // Handle fake buttons with custom renderer
      if (renderFakeButton) {
        const currentIndex = fakeIndex++;
        elements.push(
          <React.Fragment key={config.id}>
            {renderFakeButton({
              onClick: handleClick(config),
              variant: config.id,
              index: currentIndex,
            })}
          </React.Fragment>
        );
        return;
      }

      // Default rendering for fake buttons (use built-in configs)
      // Check if this button should be grouped with another
      const groupWith = (config as any).groupWith;
      if (groupWith) {
        const partner = shuffledButtons.find(b => b.id === groupWith);
        if (partner && !processed.has(partner.id)) {
          processed.add(partner.id);
          elements.push(
            <div key={`row-${config.id}`} style={{ display: 'flex', gap: '8px' }}>
              {config.render(handleClick(config))}
              {partner.render(handleClick(partner))}
            </div>
          );
          return;
        }
      }

      // Render with wrapper if present
      const wrapper = (config as any).wrapper;
      if (wrapper) {
        elements.push(wrapper(config.render(handleClick(config))));
      } else {
        elements.push(config.render(handleClick(config)));
      }
    });

    // Add some content text between buttons
    const withContent: React.ReactNode[] = [];
    elements.forEach((el, i) => {
      withContent.push(el);
      if (i === 1) {
        withContent.push(
          <p key="content-1" style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            Click the download button above to get the latest version.
          </p>
        );
      }
    });

    return withContent;
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '16px',
        background: '#fff',
        borderRadius: '8px',
        ...style,
      }}
    >
      {renderButtons()}
    </div>
  );
};
