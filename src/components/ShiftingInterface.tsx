import React, { useEffect, useMemo, useRef, useState } from 'react';
import { warnProductionUsage, componentLoggers } from '../utils/logger';

export interface ShiftingInterfaceProps {
  shiftInterval?: number; // ms
  duplicateChance?: number; // 0-1
  colorChangeInterval?: number; // ms
}

type Item = { id: string; label: string; left: number; top: number; color: string };

const colors = ['#0ea5e9', '#22c55e', '#ef4444', '#a855f7', '#f59e0b'];

export const ShiftingInterface: React.FC<ShiftingInterfaceProps> = ({
  shiftInterval = 1200,
  duplicateChance = 0.2,
  colorChangeInterval = 1800,
}) => {
  const logger = useMemo(() => componentLoggers.shiftingInterface, []);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [items, setItems] = useState<Item[]>([
    { id: 'username', label: 'Username', left: 30, top: 30, color: colors[0] },
    { id: 'password', label: 'Password', left: 30, top: 80, color: colors[1] },
    { id: 'submit', label: 'Login', left: 30, top: 130, color: colors[2] },
  ]);

  useEffect(() => warnProductionUsage('ShiftingInterface'), []);

  useEffect(() => {
    const t = window.setInterval(() => {
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          left: Math.max(10, Math.min(320, it.left + (Math.random() - 0.5) * 120)),
          top: Math.max(10, Math.min(180, it.top + (Math.random() - 0.5) * 60)),
        }))
      );
      if (Math.random() < duplicateChance) {
        setItems((prev) => {
          const base = prev[Math.floor(Math.random() * prev.length)];
          const clone: Item = {
            ...base,
            id: `${base.id}-${Math.random().toString(36).slice(2, 6)}`,
            left: base.left + 20,
            top: base.top + 10,
          };
          logger.debug('Duplicated element', clone.id);
          return [...prev, clone].slice(-6);
        });
      }
    }, shiftInterval);
    return () => window.clearInterval(t);
  }, [duplicateChance, logger, shiftInterval]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setItems((prev) => prev.map((it) => ({ ...it, color: colors[Math.floor(Math.random() * colors.length)] })));
    }, colorChangeInterval);
    return () => window.clearInterval(t);
  }, [colorChangeInterval]);

  return (
    <div ref={hostRef} style={{ position: 'relative', width: 380, height: 220, border: '1px dashed #94a3b8', borderRadius: 6 }}>
      {items.map((it) => (
        <div key={it.id} style={{ position: 'absolute', left: it.left, top: it.top, transition: 'left 200ms linear, top 200ms linear' }}>
          {it.id.startsWith('submit') ? (
            <button type="button" style={{ background: it.color, color: '#fff', border: '1px solid #0f172a', padding: '6px 10px' }}>
              {it.label}
            </button>
          ) : (
            <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ color: '#334155' }}>{it.label}</span>
              <input type={it.id.includes('password') ? 'password' : 'text'} style={{ border: '1px solid #cbd5e1', padding: '6px 8px' }} />
            </label>
          )}
        </div>
      ))}
    </div>
  );
};

