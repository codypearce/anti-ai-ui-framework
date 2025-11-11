/**
 * Utilities for generating random positions within bounds
 * Used by components that need to move elements around
 */

export interface Bounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface RandomPositionOptions {
  /** Minimum distance from edges in pixels */
  edgePadding?: number;
  /** Avoid overlapping with these positions (with given radius) */
  avoidPositions?: { position: Position; radius: number }[];
  /** Maximum attempts to find a valid position */
  maxAttempts?: number;
}

/**
 * Generate a random position within bounds
 */
export function randomPosition(
  bounds: Bounds,
  options: RandomPositionOptions = {}
): Position {
  const { edgePadding = 0, avoidPositions = [], maxAttempts = 50 } = options;

  const effectiveBounds: Bounds = {
    minX: bounds.minX + edgePadding,
    maxX: bounds.maxX - edgePadding,
    minY: bounds.minY + edgePadding,
    maxY: bounds.maxY - edgePadding,
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const x =
      effectiveBounds.minX +
      Math.random() * (effectiveBounds.maxX - effectiveBounds.minX);
    const y =
      effectiveBounds.minY +
      Math.random() * (effectiveBounds.maxY - effectiveBounds.minY);

    const position: Position = { x, y };

    // Check if this position is too close to any avoided positions
    const isTooClose = avoidPositions.some((avoid) => {
      const distance = Math.sqrt(
        Math.pow(position.x - avoid.position.x, 2) +
          Math.pow(position.y - avoid.position.y, 2)
      );
      return distance < avoid.radius;
    });

    if (!isTooClose) {
      return position;
    }
  }

  // Fallback: return a position even if it might overlap
  return {
    x:
      effectiveBounds.minX +
      Math.random() * (effectiveBounds.maxX - effectiveBounds.minX),
    y:
      effectiveBounds.minY +
      Math.random() * (effectiveBounds.maxY - effectiveBounds.minY),
  };
}

/**
 * Get bounds of an element relative to viewport
 */
export function getElementBounds(element: HTMLElement): Bounds {
  const rect = element.getBoundingClientRect();
  return {
    minX: rect.left,
    maxX: rect.right,
    minY: rect.top,
    maxY: rect.bottom,
  };
}

/**
 * Get viewport bounds
 */
export function getViewportBounds(): Bounds {
  return {
    minX: 0,
    maxX: window.innerWidth,
    minY: 0,
    maxY: window.innerHeight,
  };
}

/**
 * Get bounds of parent element or viewport
 */
export function getContainerBounds(element: HTMLElement): Bounds {
  const parent = element.offsetParent as HTMLElement;

  if (parent && parent !== document.body) {
    return {
      minX: 0,
      maxX: parent.offsetWidth,
      minY: 0,
      maxY: parent.offsetHeight,
    };
  }

  return getViewportBounds();
}

/**
 * Calculate distance between two positions
 */
export function distance(p1: Position, p2: Position): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

/**
 * Check if a position is within bounds
 */
export function isWithinBounds(position: Position, bounds: Bounds): boolean {
  return (
    position.x >= bounds.minX &&
    position.x <= bounds.maxX &&
    position.y >= bounds.minY &&
    position.y <= bounds.maxY
  );
}

/**
 * Constrain a position to stay within bounds
 */
export function constrainToBounds(position: Position, bounds: Bounds): Position {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, position.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, position.y)),
  };
}
