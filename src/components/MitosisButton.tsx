import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { randomPosition, type Position } from '../utils/randomPosition';
import { warnProductionUsage, componentLoggers } from '../utils/logger';

export type RealIndexStrategy = 'rotate' | 'random';

export interface MitosisButtonProps {
  maxClones?: number; // Maximum number of clones present at once (excluding the real one)
  decayMs?: number; // Milliseconds after which clones disappear
  realIndexStrategy?: RealIndexStrategy; // How to choose next real index after interactions
  initialClones?: number; // How many clones to spawn on mount (for immediate chaos)
  shuffleIntervalMs?: number; // How often to reassign the real button (0 = disabled)
  realStartsRandom?: boolean; // If true and there are clones initially, the real button starts at a random index
  onRealClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFakeClick?: (event: React.MouseEvent<HTMLButtonElement>, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface CloneDef {
  id: number;
  createdAt: number;
  pos: Position; // percent-based within container (0-100)
}

let __cloneId = 1;

export const MitosisButton: React.FC<MitosisButtonProps> = ({
  maxClones = 8,
  decayMs = 6000,
  realIndexStrategy = 'rotate',
  initialClones = 0,
  shuffleIntervalMs = 0,
  realStartsRandom = false,
  onRealClick,
  onFakeClick,
  className,
  style,
  children,
}) => {
  useEffect(() => {
    warnProductionUsage('MitosisButton');
  }, []);

  const logger = useMemo(() => componentLoggers.semanticGaslighting, []); // reuse existing logger namespace
  const [clones, setClones] = useState<CloneDef[]>(() => {
    const toAdd = Math.max(0, Math.min(initialClones, maxClones));
    const now = Date.now();
    return Array.from({ length: toAdd }).map(() => ({
      id: __cloneId++,
      createdAt: now,
      pos: randomPosition({ minX: 10, maxX: 90, minY: 10, maxY: 90 }),
    }));
  });
  const [realIndex, setRealIndex] = useState<number>(() => {
    const total = 1 + Math.max(0, Math.min(initialClones, maxClones));
    if (realStartsRandom && total > 1) {
      return Math.floor(Math.random() * total);
    }
    return 0; // seed is real initially
  });
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Periodically decay old clones
  useEffect(() => {
    if (decayMs <= 0) return;
    const iv = setInterval(() => {
      const now = Date.now();
      setClones((prev) => prev.filter((c) => now - c.createdAt < decayMs));
    }, Math.min(500, Math.max(200, Math.floor(decayMs / 6))));
    return () => clearInterval(iv);
  }, [decayMs]);

  const addClone = useCallback(() => {
    setClones((prev) => {
      if (prev.length >= maxClones) return prev;
      // choose a random percent-based position with padding
      const pos = randomPosition({ minX: 10, maxX: 90, minY: 10, maxY: 90 });
      const next: CloneDef = { id: __cloneId++, createdAt: Date.now(), pos };
      return [...prev, next];
    });
  }, [maxClones]);

  const pickNextRealIndex = useCallback(
    (current: number, totalButtons: number) => {
      if (realIndexStrategy === 'rotate') {
        return (current + 1) % totalButtons;
      }
      // random
      return Math.floor(Math.random() * totalButtons);
    },
    [realIndexStrategy]
  );

  // Note: initial clones are created synchronously in state initializer above

  // Periodically shuffle which button is real
  useEffect(() => {
    if (shuffleIntervalMs > 0) {
      const iv = setInterval(() => {
        const total = clones.length + 1;
        if (total > 1) {
          setRealIndex((curr) => pickNextRealIndex(curr, total));
        }
      }, shuffleIntervalMs);
      return () => clearInterval(iv);
    }
    return undefined;
  }, [clones.length, shuffleIntervalMs, pickNextRealIndex]);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, index: number) => {
      const total = clones.length + 1;
      const isReal = index === realIndex;
      if (isReal) {
        onRealClick?.(e);
      } else {
        onFakeClick?.(e, index);
      }

      addClone();
      const nextTotal = Math.min(total + 1, maxClones + 1);
      setRealIndex((curr) => pickNextRealIndex(curr, nextTotal));
      logger.debug('MitosisButton click', { isReal, total: nextTotal });
    },
    [addClone, clones.length, realIndex, onRealClick, onFakeClick, pickNextRealIndex, maxClones, logger]
  );

  // Build render list: seed first, then clones
  const buttons = useMemo(() => {
    const list: { key: string; pos: Position; isSeed: boolean }[] = [];
    // Seed button position: center by default (50, 50)
    list.push({ key: 'seed', pos: { x: 50, y: 50 }, isSeed: true });
    clones.forEach((c) => list.push({ key: String(c.id), pos: c.pos, isSeed: false }));
    return list;
  }, [clones]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      {buttons.map((btn, i) => {
        const real = i === realIndex;
        return (
          <button
            key={btn.key}
            className={className}
            style={{
              position: 'absolute',
              left: `${btn.pos.x}%`,
              top: `${btn.pos.y}%`,
              transform: 'translate(-50%, -50%)',
              ...style,
            }}
            data-testid={real ? 'mitosis-real' : undefined}
            onClick={(e) => handleClick(e, i)}
            type="button"
          >
            {children ?? 'Click me'}
          </button>
        );
      })}
    </div>
  );
};
