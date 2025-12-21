import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { randomPosition } from '../utils/randomPosition';
import { componentLoggers } from '../utils/logger';

export interface RenderButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

export interface MitosisButtonProps {
  /**
   * Initial number of buttons to start with
   * Default: 6
   */
  initialCount?: number;
  /**
   * Maximum number of buttons allowed. When reached, oldest buttons are removed on new spawns.
   * Default: 20
   */
  maxButtons?: number;
  /**
   * Number of new buttons to spawn when clicking a fake button
   * Default: 2
   */
  multiplyBy?: number;
  /**
   * Speed of button drift (0 = no movement, 1 = fast)
   * Default: 0.15
   */
  driftSpeed?: number;
  /**
   * Interval in ms for auto-spawning new buttons (0 = disabled)
   * Default: 1200
   */
  autoSpawnInterval?: number;
  /**
   * Callback when a fake button is clicked (spawns more buttons)
   */
  onFakeClick?: (event: React.MouseEvent<HTMLButtonElement>, buttonId: number) => void;
  /**
   * Callback when the real button is clicked (user wins)
   */
  onWin?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Custom render function for buttons. Use this to render your own button component.
   * The function receives onClick, style, className, and children props that must be applied.
   */
  renderButton?: (props: RenderButtonProps) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface ButtonState {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
}

let __buttonId = 1;

function randomVelocity(speed: number) {
  const angle = Math.random() * Math.PI * 2;
  return {
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

export const MitosisButton: React.FC<MitosisButtonProps> = ({
  initialCount = 6,
  maxButtons = 20,
  multiplyBy = 2,
  driftSpeed = 0.15,
  autoSpawnInterval = 1200,
  onFakeClick,
  onWin,
  renderButton,
  className,
  style,
  children,
}) => {
  const logger = useMemo(() => componentLoggers.mitosisButton, []);

  const [buttons, setButtons] = useState<ButtonState[]>(() => {
    return Array.from({ length: initialCount }).map(() => {
      const pos = randomPosition({ minX: 10, maxX: 90, minY: 10, maxY: 90 });
      const vel = randomVelocity(driftSpeed);
      return {
        id: __buttonId++,
        x: pos.x,
        y: pos.y,
        vx: vel.vx,
        vy: vel.vy,
        scale: 1,
        opacity: 1,
      };
    });
  });

  // Track which button is the "real" one (index into buttons array)
  const [realIndex, setRealIndex] = useState(() => Math.floor(Math.random() * initialCount));

  const animationRef = useRef<number | null>(null);
  const buttonsRef = useRef(buttons);
  buttonsRef.current = buttons;

  // Shuffle which button is real
  const shuffleRealIndex = useCallback((buttonCount: number) => {
    const newIndex = Math.floor(Math.random() * buttonCount);
    setRealIndex(newIndex);
    return newIndex;
  }, []);

  // Animation loop for drifting
  useEffect(() => {
    if (driftSpeed <= 0) return;
    if (typeof window === 'undefined') return;

    const animate = () => {
      setButtons((prev) =>
        prev.map((btn) => {
          let { x, y, vx, vy } = btn;

          // Update position
          x += vx;
          y += vy;

          // Bounce off edges
          if (x < 10 || x > 90) {
            vx *= -1;
            x = Math.max(10, Math.min(90, x));
          }
          if (y < 10 || y > 90) {
            vy *= -1;
            y = Math.max(10, Math.min(90, y));
          }

          // Occasionally change direction
          if (Math.random() < 0.005) {
            const newVel = randomVelocity(driftSpeed);
            vx = newVel.vx;
            vy = newVel.vy;
          }

          return { ...btn, x, y, vx, vy };
        })
      );

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [driftSpeed]);

  // Auto-spawn timer
  useEffect(() => {
    if (autoSpawnInterval <= 0) return;
    if (typeof window === 'undefined') return;

    const timer = setInterval(() => {
      setButtons((prev) => {
        // Pick a random parent to spawn from
        const parent = prev[Math.floor(Math.random() * prev.length)];
        if (!parent) return prev;

        const vel = randomVelocity(driftSpeed);
        const angle = Math.random() * Math.PI * 2;
        const pushDist = 8;

        const newButton: ButtonState = {
          id: __buttonId++,
          x: Math.max(10, Math.min(90, parent.x + Math.cos(angle + Math.PI) * pushDist)),
          y: Math.max(10, Math.min(90, parent.y + Math.sin(angle + Math.PI) * pushDist)),
          vx: vel.vx,
          vy: vel.vy,
          scale: 1,
          opacity: 1,
        };

        let newButtons = [...prev, newButton];

        // If over max, remove oldest buttons
        if (newButtons.length > maxButtons) {
          newButtons = newButtons.slice(newButtons.length - maxButtons);
        }

        logger.debug('MitosisButton: auto-spawn', { total: newButtons.length });
        return newButtons;
      });

      // Occasionally shuffle which button is real (30% chance on auto-spawn)
      if (Math.random() < 0.3) {
        setButtons((prev) => {
          shuffleRealIndex(prev.length);
          return prev;
        });
      }
    }, autoSpawnInterval);

    return () => clearInterval(timer);
  }, [autoSpawnInterval, maxButtons, driftSpeed, logger, shuffleRealIndex]);

  const spawnFromParent = useCallback(
    (parent: ButtonState): ButtonState[] => {
      const newButtons: ButtonState[] = [];
      for (let i = 0; i < multiplyBy; i++) {
        const vel = randomVelocity(driftSpeed);
        const angle = Math.random() * Math.PI * 2;
        const pushDist = 8;

        newButtons.push({
          id: __buttonId++,
          x: Math.max(10, Math.min(90, parent.x + Math.cos(angle) * pushDist)),
          y: Math.max(10, Math.min(90, parent.y + Math.sin(angle) * pushDist)),
          vx: vel.vx,
          vy: vel.vy,
          scale: 1,
          opacity: 1,
        });
      }
      return newButtons;
    },
    [multiplyBy, driftSpeed]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, buttonId: number) => {
      // Find the index of the clicked button
      const clickedIndex = buttons.findIndex((b) => b.id === buttonId);

      // Check if this is the real button
      if (clickedIndex === realIndex) {
        logger.info('MitosisButton: WIN! Real button clicked');
        onWin?.(e);
        return;
      }

      // Clicked a fake button - spawn more and shuffle
      logger.debug('MitosisButton: Fake button clicked, spawning more', { clickedIndex, realIndex });
      onFakeClick?.(e, buttonId);

      setButtons((prev) => {
        const clickedButton = prev.find((b) => b.id === buttonId);
        if (!clickedButton) return prev;

        // Spawn new buttons (mitosis!)
        const newButtons = spawnFromParent(clickedButton);
        let result = [...prev, ...newButtons];

        // If over max, remove oldest buttons (but keep enough for the game)
        if (result.length > maxButtons) {
          result = result.slice(result.length - maxButtons);
        }

        logger.debug('MitosisButton: multiplying', {
          buttonId,
          spawned: newButtons.length,
          total: result.length,
        });

        return result;
      });

      // Shuffle which button is real after spawning
      // Use setTimeout to ensure state has updated
      setTimeout(() => {
        setButtons((prev) => {
          shuffleRealIndex(prev.length);
          return prev;
        });
      }, 0);
    },
    [buttons, realIndex, onFakeClick, onWin, maxButtons, logger, spawnFromParent, shuffleRealIndex]
  );

  const defaultRenderButton = ({
    onClick: onClickHandler,
    style: buttonStyle,
    className: buttonClassName,
    children: buttonChildren,
  }: RenderButtonProps) => (
    <button className={buttonClassName} style={buttonStyle} onClick={onClickHandler} type="button">
      {buttonChildren}
    </button>
  );

  const renderFn = renderButton ?? defaultRenderButton;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {buttons.map((btn) => (
        <React.Fragment key={btn.id}>
          {renderFn({
            onClick: (e) => handleClick(e, btn.id),
            style: {
              position: 'absolute',
              left: `${btn.x}%`,
              top: `${btn.y}%`,
              transform: `translate(-50%, -50%) scale(${btn.scale})`,
              opacity: btn.opacity,
              transition: 'transform 0.1s ease-out',
              ...style,
            },
            className,
            children: children ?? 'Click me',
          })}
        </React.Fragment>
      ))}
    </div>
  );
};
