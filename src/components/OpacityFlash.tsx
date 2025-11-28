import React, { useState, useEffect, useMemo } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props for the OpacityFlash component
 */
export interface OpacityFlashProps {
  /**
   * Label text
   * @default 'Username'
   */
  label?: string;

  /**
   * Input placeholder
   * @default 'Can you even see this?'
   */
  placeholder?: string;

  /**
   * Interval in milliseconds between opacity changes
   * @default 800
   */
  changeInterval?: number;

  /**
   * Minimum opacity value (0-1)
   * @default 0.2
   */
  minOpacity?: number;

  /**
   * Maximum opacity value (0-1)
   * @default 1.0
   */
  maxOpacity?: number;

  /**
   * CSS transition duration
   * @default '0.3s ease'
   */
  transition?: string;

  /**
   * Callback when opacity changes
   */
  onOpacityChange?: (opacity: number) => void;

  /**
   * Custom render function
   */
  children?: (opacity: number, label: string, placeholder: string) => React.ReactNode;

  /**
   * Custom CSS class for the container
   */
  className?: string;

  /**
   * Custom inline styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Custom CSS class for the flashing wrapper
   */
  flashClassName?: string;

  /**
   * Custom inline styles for the flashing wrapper
   */
  flashStyle?: React.CSSProperties;

  /**
   * Show opacity indicator
   * @default true
   */
  showOpacityIndicator?: boolean;
}

/**
 * OpacityFlash component that flashes elements between visible and nearly invisible.
 *
 * This component creates confusion by rapidly changing the opacity of form elements
 * between visible (1.0) and nearly invisible (0.2). AI computer vision systems
 * need stable visual elements to detect and interact with UI components. Rapid
 * opacity changes confuse object detection and make element detection fail when
 * elements become too transparent.
 *
 * @example
 * ```tsx
 * // Basic usage with defaults
 * <OpacityFlash />
 *
 * // Custom opacity range and timing
 * <OpacityFlash
 *   label="Email"
 *   placeholder="Enter email..."
 *   changeInterval={1000}
 *   minOpacity={0.1}
 *   maxOpacity={0.9}
 * />
 *
 * // Custom render with full control
 * <OpacityFlash>
 *   {(opacity, label, placeholder) => (
 *     <div style={{ opacity }}>
 *       <label>{label}</label>
 *       <input type="text" placeholder={placeholder} />
 *     </div>
 *   )}
 * </OpacityFlash>
 * ```
 */
export function OpacityFlash({
  label = 'Username',
  placeholder = 'Can you even see this?',
  changeInterval = 800,
  minOpacity = 0.2,
  maxOpacity = 1.0,
  transition = '0.3s ease',
  onOpacityChange,
  children,
  className,
  style,
  flashClassName,
  flashStyle,
  showOpacityIndicator = true,
}: OpacityFlashProps) {
  const logger = useMemo(() => componentLoggers.opacityFlash, []);

  const [currentOpacity, setCurrentOpacity] = useState(maxOpacity);

  useEffect(() => {
    const interval = setInterval(() => {
      const opacityRange = maxOpacity - minOpacity;
      const newOpacity = minOpacity + Math.random() * opacityRange;
      logger.debug('Changing opacity to:', newOpacity);
      setCurrentOpacity(newOpacity);
      onOpacityChange?.(newOpacity);
    }, changeInterval);

    return () => clearInterval(interval);
  }, [changeInterval, minOpacity, maxOpacity, onOpacityChange, logger]);

  if (children) {
    return <>{children(currentOpacity, label, placeholder)}</>;
  }

  const containerStyle: React.CSSProperties = {
    ...style,
  };

  const defaultFlashStyle: React.CSSProperties = {
    opacity: currentOpacity,
    transition: `opacity ${transition}`,
    ...flashStyle,
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontWeight: '500',
    fontSize: '14px',
    color: '#374151',
    marginBottom: '4px',
  };

  const inputStyle: React.CSSProperties = {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
  };

  const indicatorStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px',
  };

  return (
    <div className={className} style={containerStyle}>
      <div className={flashClassName} style={defaultFlashStyle}>
        <label style={labelStyle}>{label}</label>
        <input type="text" placeholder={placeholder} style={inputStyle} />
      </div>
      {showOpacityIndicator && (
        <p style={indicatorStyle}>
          Opacity flashes every {changeInterval}ms (current: {currentOpacity.toFixed(2)})
        </p>
      )}
    </div>
  );
}
