import React, { useCallback, useMemo, useState } from 'react';
import { randomPosition, type Position } from '../utils/randomPosition';
import { componentLoggers } from '../utils/logger';

export interface MitosisButtonProps {
  /**
   * Initial number of buttons to start with
   * Default: 6
   */
  initialCount?: number;
  /**
   * Maximum number of buttons before they start being removed on click instead of multiplying
   * Default: 20
   */
  maxButtons?: number;
  /**
   * Number of new buttons to spawn when clicking a button (during multiplication phase)
   * Default: 2
   */
  multiplyBy?: number;
  /**
   * Callback when a button is clicked (but not the winning click)
   */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>, buttonId: number) => void;
  /**
   * Callback when the user wins (gets down to 1 button and clicks it)
   */
  onWin?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

interface ButtonDef {
  id: number;
  pos: Position; // percent-based within container (0-100)
}

let __buttonId = 1;

export const MitosisButton: React.FC<MitosisButtonProps> = ({
  initialCount = 6,
  maxButtons = 20,
  multiplyBy = 2,
  onClick,
  onWin,
  className,
  style,
  children,
}) => {
  const logger = useMemo(() => componentLoggers.mitosisButton, []);

  const [buttons, setButtons] = useState<ButtonDef[]>(() => {
    return Array.from({ length: initialCount }).map(() => ({
      id: __buttonId++,
      pos: randomPosition({ minX: 10, maxX: 90, minY: 10, maxY: 90 }),
    }));
  });

  // Track if we've reached max and are now in removal mode
  const [removalMode, setRemovalMode] = useState(false);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>, buttonId: number) => {
      // Check if this is the winning click (down to 1 button)
      if (buttons.length === 1) {
        logger.info('MitosisButton: WIN! Last button clicked');
        onWin?.(e);
        return;
      }

      // Regular click callback
      onClick?.(e, buttonId);

      setButtons((prev) => {
        // In removal mode, always remove
        if (removalMode) {
          logger.debug('MitosisButton: removal mode, removing button', { buttonId, total: prev.length - 1 });
          return prev.filter((b) => b.id !== buttonId);
        }

        // Check if adding new buttons would exceed the limit
        const newTotal = prev.length + multiplyBy;
        if (newTotal >= maxButtons) {
          // Switch to removal mode
          setRemovalMode(true);
          logger.info('MitosisButton: reached max, switching to removal mode', { total: prev.length });
          return prev.filter((b) => b.id !== buttonId);
        }

        // Otherwise, spawn new buttons (mitosis!)
        const newButtons: ButtonDef[] = [];
        for (let i = 0; i < multiplyBy; i++) {
          newButtons.push({
            id: __buttonId++,
            pos: randomPosition({ minX: 10, maxX: 90, minY: 10, maxY: 90 }),
          });
        }

        logger.debug('MitosisButton: multiplying', {
          buttonId,
          spawned: newButtons.length,
          total: prev.length + newButtons.length
        });

        return [...prev, ...newButtons];
      });
    },
    [buttons.length, removalMode, onClick, onWin, maxButtons, multiplyBy, logger]
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {buttons.map((btn) => (
        <button
          key={btn.id}
          className={className}
          style={{
            position: 'absolute',
            left: `${btn.pos.x}%`,
            top: `${btn.pos.y}%`,
            transform: 'translate(-50%, -50%)',
            ...style,
          }}
          onClick={(e) => handleClick(e, btn.id)}
          type="button"
        >
          {children ?? 'Click me'}
        </button>
      ))}
    </div>
  );
};
