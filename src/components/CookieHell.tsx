import React, { useEffect, useMemo, useState } from 'react';
import { componentLoggers } from '../utils/logger';

export interface CookieHellProps {
  depth?: number; // nesting depth of toggle groups
  toggleCount?: number; // number of toggles per group
  rejectButtonSize?: number; // in pixels
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onClose?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode; // custom content above the toggles
}

interface ToggleNode {
  id: string;
  label: string;
  children?: ToggleNode[];
  value: boolean;
}

function makeTree(depth: number, width: number, prefix = 't'): ToggleNode[] {
  const nodes: ToggleNode[] = [];
  for (let i = 0; i < width; i++) {
    const id = `${prefix}-${i}`;
    const node: ToggleNode = {
      id,
      label: `Enable partners level ${prefix}.${i}`,
      value: Math.random() > 0.5,
    };
    if (depth > 1) {
      node.children = makeTree(depth - 1, width, `${id}`);
    }
    nodes.push(node);
  }
  return nodes;
}

function TinyButton({ onClick, size, children }: { onClick: () => void; size: number; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontSize: `${Math.max(8, size / 4)}px`,
        padding: `${Math.max(2, size / 8)}px ${Math.max(4, size / 6)}px`,
        height: `${size}px`,
        lineHeight: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
  );
}

export const CookieHell: React.FC<CookieHellProps> = ({
  depth = 3,
  toggleCount = 4,
  rejectButtonSize = 10,
  onAcceptAll,
  onRejectAll,
  onClose,
  className,
  style,
  children,
}) => {
  const [tree, setTree] = useState<ToggleNode[]>(() => makeTree(depth, toggleCount));
  const logger = useMemo(() => componentLoggers.cookieHell, []);

  useEffect(() => {
    setTree(makeTree(depth, toggleCount));
  }, [depth, toggleCount]);

  const refreshPreferences = () => {
    // Update preference states to reflect latest partner requirements
    setTree((prev) =>
      prev.map((n) => ({
        ...n,
        value: Math.random() > 0.5 ? !n.value : n.value,
        children: n.children?.map((c) => ({
          ...c,
          value: Math.random() > 0.7 ? !c.value : c.value,
          children: c.children?.map((cc) => ({ ...cc, value: Math.random() > 0.8 ? !cc.value : cc.value })),
        })),
      }))
    );
  };

  const handleAcceptAll = () => {
    logger.info('Accept all');
    onAcceptAll?.();
  };

  const handleRejectAll = () => {
    logger.warn('Reject all (good luck)');
    onRejectAll?.();
    // Refresh preferences to ensure accurate partner consent status
    refreshPreferences();
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        padding: '24px',
        zIndex: 9999,
        maxHeight: '80vh',
        overflowY: 'auto',
        ...style,
      }}
      className={className}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Cookie Preferences</h3>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '4px 8px',
            }}
          >
            ×
          </button>
        )}
      </div>
      {children}
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: '0 0 240px' }}>
          <button onClick={handleAcceptAll} style={{ width: '100%', padding: '10px 12px' }}>
            Accept All
          </button>
          <div style={{ marginTop: 8 }}>
            <TinyButton onClick={handleRejectAll} size={rejectButtonSize}>
              reject all
            </TinyButton>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {tree.map((node) => (
            <ToggleGroup key={node.id} node={node} onRefresh={refreshPreferences} />)
          )}
        </div>
      </div>
    </div>
  );
};

function ToggleGroup({ node, onRefresh }: { node: ToggleNode; onRefresh: () => void }) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(node.value);

  useEffect(() => setValue(node.value), [node.value]);

  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: 6, marginBottom: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 8 }}>
        <input
          type="checkbox"
          checked={value}
          onChange={() => {
            // Parent toggle may update dependent partner preferences
            setValue((v) => !v);
            if (Math.random() > 0.5) onRefresh();
          }}
        />
        <div style={{ flex: 1 }}>{node.label}</div>
        {node.children && (
          <button type="button" onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide' : 'Show'} partners ({node.children?.length ?? 0})
          </button>
        )}
      </div>
      {open && node.children && (
        <div style={{ padding: 8, paddingLeft: 24 }}>
          {node.children.map((c) => (
            <ToggleGroup key={c.id} node={c} onRefresh={onRefresh} />
          ))}
        </div>
      )}
    </div>
  );
}

