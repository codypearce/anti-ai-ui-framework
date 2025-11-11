import React, { useEffect, useMemo, useState } from 'react';
import { warnProductionUsage, componentLoggers } from '../utils/logger';

export interface PopupChaosProps {
  popupCount?: number;
  closeOrder?: number[]; // indices in the order they must be closed
  onAllClosed?: () => void;
}

interface PopupData {
  id: number;
  left: number;
  top: number;
  z: number;
}

export const PopupChaos: React.FC<PopupChaosProps> = ({
  popupCount = 4,
  closeOrder,
  onAllClosed,
}) => {
  const logger = useMemo(() => componentLoggers.popupChaos, []);
  const [popups, setPopups] = useState<PopupData[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [expectedIdx, setExpectedIdx] = useState(0);
  const [deniedId, setDeniedId] = useState<number | null>(null);

  useEffect(() => warnProductionUsage('PopupChaos'), []);

  useEffect(() => {
    // Initialize random positions and stacking
    const arr: PopupData[] = Array.from({ length: popupCount }).map((_, i) => ({
      id: i,
      left: 40 + Math.random() * 300,
      top: 40 + Math.random() * 120,
      z: 100 + i,
    }));
    setPopups(arr);
    if (closeOrder && closeOrder.length === popupCount) {
      setOrder(closeOrder);
    } else {
      const ids = arr.map((p) => p.id);
      // default: random order
      for (let i = ids.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      setOrder(ids);
    }
    setExpectedIdx(0);
  }, [popupCount, closeOrder]);

  const handleClose = (id: number) => () => {
    const expected = order[expectedIdx];
    if (id !== expected) {
      // deny close attempt; briefly mark the popup for a shake effect
      setDeniedId(id);
      setTimeout(() => setDeniedId(null), 300);
      logger.warn(`Wrong order: expected ${expected}, got ${id}`);
      return;
    }
    setPopups((prev) => prev.filter((p) => p.id !== id));
    const next = expectedIdx + 1;
    if (next >= order.length) {
      logger.info('All popups closed in correct order');
      onAllClosed?.();
    } else {
      setExpectedIdx(next);
    }
  };

  if (popups.length === 0) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9998 }}>
      {popups.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: p.left,
            top: p.top,
            zIndex: p.z,
            width: 280,
            pointerEvents: 'auto',
            transition: 'transform 150ms ease',
            transform: deniedId === p.id ? 'translateX(4px)' : 'none',
            background: '#fff',
            color: '#0f172a',
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
            borderRadius: 8,
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>Important Notice #{p.id + 1}</strong>
            <button type="button" onClick={handleClose(p.id)}>✕</button>
          </div>
          <div style={{ padding: 10 }}>
            <p style={{ margin: 0 }}>Please read and acknowledge this modal to continue.</p>
          </div>
        </div>
      ))}
    </div>
  );
};

