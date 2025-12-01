import React, { useCallback, useEffect, useRef, useState } from 'react';
import { componentLoggers } from '../utils/logger';

export interface RenderButtonProps {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  style: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
  ref: React.Ref<HTMLButtonElement>;
}

export interface RunawayButtonProps {
  /** Distance in pixels at which evasion triggers */
  evasionDistance?: number;
  /** How far to move when evading (pixels) */
  escapeDistance?: number;
  /** Called when user clicks the button */
  onCatch?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /**
   * Custom render function for the button. Use this to render your own button component.
   * The function receives onClick, style, className, children, and ref props that must be applied.
   */
  renderButton?: (props: RenderButtonProps) => React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const RunawayButton: React.FC<RunawayButtonProps> = ({
  evasionDistance = 120,
  escapeDistance = 80,
  onCatch,
  renderButton,
  className,
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const logger = componentLoggers.runawayButton;

  // Set initial position
  useEffect(() => {
    const container = containerRef.current;
    if (container && getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      const btn = buttonRef.current;
      if (!container || !btn) return;

      const cRect = container.getBoundingClientRect();
      const mouseX = e.clientX - cRect.left;
      const mouseY = e.clientY - cRect.top;

      // Get button center position
      const bRect = btn.getBoundingClientRect();
      const btnCenterX = bRect.left + bRect.width / 2 - cRect.left;
      const btnCenterY = bRect.top + bRect.height / 2 - cRect.top;

      // Calculate distance from mouse to button
      const dx = mouseX - btnCenterX;
      const dy = mouseY - btnCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If mouse is too close, move button away
      if (distance < evasionDistance) {
        // Calculate escape direction (opposite to mouse)
        const angle = Math.atan2(dy, dx);
        const escapeX = btnCenterX - Math.cos(angle) * escapeDistance;
        const escapeY = btnCenterY - Math.sin(angle) * escapeDistance;

        // Convert to percentage and constrain within bounds (15-85% to always have escape room)
        const newX = Math.max(15, Math.min(85, (escapeX / cRect.width) * 100));
        const newY = Math.max(15, Math.min(85, (escapeY / cRect.height) * 100));

        setPosition({ x: newX, y: newY });
        logger.debug('Evading to', { x: newX, y: newY });
      }
    },
    [evasionDistance, escapeDistance, logger]
  );

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${position.x}%`,
    top: `${position.y}%`,
    transform: 'translate(-50%, -50%)',
    transition: 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
    userSelect: 'none',
    ...style,
  };

  const buttonProps: RenderButtonProps = {
    onClick: (e) => onCatch?.(e),
    style: buttonStyle,
    className,
    children: children ?? 'Catch me',
    ref: buttonRef,
  };

  const defaultRenderButton = ({ onClick, style: btnStyle, className: btnClassName, children: btnChildren, ref }: RenderButtonProps) => (
    <button
      ref={ref}
      className={btnClassName}
      style={btnStyle}
      onClick={onClick}
      type="button"
    >
      {btnChildren}
    </button>
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={onMouseMove}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}
    >
      {renderButton ? renderButton(buttonProps) : defaultRenderButton(buttonProps)}
    </div>
  );
};
