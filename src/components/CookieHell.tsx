import React, { useEffect, useMemo, useState } from 'react';
import { warnProductionUsage, componentLoggers } from '../utils/logger';

export interface CookieHellProps {
  depth?: number; // nesting depth of toggle groups
  toggleCount?: number; // number of toggles per group
  rejectButtonSize?: number; // in pixels
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onClose?: () => void;
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
}) => {
  const [open, setOpen] = useState(true);
  const [tree, setTree] = useState<ToggleNode[]>(() => makeTree(depth, toggleCount));
  const logger = useMemo(() => componentLoggers.cookieHell, []);

  useEffect(() => {
    warnProductionUsage('CookieHell');
  }, []);

  useEffect(() => {
    setTree(makeTree(depth, toggleCount));
  }, [depth, toggleCount]);

  const setRandomChaos = () => {
    // randomly flip some toggles to add chaos
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
    setOpen(false);
    onClose?.();
  };

  const handleRejectAll = () => {
    logger.warn('Reject all (good luck)');
    onRejectAll?.();
    // mischievous behavior: do not close, just shuffle toggles
    setRandomChaos();
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.66)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: '#fff',
          color: '#0f172a',
          width: 'min(90vw, 900px)',
          maxHeight: '85vh',
          overflow: 'auto',
          borderRadius: 8,
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}>
          <h2 style={{ margin: 0 }}>Your Privacy Is Important (To Us)</h2>
          <p style={{ margin: '8px 0 0' }}>
            We and 413 of our closest partners use cookies for reasons.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16, padding: 16 }}>
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
              <ToggleGroup key={node.id} node={node} onChaos={setRandomChaos} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

function ToggleGroup({ node, onChaos }: { node: ToggleNode; onChaos: () => void }) {
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
            // contradictory: toggling a parent may flip children randomly
            setValue((v) => !v);
            if (Math.random() > 0.5) onChaos();
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
            <ToggleGroup key={c.id} node={c} onChaos={onChaos} />
          ))}
        </div>
      )}
    </div>
  );
}

