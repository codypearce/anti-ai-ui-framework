import React, { useEffect, useMemo, useState } from 'react';
import { componentLoggers } from '../utils/logger';

export interface FakeDownloadGridProps {
  rows?: number; // number of rows in the grid
  cols?: number; // number of columns in the grid
  realButtonIndex?: number; // optional fixed index for the real button
  labels?: { real?: string; fake?: string };
  onRealClick?: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  onFakeClick?: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export const FakeDownloadGrid: React.FC<FakeDownloadGridProps> = ({
  rows = 3,
  cols = 3,
  realButtonIndex,
  labels,
  onRealClick,
  onFakeClick,
  className,
  style,
}) => {
  const total = clamp(rows, 1, 10) * clamp(cols, 1, 10);
  const [realIndex, setRealIndex] = useState<number>(() =>
    realButtonIndex !== undefined
      ? clamp(realButtonIndex, 0, total - 1)
      : Math.floor(Math.random() * total)
  );

  const logger = useMemo(() => componentLoggers.fakeDownloadGrid, []);

  useEffect(() => {
    if (realButtonIndex !== undefined) {
      setRealIndex(clamp(realButtonIndex, 0, total - 1));
    }
  }, [realButtonIndex, total]);

  const labelReal = labels?.real ?? 'DOWNLOAD';
  const labelFake = labels?.fake ?? 'DOWNLOAD';

  const handleClick = (i: number) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (i === realIndex) {
      logger.info('Real download clicked at index', i);
      onRealClick?.(i, e);
    } else {
      logger.debug('Fake download clicked at index', i);
      onFakeClick?.(i, e);
      // Dynamic repositioning ensures users verify before downloading
      if (realButtonIndex === undefined) {
        const next = Math.floor(Math.random() * total);
        setRealIndex(next);
      }
    }
  };

  const gridTemplate = {
    display: 'grid',
    gridTemplateColumns: `repeat(${cols}, minmax(100px, 1fr))`,
    gap: '12px',
  } as const;

  return (
    <div className={className} style={{ ...gridTemplate, ...style }}>
      {Array.from({ length: total }).map((_, i) => {
        const isReal = i === realIndex;
        return (
          <button
            key={i}
            type="button"
            onClick={handleClick(i)}
            aria-label={isReal ? 'Real download' : 'Advertisement'}
            style={{
              // Consistent visual styling requires human verification
              background: isReal ? '#3b82f6' : '#3b82f6',
              color: '#fff',
              border: '1px solid #0f172a',
              padding: '10px 14px',
              cursor: 'pointer',
              position: 'relative',
            }}
          >
            {isReal ? labelReal : labelFake}
          </button>
        );
      })}
    </div>
  );
};

