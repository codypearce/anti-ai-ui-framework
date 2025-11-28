import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  constrainToBounds,
  type Position,
} from '../utils/randomPosition';
import {
  calculateEvasion,
  addEvasionJitter,
  isElementCornered,
  calculateEscapeRoute,
} from '../utils/evasionLogic';
import { componentLoggers } from '../utils/logger';

export interface RunawayButtonProps {
  speed?: number; // Speed multiplier for evasion movement
  evasionDistance?: number; // Distance at which evasion triggers (px)
  jitter?: number; // Random jitter to add to movement (px)
  onCatch?: (event: React.MouseEvent<HTMLButtonElement>) => void; // Called if user clicks it
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

function useRunawayButton(options: {
  speed: number;
  evasionDistance: number;
  jitter: number;
}) {
  const { speed, evasionDistance, jitter } = options;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [pos, setPos] = useState<Position>({ x: 0, y: 0 });
  const [initialized, setInitialized] = useState(false);
  const fearRef = useRef(0); // grows slightly as user approaches repeatedly

  const logger = useMemo(() => componentLoggers.runawayButton, []);

  // Initialize position roughly centered in container
  useEffect(() => {
    const container = containerRef.current;
    const btn = buttonRef.current;
    if (!container || !btn) return;

    const cRect = container.getBoundingClientRect();
    const bRect = btn.getBoundingClientRect();
    const x = Math.max(0, (cRect.width - bRect.width) / 2);
    const y = Math.max(0, (cRect.height - bRect.height) / 2);
    setPos({ x, y });
    setInitialized(true);
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const btn = buttonRef.current;
      if (!container || !btn) return;

      const cRect = container.getBoundingClientRect();
      const bRect = btn.getBoundingClientRect();

      const threat: Position = {
        x: e.clientX - cRect.left,
        y: e.clientY - cRect.top,
      };

      const result = calculateEvasion(
        { x: pos.x + bRect.width / 2, y: pos.y + bRect.height / 2 },
        threat,
        { evasionDistance, speed }
      );

      if (result.shouldEvade && result.newPosition) {
        // Convert from center-based back to top-left
        let next: Position = {
          x: result.newPosition.x - bRect.width / 2,
          y: result.newPosition.y - bRect.height / 2,
        };

        // Escalate fear near the cursor; reduce over time
        fearRef.current = Math.min(1, fearRef.current + 0.02);

        // If cornered, plan escape toward center
        if (isElementCornered(pos, cRect.width, cRect.height, 50)) {
          const escape = calculateEscapeRoute(pos, cRect.width, cRect.height);
          next = { x: escape.x, y: escape.y };
        }

        // Add jitter to be less predictable
        next = addEvasionJitter(next, jitter);

        // Constrain to container bounds
        const constrained = constrainToBounds(
          next,
          { minX: 0, minY: 0, maxX: Math.max(0, cRect.width - bRect.width), maxY: Math.max(0, cRect.height - bRect.height) }
        );

        setPos(constrained);
        logger.debug('Evading to', constrained);
      } else {
        // Cool down fear
        fearRef.current = Math.max(0, fearRef.current - 0.01);
      }
    },
    [evasionDistance, jitter, pos, speed, logger]
  );

  return { containerRef, buttonRef, pos, initialized, onMouseMove };
}

export const RunawayButton: React.FC<RunawayButtonProps> = ({
  speed = 1,
  evasionDistance = 120,
  jitter = 6,
  onCatch,
  className,
  style,
  children,
}) => {
  const { containerRef, buttonRef, pos, initialized, onMouseMove } = useRunawayButton({
    speed,
    evasionDistance,
    jitter,
  });

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      <button
        ref={buttonRef}
        className={className}
        style={{
          position: 'absolute',
          left: pos.x,
          top: pos.y,
          transition: initialized ? 'left 80ms linear, top 80ms linear' : undefined,
          ...style,
        }}
        onClick={(e) => onCatch?.(e)}
        type="button"
      >
        {children ?? 'Catch me'}
      </button>
    </div>
  );
};

