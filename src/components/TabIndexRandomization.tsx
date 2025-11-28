import React, { useEffect, useState, useMemo } from 'react';
import { componentLoggers } from '../utils/logger';

/**
 * Props for the TabIndexRandomization component
 */
export interface TabIndexRandomizationProps {
  /**
   * Number of fields to render
   * @default 3
   */
  fieldCount?: number;

  /**
   * Interval in milliseconds between tab order shuffles
   * @default 3000
   */
  shuffleInterval?: number;

  /**
   * Show the current tab order to users
   * @default true
   */
  showOrder?: boolean;

  /**
   * Content to render for each field
   * Receives the field index and current tabIndex as parameters
   */
  children?: (fieldIndex: number, tabIndex: number) => React.ReactNode;

  /**
   * Custom className for the container
   */
  className?: string;

  /**
   * Custom styles for the container
   */
  style?: React.CSSProperties;

  /**
   * Custom className for individual fields
   */
  fieldClassName?: string;

  /**
   * Custom styles for individual fields
   */
  fieldStyle?: React.CSSProperties;
}

/**
 * TabIndexRandomization - Form fields with dynamic tab order
 *
 * This component creates form fields whose tab order (keyboard navigation order)
 * shuffles at regular intervals. This ensures users engage with each field
 * intentionally rather than relying on muscle memory or shortcuts.
 *
 * The component is fully composable - you provide the field content via children,
 * and it handles the tab order management.
 *
 * @example
 * ```tsx
 * <TabIndexRandomization fieldCount={3} shuffleInterval={3000}>
 *   {(fieldIndex, tabIndex) => (
 *     <input
 *       type="text"
 *       placeholder={`Field ${String.fromCharCode(65 + fieldIndex)}`}
 *       tabIndex={tabIndex}
 *     />
 *   )}
 * </TabIndexRandomization>
 * ```
 */
export function TabIndexRandomization({
  fieldCount = 3,
  shuffleInterval = 3000,
  showOrder = true,
  children,
  className,
  style,
  fieldClassName,
  fieldStyle,
}: TabIndexRandomizationProps) {
  const logger = useMemo(() => componentLoggers.tabIndexRandomization, []);

  // Initialize tab order array [1, 2, 3, ...fieldCount]
  const [tabOrder, setTabOrder] = useState<number[]>(() =>
    Array.from({ length: fieldCount }, (_, i) => i + 1)
  );

  // Shuffle array using simple random sort
  const shuffleArray = (array: number[]): number[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTabOrder((prev) => {
        const shuffled = shuffleArray(prev);
        logger.debug('Tab order shuffled:', shuffled);
        return shuffled;
      });
    }, shuffleInterval);

    return () => clearInterval(timer);
  }, [shuffleInterval, logger]);

  return (
    <div className={className} style={style}>
      {Array.from({ length: fieldCount }, (_, fieldIndex) => {
        const currentTabIndex = tabOrder[fieldIndex];

        return (
          <div key={fieldIndex} className={fieldClassName} style={fieldStyle}>
            {children?.(fieldIndex, currentTabIndex)}
          </div>
        );
      })}

      {showOrder && (
        <p
          style={{
            fontSize: '0.875rem',
            color: '#425466',
            marginTop: '0.5rem',
            ...style,
          }}
        >
          Current tab order: {tabOrder.join(' → ')}
        </p>
      )}
    </div>
  );
}
