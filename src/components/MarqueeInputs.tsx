import React, { useEffect, useMemo, useRef, useState } from 'react';
import { componentLoggers } from '../utils/logger';

export type MarqueeDirection = 'left' | 'right';

export interface MarqueeInputsProps {
  count?: number; // number of input clones
  lanes?: number; // number of rows
  speed?: number; // pixels per second
  direction?: MarqueeDirection; // move left or right
  inputWidth?: number; // px
  placeholder?: string;
  className?: string; // applied to each input
  inputStyle?: React.CSSProperties; // applied to each input
  style?: React.CSSProperties; // container style
  onChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  initialValue?: string;
}

export const MarqueeInputs: React.FC<MarqueeInputsProps> = ({
  count = 6,
  lanes = 2,
  speed = 120,
  direction = 'right',
  inputWidth = 160,
  placeholder = 'Type while it moves…',
  className,
  inputStyle,
  style,
  onChange,
  onSubmit,
  initialValue = '',
}) => {
  const logger = useMemo(() => componentLoggers.marqueeInputs, []);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRefs = useRef<HTMLInputElement[]>([]);
  const positionsRef = useRef<{ x: number; lane: number }[]>([]);
  const rafRef = useRef<number | null>(null);
  const lastTsRef = useRef<number | null>(null);

  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    inputRefs.current.forEach((el) => {
      if (el) el.value = value;
    });
  }, [value]);

  useEffect(() => {
    const host = containerRef.current;
    if (!host) return;
    // Ensure positioning and overflow
    const cs = getComputedStyle(host);
    if (cs.position === 'static') host.style.position = 'relative';
    host.style.overflow = 'hidden';

    const rect = host.getBoundingClientRect();
    const width = rect.width || host.clientWidth || host.offsetWidth || window.innerWidth || 300;
    let height = rect.height || host.clientHeight || host.offsetHeight || 200;
    if (height < 10) height = 200;
    const laneHeight = height / (lanes + 1);

    // Initialize positions spaced across width and assigned to lanes
    const minX = inputWidth * 0.5;
    const maxX = Math.max(minX, width - inputWidth * 0.5);
    positionsRef.current = Array.from({ length: count }).map((_, i) => {
      const t = count > 1 ? i / (count - 1) : 0.5;
      const base = minX + t * (maxX - minX);
      const x = direction === 'right' ? base : maxX - (base - minX);
      const lane = i % lanes;
      return { x, lane };
    });

    lastTsRef.current = null;

    // Initial layout so inputs appear immediately before first RAF
    positionsRef.current.forEach((p, i) => {
      const el = inputRefs.current[i];
      if (el) {
        const top = (p.lane + 1) * laneHeight;
        el.style.position = 'absolute';
        el.style.left = `${p.x}px`;
        el.style.top = `${top}px`;
        el.style.transform = 'translate(-50%, -50%)';
        el.style.width = `${inputWidth}px`;
      }
    });

    const step = (ts: number) => {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - (lastTsRef.current || ts)) / 1000; // seconds
      lastTsRef.current = ts;

      const dx = speed * dt * (direction === 'right' ? 1 : -1);
      const positions = positionsRef.current;
      positions.forEach((p, i) => {
        p.x += dx;
        // wrap
        if (p.x > width + inputWidth) p.x = -inputWidth;
        if (p.x < -inputWidth) p.x = width + inputWidth;
        const el = inputRefs.current[i];
        if (el) {
          const top = (p.lane + 1) * laneHeight;
          el.style.position = 'absolute';
          el.style.left = `${p.x}px`;
          el.style.top = `${top}px`;
          el.style.transform = 'translate(-50%, -50%)';
          el.style.width = `${inputWidth}px`;
        }
      });

      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [count, lanes, speed, direction, inputWidth]);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            if (el) inputRefs.current[i] = el;
          }}
          className={className}
          placeholder={placeholder}
          defaultValue={initialValue}
          onInput={(e) => {
            const next = (e.target as HTMLInputElement).value;
            setValue(next);
            onChange?.(next);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              onSubmit?.(value);
              logger.debug('MarqueeInputs submit', { value });
            }
          }}
          style={{ ...inputStyle }}
        />
      ))}
    </div>
  );
};
