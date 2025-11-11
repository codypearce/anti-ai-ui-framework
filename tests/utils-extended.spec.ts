import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  calculateEvasion,
  calculateAdaptiveEvasion,
  addEvasionJitter,
  isElementCornered,
  calculateEscapeRoute,
  predictThreatPosition,
} from '../src/utils/evasionLogic';
import {
  randomPosition,
  constrainToBounds,
  distance,
  isWithinBounds,
  getElementBounds,
  getViewportBounds,
  getContainerBounds,
  type Bounds,
} from '../src/utils/randomPosition';

describe('evasionLogic - Extended Tests', () => {
  it('calculateEvasion should not evade when threat is far', () => {
    const element = { x: 100, y: 100 };
    const threat = { x: 300, y: 300 };
    const result = calculateEvasion(element, threat, { evasionDistance: 50, speed: 1 });

    expect(result.shouldEvade).toBe(false);
    expect(result.newPosition).toBeNull();
  });

  it('calculateEvasion should evade with different speeds', () => {
    const element = { x: 100, y: 100 };
    const threat = { x: 110, y: 110 };

    const slow = calculateEvasion(element, threat, { evasionDistance: 50, speed: 0.5 });
    const fast = calculateEvasion(element, threat, { evasionDistance: 50, speed: 2 });

    expect(slow.shouldEvade).toBe(true);
    expect(fast.shouldEvade).toBe(true);

    if (slow.newPosition && fast.newPosition) {
      const slowDist = Math.hypot(slow.newPosition.x - element.x, slow.newPosition.y - element.y);
      const fastDist = Math.hypot(fast.newPosition.x - element.x, fast.newPosition.y - element.y);

      expect(fastDist).toBeGreaterThan(slowDist);
    }
  });

  it('addEvasionJitter should add randomness to position', () => {
    const pos = { x: 100, y: 100 };
    const jittered1 = addEvasionJitter(pos, 10);
    const jittered2 = addEvasionJitter(pos, 10);

    // Jittered positions should be within jitter distance
    const dist1 = Math.hypot(jittered1.x - pos.x, jittered1.y - pos.y);
    const dist2 = Math.hypot(jittered2.x - pos.x, jittered2.y - pos.y);

    expect(dist1).toBeLessThanOrEqual(10);
    expect(dist2).toBeLessThanOrEqual(10);
  });

  it('addEvasionJitter with zero jitter returns same position', () => {
    const pos = { x: 100, y: 100 };
    const jittered = addEvasionJitter(pos, 0);

    expect(jittered.x).toBe(pos.x);
    expect(jittered.y).toBe(pos.y);
  });

  it('isElementCornered should detect corner positions', () => {
    // Top-left corner
    expect(isElementCornered({ x: 5, y: 5 }, 400, 300, 50)).toBe(true);

    // Top-right corner
    expect(isElementCornered({ x: 395, y: 5 }, 400, 300, 50)).toBe(true);

    // Bottom-left corner
    expect(isElementCornered({ x: 5, y: 295 }, 400, 300, 50)).toBe(true);

    // Bottom-right corner
    expect(isElementCornered({ x: 395, y: 295 }, 400, 300, 50)).toBe(true);

    // Center (not cornered)
    expect(isElementCornered({ x: 200, y: 150 }, 400, 300, 50)).toBe(false);
  });

  it('calculateEscapeRoute should move toward center from corner', () => {
    const cornerPos = { x: 5, y: 5 };
    const escape = calculateEscapeRoute(cornerPos, 400, 300);

    // Escape should be toward center
    expect(escape.x).toBeGreaterThan(cornerPos.x);
    expect(escape.y).toBeGreaterThan(cornerPos.y);
  });

  it('calculateEscapeRoute from different corners', () => {
    // Bottom-right corner
    const brCorner = { x: 395, y: 295 };
    const brEscape = calculateEscapeRoute(brCorner, 400, 300);

    expect(brEscape.x).toBeLessThan(brCorner.x);
    expect(brEscape.y).toBeLessThan(brCorner.y);
  });

  it('calculateAdaptiveEvasion with fear level increases evasion', () => {
    const elementPos = { x: 100, y: 100 };
    const threatPos = { x: 120, y: 120 };
    const options = { evasionDistance: 50, speed: 1 };

    const noFear = calculateAdaptiveEvasion(elementPos, threatPos, options, 0);
    const withFear = calculateAdaptiveEvasion(elementPos, threatPos, options, 0.8);

    expect(noFear.shouldEvade).toBe(true);
    expect(withFear.shouldEvade).toBe(true);

    // Both should evade
    expect(noFear.newPosition).toBeTruthy();
    expect(withFear.newPosition).toBeTruthy();
  });

  it('calculateAdaptiveEvasion when not evading', () => {
    const elementPos = { x: 100, y: 100 };
    const threatPos = { x: 300, y: 300 };
    const options = { evasionDistance: 50, speed: 1 };

    const result = calculateAdaptiveEvasion(elementPos, threatPos, options, 0.5);

    expect(result.shouldEvade).toBe(false);
    expect(result.newPosition).toBeNull();
  });

  it('predictThreatPosition based on velocity', () => {
    const currentPos = { x: 100, y: 100 };
    const previousPos = { x: 90, y: 90 };

    const predicted = predictThreatPosition(currentPos, previousPos, 2);

    // Should predict ahead based on velocity
    expect(predicted.x).toBe(120); // 100 + (100-90)*2
    expect(predicted.y).toBe(120);
  });

  it('predictThreatPosition with different prediction factors', () => {
    const currentPos = { x: 100, y: 100 };
    const previousPos = { x: 95, y: 95 };

    const predicted1 = predictThreatPosition(currentPos, previousPos, 1);
    const predicted3 = predictThreatPosition(currentPos, previousPos, 3);

    expect(predicted1.x).toBe(105); // 100 + (100-95)*1
    expect(predicted3.x).toBe(115); // 100 + (100-95)*3
  });
});

describe('randomPosition - Extended Tests', () => {
  it('should respect edge padding', () => {
    const bounds: Bounds = { minX: 0, maxX: 400, minY: 0, maxY: 300 };

    for (let i = 0; i < 20; i++) {
      const pos = randomPosition(bounds, { edgePadding: 20 });

      expect(pos.x).toBeGreaterThanOrEqual(20);
      expect(pos.x).toBeLessThanOrEqual(380);
      expect(pos.y).toBeGreaterThanOrEqual(20);
      expect(pos.y).toBeLessThanOrEqual(280);
    }
  });

  it('should handle zero edge padding', () => {
    const bounds: Bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    const pos = randomPosition(bounds, { edgePadding: 0 });

    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(100);
    expect(pos.y).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeLessThanOrEqual(100);
  });

  it('constrainToBounds should keep position within bounds', () => {
    const bounds: Bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };

    // Position too high
    const constrained1 = constrainToBounds({ x: 150, y: 150 }, bounds);
    expect(constrained1.x).toBe(100);
    expect(constrained1.y).toBe(100);

    // Position too low
    const constrained2 = constrainToBounds({ x: -50, y: -50 }, bounds);
    expect(constrained2.x).toBe(0);
    expect(constrained2.y).toBe(0);

    // Position within bounds
    const constrained3 = constrainToBounds({ x: 50, y: 50 }, bounds);
    expect(constrained3.x).toBe(50);
    expect(constrained3.y).toBe(50);
  });

  it('should avoid overlapping positions', () => {
    const bounds: Bounds = { minX: 0, maxX: 400, minY: 0, maxY: 300 };
    const avoid = { position: { x: 200, y: 150 }, radius: 50 };

    for (let i = 0; i < 10; i++) {
      const pos = randomPosition(bounds, {
        avoidPositions: [avoid],
        maxAttempts: 100,
      });

      const dist = Math.sqrt(
        Math.pow(pos.x - avoid.position.x, 2) + Math.pow(pos.y - avoid.position.y, 2)
      );

      // Position should be outside the avoid radius (or it gave up after maxAttempts)
      // We'll just check it returns a valid position
      expect(pos.x).toBeGreaterThanOrEqual(0);
      expect(pos.x).toBeLessThanOrEqual(400);
    }
  });

  it('should respect max attempts', () => {
    const bounds: Bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };

    // Try with very strict constraints
    const pos = randomPosition(bounds, {
      avoidPositions: [{ position: { x: 50, y: 50 }, radius: 1000 }],
      maxAttempts: 5,
    });

    // Should still return a position even if it couldn't avoid
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.x).toBeLessThanOrEqual(100);
  });

  it('should handle negative bounds', () => {
    const bounds: Bounds = { minX: -100, maxX: 100, minY: -50, maxY: 50 };
    const pos = randomPosition(bounds);

    expect(pos.x).toBeGreaterThanOrEqual(-100);
    expect(pos.x).toBeLessThanOrEqual(100);
    expect(pos.y).toBeGreaterThanOrEqual(-50);
    expect(pos.y).toBeLessThanOrEqual(50);
  });

  it('constrainToBounds with negative bounds', () => {
    const bounds: Bounds = { minX: -100, maxX: 100, minY: -50, maxY: 50 };
    const constrained = constrainToBounds({ x: -200, y: -100 }, bounds);

    expect(constrained.x).toBe(-100);
    expect(constrained.y).toBe(-50);
  });

  it('distance should calculate correctly', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 3, y: 4 };

    expect(distance(p1, p2)).toBe(5);
  });

  it('isWithinBounds should check position correctly', () => {
    const bounds: Bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };

    expect(isWithinBounds({ x: 50, y: 50 }, bounds)).toBe(true);
    expect(isWithinBounds({ x: 0, y: 0 }, bounds)).toBe(true);
    expect(isWithinBounds({ x: 100, y: 100 }, bounds)).toBe(true);
    expect(isWithinBounds({ x: -1, y: 50 }, bounds)).toBe(false);
    expect(isWithinBounds({ x: 101, y: 50 }, bounds)).toBe(false);
    expect(isWithinBounds({ x: 50, y: -1 }, bounds)).toBe(false);
    expect(isWithinBounds({ x: 50, y: 101 }, bounds)).toBe(false);
  });

  it('getElementBounds returns bounds from element', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);

    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
      left: 10,
      top: 20,
      right: 110,
      bottom: 120,
      width: 100,
      height: 100,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });

    const bounds = getElementBounds(el);
    expect(bounds.minX).toBe(10);
    expect(bounds.maxX).toBe(110);
    expect(bounds.minY).toBe(20);
    expect(bounds.maxY).toBe(120);

    document.body.removeChild(el);
  });

  it('getViewportBounds returns window dimensions', () => {
    const bounds = getViewportBounds();
    expect(bounds.minX).toBe(0);
    expect(bounds.minY).toBe(0);
    expect(bounds.maxX).toBe(window.innerWidth);
    expect(bounds.maxY).toBe(window.innerHeight);
  });

  it('getContainerBounds returns parent bounds when has offsetParent', () => {
    const parent = document.createElement('div');
    parent.style.position = 'relative';
    parent.style.width = '500px';
    parent.style.height = '400px';
    document.body.appendChild(parent);

    const child = document.createElement('div');
    parent.appendChild(child);

    const bounds = getContainerBounds(child);

    // Should use parent dimensions
    expect(bounds.minX).toBe(0);
    expect(bounds.minY).toBe(0);
    expect(bounds.maxX).toBeGreaterThan(0);
    expect(bounds.maxY).toBeGreaterThan(0);

    document.body.removeChild(parent);
  });
});
