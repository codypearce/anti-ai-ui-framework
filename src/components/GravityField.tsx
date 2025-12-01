import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Children,
  CSSProperties,
} from 'react';
import { componentLoggers } from '../utils/logger';

export interface GravityWell {
  x: number;
  y: number;
  strength: number;
}

export type WellFollowMode = 'follow' | 'fixed' | 'repel' | 'orbit';

export interface WellPosition {
  x: number; // percentage (0-100) or pixel value
  y: number; // percentage (0-100) or pixel value
  strength?: number; // optional strength override (0-1)
}

export interface GravityFieldProps {
  children: React.ReactNode;
  wellCount?: number; // Number of gravity wells (ignored if wells prop is provided)
  wells?: WellPosition[]; // Custom well positions (percentages 0-100)
  wellStrength?: number; // Base strength of gravity wells (0-1)
  noise?: number; // Random noise added to element positions (px)
  reseedOnHover?: boolean; // Reseed well positions when cursor enters (ignored if wells prop is provided)
  updateInterval?: number; // How often to update positions (ms)
  followMode?: WellFollowMode; // How wells react to cursor
  followSpeed?: number; // Speed at which wells follow/react to cursor (0-0.1)
  showWells?: boolean; // Show visual indicators for gravity wells
  wellColor?: string; // Color for well indicators
  style?: CSSProperties;
  className?: string;
}

type DriftingItem = {
  id: string;
  element: React.ReactNode;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
};

function generateWells(count: number, width: number, height: number, strength: number): GravityWell[] {
  const wells: GravityWell[] = [];
  for (let i = 0; i < count; i++) {
    wells.push({
      x: Math.random() * width,
      y: Math.random() * height,
      strength: strength * (0.5 + Math.random() * 0.5),
    });
  }
  return wells;
}

function calculateGravityForce(
  itemX: number,
  itemY: number,
  wells: GravityWell[]
): { fx: number; fy: number } {
  let fx = 0;
  let fy = 0;

  for (const well of wells) {
    const dx = well.x - itemX;
    const dy = well.y - itemY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 0) {
      // Normalize direction
      const nx = dx / dist;
      const ny = dy / dist;

      // Perpendicular direction (for orbit)
      const px = -ny;
      const py = nx;

      // Ideal orbit radius
      const orbitRadius = 80 + well.strength * 40;

      if (dist < orbitRadius * 0.5) {
        // Too close - push out
        const repulse = (orbitRadius * 0.5 - dist) * 0.05;
        fx -= nx * repulse;
        fy -= ny * repulse;
      } else if (dist < orbitRadius * 1.5) {
        // In orbital zone - add tangential force for orbit + gentle centering
        const orbitForce = well.strength * 0.4;
        fx += px * orbitForce;
        fy += py * orbitForce;

        // Gentle pull/push toward ideal radius
        const radiusDiff = (dist - orbitRadius) * 0.005;
        fx += nx * radiusDiff;
        fy += ny * radiusDiff;
      } else {
        // Far away - attract toward well
        const attractForce = well.strength * 0.2;
        fx += nx * attractForce;
        fy += ny * attractForce;
      }
    }
  }

  const maxForce = 1.5;
  const totalForce = Math.sqrt(fx * fx + fy * fy);
  if (totalForce > maxForce) {
    fx = (fx / totalForce) * maxForce;
    fy = (fy / totalForce) * maxForce;
  }

  return { fx, fy };
}

export const GravityField: React.FC<GravityFieldProps> = ({
  children,
  wellCount = 3,
  wells,
  wellStrength = 0.5,
  noise = 2,
  reseedOnHover = true,
  updateInterval = 16,
  followMode = 'fixed',
  followSpeed = 0.005,
  showWells = true,
  wellColor = '#e94560',
  style,
  className,
}) => {
  const logger = useMemo(() => componentLoggers.gravityField, []);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const childrenArray = useMemo(() => Children.toArray(children), [children]);
  const containerDimensions = useRef({ width: 400, height: 300 });
  const wellsRef = useRef<GravityWell[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const itemsRef = useRef<DriftingItem[]>([]);
  const [wellPositions, setWellPositions] = useState<GravityWell[]>([]);
  const [, forceUpdate] = useState(0);

  // Initialize items ref
  if (itemsRef.current.length === 0) {
    itemsRef.current = childrenArray.map((child, index) => ({
      id: `gravity-item-${index}`,
      element: child,
      x: 50 + (index % 3) * 100,
      y: 50 + Math.floor(index / 3) * 80,
      velocityX: 0,
      velocityY: 0,
    }));
  }

  // Initialize wells
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      containerDimensions.current = { width: rect.width || 400, height: rect.height || 300 };
    }
    const { width, height } = containerDimensions.current;

    if (wells && wells.length > 0) {
      // Use custom well positions (convert percentages to pixels)
      wellsRef.current = wells.map((well) => ({
        x: (well.x / 100) * width,
        y: (well.y / 100) * height,
        strength: well.strength ?? wellStrength,
      }));
    } else {
      // Generate random wells
      wellsRef.current = generateWells(wellCount, width, height, wellStrength);
    }
    setWellPositions([...wellsRef.current]);
    logger.debug('Initialized gravity wells', wellsRef.current);
  }, [wellCount, wells, wellStrength, logger]);

  // Animation loop - uses refs to avoid state updates on every frame
  const updatePositions = useCallback(() => {
    const now = performance.now();
    if (now - lastUpdateRef.current < updateInterval) {
      animationRef.current = requestAnimationFrame(updatePositions);
      return;
    }
    lastUpdateRef.current = now;

    const { width, height } = containerDimensions.current;
    const wells = wellsRef.current;

    // Update positions directly in ref
    for (let i = 0; i < itemsRef.current.length; i++) {
      const item = itemsRef.current[i];
      const { fx, fy } = calculateGravityForce(item.x, item.y, wells);

      const noiseX = (Math.random() - 0.5) * noise * 0.5;
      const noiseY = (Math.random() - 0.5) * noise * 0.5;

      const damping = 0.92;
      let newVelocityX = (item.velocityX + fx) * damping + noiseX;
      let newVelocityY = (item.velocityY + fy) * damping + noiseY;

      let newX = item.x + newVelocityX;
      let newY = item.y + newVelocityY;

      const padding = 40;
      if (newX < padding) {
        newX = padding;
        newVelocityX = Math.abs(newVelocityX) * 0.5;
      } else if (newX > width - padding) {
        newX = width - padding;
        newVelocityX = -Math.abs(newVelocityX) * 0.5;
      }

      if (newY < padding) {
        newY = padding;
        newVelocityY = Math.abs(newVelocityY) * 0.5;
      } else if (newY > height - padding) {
        newY = height - padding;
        newVelocityY = -Math.abs(newVelocityY) * 0.5;
      }

      item.x = newX;
      item.y = newY;
      item.velocityX = newVelocityX;
      item.velocityY = newVelocityY;
    }

    // Trigger re-render
    forceUpdate(n => n + 1);

    animationRef.current = requestAnimationFrame(updatePositions);
  }, [noise, updateInterval]);

  // Start animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(updatePositions);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updatePositions]);

  // Reseed wells on hover (only if not using custom wells)
  const handleMouseEnter = useCallback(() => {
    if (!reseedOnHover || (wells && wells.length > 0)) return;

    const { width, height } = containerDimensions.current;
    wellsRef.current = generateWells(wellCount, width, height, wellStrength);
    setWellPositions([...wellsRef.current]);
    logger.debug('Reseeded gravity wells on hover', wellsRef.current);
  }, [reseedOnHover, wells, wellCount, wellStrength, logger]);

  // Move wells based on followMode
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current || followMode === 'fixed') return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const { width, height } = containerDimensions.current;

      wellsRef.current = wellsRef.current.map((well, i) => {
        if (followMode === 'follow') {
          return {
            ...well,
            x: well.x + (mouseX - well.x) * followSpeed,
            y: well.y + (mouseY - well.y) * followSpeed,
          };
        } else if (followMode === 'repel') {
          const dx = well.x - mouseX;
          const dy = well.y - mouseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150 && dist > 0) {
            const force = (150 - dist) * followSpeed * 0.5;
            return {
              ...well,
              x: Math.max(40, Math.min(width - 40, well.x + (dx / dist) * force)),
              y: Math.max(40, Math.min(height - 40, well.y + (dy / dist) * force)),
            };
          }
          return well;
        } else if (followMode === 'orbit') {
          const angle = Date.now() / 1000 + i * ((Math.PI * 2) / wellsRef.current.length);
          const orbitRadius = 80 + i * 30;
          return {
            ...well,
            x: well.x + (mouseX + Math.cos(angle) * orbitRadius - well.x) * followSpeed,
            y: well.y + (mouseY + Math.sin(angle) * orbitRadius - well.y) * followSpeed,
          };
        }
        return well;
      });
    },
    [followMode, followSpeed]
  );

  const containerStyle: CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    ...style,
  };

  const wellStyle = (well: GravityWell): CSSProperties => {
    const size = 90 + well.strength * 60;
    return {
      position: 'absolute',
      left: well.x,
      top: well.y,
      width: size,
      height: size,
      borderRadius: '50%',
      pointerEvents: 'none',
      transform: 'translate(-50%, -50%)',
    };
  };

  const coreStyle: CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 14,
    height: 14,
    background: '#000',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 8px 4px rgba(0, 0, 0, 0.8)',
  };

  const particleBaseStyle: CSSProperties = {
    position: 'absolute',
    width: 3,
    height: 3,
    background: wellColor,
    borderRadius: '50%',
    top: '50%',
    left: '50%',
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
    >
      <style>
        {`@keyframes gravity-spiral-in {
          0% {
            transform: translate(-50%, -50%) rotate(0deg) translateX(40px);
            opacity: 0;
          }
          10% { opacity: 1; }
          80% { opacity: 0.8; }
          100% {
            transform: translate(-50%, -50%) rotate(720deg) translateX(0px);
            opacity: 0;
          }
        }`}
      </style>
      {showWells && wellPositions.map((well, index) => (
        <div key={`well-${index}`} style={wellStyle(well)}>
          {[0, 0.5, 1, 1.5, 2].map((delay, i) => (
            <div
              key={i}
              style={{
                ...particleBaseStyle,
                animation: `gravity-spiral-in 2.5s linear infinite ${delay}s`,
              }}
            />
          ))}
          <div style={coreStyle} />
        </div>
      ))}
      {itemsRef.current.map((item) => (
        <div
          key={item.id}
          style={{
            position: 'absolute',
            left: item.x,
            top: item.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {item.element}
        </div>
      ))}
    </div>
  );
};
