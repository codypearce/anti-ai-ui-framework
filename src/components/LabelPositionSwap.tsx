import React, { useState, useEffect, useMemo } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Label position options
 */
export type LabelPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Props for the LabelPositionSwap component
 */
export interface LabelPositionSwapProps {
  /**
   * Label text
   * @default 'Email'
   */
  label?: string;

  /**
   * Input placeholder
   * @default 'Enter text...'
   */
  placeholder?: string;

  /**
   * Interval in milliseconds between position changes
   * @default 2200
   */
  changeInterval?: number;

  /**
   * Available positions to cycle through
   * @default ['top', 'bottom', 'left', 'right']
   */
  positions?: LabelPosition[];

  /**
   * Callback when position changes
   */
  onPositionChange?: (position: LabelPosition) => void;

  /**
   * Custom render function
   */
  children?: (position: LabelPosition, label: string, placeholder: string) => React.ReactNode;

  /**
   * Custom CSS class for the container
   */
  className?: string;

  /**
   * Custom inline styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Custom CSS class for the label
   */
  labelClassName?: string;

  /**
   * Custom inline styles for the label
   */
  labelStyle?: React.CSSProperties;

  /**
   * Custom CSS class for the input
   */
  inputClassName?: string;

  /**
   * Custom inline styles for the input
   */
  inputStyle?: React.CSSProperties;

  /**
   * Show current position indicator
   * @default true
   */
  showPositionIndicator?: boolean;
}

const DEFAULT_POSITIONS: LabelPosition[] = ['top', 'bottom', 'left', 'right'];

/**
 * LabelPositionSwap component that moves labels between different positions.
 *
 * This component creates confusion by moving the label to different positions
 * (top, bottom, left, right) relative to the input field. AI systems expect
 * labels in consistent locations and use label proximity to identify fields.
 * Constantly changing positions breaks field identification.
 *
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <LabelPositionSwap />
 *
 * // Custom label and timing
 * <LabelPositionSwap
 *   label="Username"
 *   placeholder="Enter username..."
 *   changeInterval={1500}
 * />
 *
 * // Custom render with full control
 * <LabelPositionSwap>
 *   {(position, label, placeholder) => (
 *     <div className={`custom-container position-${position}`}>
 *       <label>{label}</label>
 *       <input type="text" placeholder={placeholder} />
 *     </div>
 *   )}
 * </LabelPositionSwap>
 * ```
 */
export function LabelPositionSwap({
  label = 'Email',
  placeholder = 'Enter text...',
  changeInterval = 2200,
  positions = DEFAULT_POSITIONS,
  onPositionChange,
  children,
  className,
  style,
  labelClassName,
  labelStyle,
  inputClassName,
  inputStyle,
  showPositionIndicator = true,
}: LabelPositionSwapProps) {
  const logger = useMemo(() => componentLoggers.labelPositionSwap, []);

  const [currentPosition, setCurrentPosition] = useState<LabelPosition>(positions[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomPosition = positions[Math.floor(Math.random() * positions.length)];
      logger.debug('Changing label position to:', randomPosition);
      setCurrentPosition(randomPosition);
      onPositionChange?.(randomPosition);
    }, changeInterval);

    return () => clearInterval(interval);
  }, [positions, changeInterval, onPositionChange, logger]);

  if (children) {
    return <>{children(currentPosition, label, placeholder)}</>;
  }

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: currentPosition === 'top' || currentPosition === 'bottom'
      ? 'column'
      : 'row',
    alignItems: currentPosition === 'left' || currentPosition === 'right'
      ? 'center'
      : 'stretch',
    gap: '8px',
    ...style,
  };

  const defaultLabelStyle: React.CSSProperties = {
    fontWeight: '500',
    fontSize: '14px',
    color: '#374151',
    order: currentPosition === 'bottom' || currentPosition === 'right' ? 1 : 0,
    ...labelStyle,
  };

  const defaultInputStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    order: currentPosition === 'top' || currentPosition === 'left' ? 1 : 0,
    ...inputStyle,
  };

  const indicatorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
  };

  return (
    <div className={className}>
      <div style={containerStyle}>
        <label className={labelClassName} style={defaultLabelStyle}>
          {label}
        </label>
        <input
          type="text"
          placeholder={placeholder}
          className={inputClassName}
          style={defaultInputStyle}
        />
      </div>
      {showPositionIndicator && (
        <p style={indicatorStyle}>
          Label position changes every {changeInterval}ms (current: {currentPosition})
        </p>
      )}
    </div>
  );
}
