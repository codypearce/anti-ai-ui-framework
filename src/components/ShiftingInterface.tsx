import React, { useEffect, useMemo, useRef, useState, Children, cloneElement, isValidElement, CSSProperties } from 'react';
import { componentLoggers } from '../utils/logger';

export interface ShiftingInterfaceProps {
  children: React.ReactNode;
  shiftInterval?: number; // ms
  duplicateChance?: number; // 0-1
  colorChangeInterval?: number; // ms
  colors?: string[];
  maxDuplicates?: number;
  style?: CSSProperties;
  className?: string;
}

type Item = {
  id: string;
  element: React.ReactNode;
  left: number;
  top: number;
  colorIndex: number;
};

const DEFAULT_COLORS = ['#0ea5e9', '#22c55e', '#ef4444', '#a855f7', '#f59e0b'];

export const ShiftingInterface: React.FC<ShiftingInterfaceProps> = ({
  children,
  shiftInterval = 1200,
  duplicateChance = 0.2,
  colorChangeInterval = 1800,
  colors = DEFAULT_COLORS,
  maxDuplicates = 6,
  style,
  className,
}) => {
  const logger = useMemo(() => componentLoggers.shiftingInterface, []);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const childrenArray = useMemo(() => Children.toArray(children), [children]);
  const containerWidthRef = useRef(380);
  const containerHeightRef = useRef(220);

  const [items, setItems] = useState<Item[]>(() =>
    childrenArray.map((child, index) => ({
      id: `item-${index}`,
      element: child,
      left: 30,
      top: 30 + index * 50,
      colorIndex: index % colors.length,
    }))
  );

  // Update container dimensions when style changes
  useEffect(() => {
    if (hostRef.current) {
      const rect = hostRef.current.getBoundingClientRect();
      containerWidthRef.current = rect.width || 380;
      containerHeightRef.current = rect.height || 220;
    }
  }, [style]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setItems((prev) =>
        prev.map((it) => {
          const maxLeft = containerWidthRef.current - 60;
          const maxTop = containerHeightRef.current - 40;
          return {
            ...it,
            left: Math.max(10, Math.min(maxLeft, it.left + (Math.random() - 0.5) * 120)),
            top: Math.max(10, Math.min(maxTop, it.top + (Math.random() - 0.5) * 60)),
          };
        })
      );
      if (Math.random() < duplicateChance) {
        setItems((prev) => {
          if (prev.length >= maxDuplicates) return prev;
          const base = prev[Math.floor(Math.random() * prev.length)];
          const clone: Item = {
            ...base,
            id: `${base.id}-${Math.random().toString(36).slice(2, 6)}`,
            left: base.left + 20,
            top: base.top + 10,
          };
          logger.debug('Duplicated element', clone.id);
          return [...prev, clone];
        });
      }
    }, shiftInterval);
    return () => window.clearInterval(t);
  }, [duplicateChance, logger, shiftInterval, maxDuplicates]);

  useEffect(() => {
    const t = window.setInterval(() => {
      setItems((prev) =>
        prev.map((it) => ({
          ...it,
          colorIndex: Math.floor(Math.random() * colors.length),
        }))
      );
    }, colorChangeInterval);
    return () => window.clearInterval(t);
  }, [colorChangeInterval, colors.length]);

  const applyColorToElement = (element: React.ReactNode, color: string): React.ReactNode => {
    if (!isValidElement(element)) return element;

    // Try to apply color to the element's style
    const elementStyle = (element.props as any).style || {};
    const newStyle: CSSProperties = {
      ...elementStyle,
    };

    // Apply color based on element type
    if (element.type === 'button') {
      newStyle.backgroundColor = color;
    } else if (element.type === 'input') {
      newStyle.borderColor = color;
    } else {
      newStyle.color = color;
    }

    return cloneElement(element, {
      ...element.props,
      style: newStyle,
    } as any);
  };

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: 380,
    height: 220,
    border: '1px dashed #94a3b8',
    borderRadius: 6,
    ...style,
  };

  return (
    <div ref={hostRef} style={containerStyle} className={className}>
      {items.map((it) => (
        <div
          key={it.id}
          style={{
            position: 'absolute',
            left: it.left,
            top: it.top,
            transition: 'left 200ms linear, top 200ms linear',
          }}
        >
          {applyColorToElement(it.element, colors[it.colorIndex])}
        </div>
      ))}
    </div>
  );
};

