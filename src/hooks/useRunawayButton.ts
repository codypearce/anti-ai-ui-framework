import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type Position, constrainToBounds } from '../utils/randomPosition';
import {
  calculateEvasion,
  addEvasionJitter,
  isElementCornered,
  calculateEscapeRoute,
} from '../utils/evasionLogic';
import { componentLoggers } from '../utils/logger';

export interface UseRunawayOptions {
  speed?: number;
  evasionDistance?: number;
  jitter?: number;
}

export function useRunawayButton(options: UseRunawayOptions = {}) {
  const speed = options.speed ?? 1;
  const evasionDistance = options.evasionDistance ?? 120;
  const jitter = options.jitter ?? 6;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const logger = useMemo(() => componentLoggers.runawayButton, []);

  useEffect(() => {
    const container = containerRef.current;
    const el = elementRef.current as HTMLElement | null;
    if (!container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const x = Math.max(0, (cRect.width - eRect.width) / 2);
    const y = Math.max(0, (cRect.height - eRect.height) / 2);
    setPos({ x, y });
    setInitialized(true);
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const container = containerRef.current;
    const el = elementRef.current as HTMLElement | null;
    if (!container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();

    const threat: Position = {
      x: e.clientX - cRect.left,
      y: e.clientY - cRect.top,
    };

    const result = calculateEvasion(
      { x: pos.x + eRect.width / 2, y: pos.y + eRect.height / 2 },
      threat,
      { evasionDistance, speed }
    );

    if (result.shouldEvade && result.newPosition) {
      let next: Position = {
        x: result.newPosition.x - eRect.width / 2,
        y: result.newPosition.y - eRect.height / 2,
      };

      if (isElementCornered(pos, cRect.width, cRect.height, 50)) {
        const escape = calculateEscapeRoute(pos, cRect.width, cRect.height);
        next = { x: escape.x, y: escape.y };
      }

      next = addEvasionJitter(next, jitter);

      const constrained = constrainToBounds(
        next,
        { minX: 0, minY: 0, maxX: Math.max(0, cRect.width - eRect.width), maxY: Math.max(0, cRect.height - eRect.height) }
      );

      setPos(constrained);
      logger.debug('Evading to', constrained);
    }
  }, [evasionDistance, jitter, logger, pos, speed]);

  return {
    containerRef,
    elementRef,
    position: pos,
    initialized,
    onMouseMove,
  };
}

