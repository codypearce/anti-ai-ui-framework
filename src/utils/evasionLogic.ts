/**
 * Logic for calculating element evasion behavior
 * Used by components that need to "run away" from cursor/interactions
 */

import { Position, distance } from './randomPosition';

export interface EvasionOptions {
  /** Distance at which to start evading */
  evasionDistance: number;
  /** Speed multiplier for evasion movement */
  speed: number;
  /** Maximum distance to move in single step */
  maxStep?: number;
  /** Easing function for smoother movement */
  easing?: (t: number) => number;
}

export interface EvasionResult {
  shouldEvade: boolean;
  newPosition: Position | null;
  distance: number;
}

/**
 * Default easing function (ease-out)
 */
function defaultEasing(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

/**
 * Calculate if and where an element should move to evade a position
 */
export function calculateEvasion(
  elementPosition: Position,
  threatPosition: Position,
  options: EvasionOptions
): EvasionResult {
  const dist = distance(elementPosition, threatPosition);
  const { evasionDistance, speed, maxStep = 100, easing = defaultEasing } = options;

  if (dist >= evasionDistance) {
    return {
      shouldEvade: false,
      newPosition: null,
      distance: dist,
    };
  }

  // Calculate direction away from threat
  const dx = elementPosition.x - threatPosition.x;
  const dy = elementPosition.y - threatPosition.y;

  // Normalize direction
  const magnitude = Math.sqrt(dx * dx + dy * dy);
  const normalizedDx = magnitude > 0 ? dx / magnitude : 0;
  const normalizedDy = magnitude > 0 ? dy / magnitude : 0;

  // Calculate evasion intensity (stronger when closer)
  const intensity = easing(1 - dist / evasionDistance);

  // Calculate movement distance
  const moveDistance = Math.min(intensity * speed * 50, maxStep);

  // Calculate new position
  const newPosition: Position = {
    x: elementPosition.x + normalizedDx * moveDistance,
    y: elementPosition.y + normalizedDy * moveDistance,
  };

  return {
    shouldEvade: true,
    newPosition,
    distance: dist,
  };
}

/**
 * Calculate evasion with "fear" factor that increases over time
 */
export function calculateAdaptiveEvasion(
  elementPosition: Position,
  threatPosition: Position,
  options: EvasionOptions,
  fearLevel: number = 0
): EvasionResult {
  const baseResult = calculateEvasion(elementPosition, threatPosition, options);

  if (!baseResult.shouldEvade || !baseResult.newPosition) {
    return baseResult;
  }

  // Increase evasion distance based on fear
  const fearMultiplier = 1 + fearLevel * 0.5;
  const enhancedDistance = options.evasionDistance * fearMultiplier;

  if (baseResult.distance < enhancedDistance) {
    const additionalMove = (enhancedDistance - baseResult.distance) * 0.1;

    const dx = elementPosition.x - threatPosition.x;
    const dy = elementPosition.y - threatPosition.y;
    const magnitude = Math.sqrt(dx * dx + dy * dy);
    const normalizedDx = magnitude > 0 ? dx / magnitude : 0;
    const normalizedDy = magnitude > 0 ? dy / magnitude : 0;

    baseResult.newPosition = {
      x: baseResult.newPosition.x + normalizedDx * additionalMove,
      y: baseResult.newPosition.y + normalizedDy * additionalMove,
    };
  }

  return baseResult;
}

/**
 * Add randomness to evasion to make it less predictable
 */
export function addEvasionJitter(
  position: Position,
  jitterAmount: number = 10
): Position {
  return {
    x: position.x + (Math.random() - 0.5) * jitterAmount,
    y: position.y + (Math.random() - 0.5) * jitterAmount,
  };
}

/**
 * Calculate if element is "cornered" (near edges)
 */
export function isElementCornered(
  position: Position,
  containerWidth: number,
  containerHeight: number,
  margin: number = 50
): boolean {
  return (
    position.x < margin ||
    position.x > containerWidth - margin ||
    position.y < margin ||
    position.y > containerHeight - margin
  );
}

/**
 * Calculate escape route when cornered
 */
export function calculateEscapeRoute(
  position: Position,
  containerWidth: number,
  containerHeight: number
): Position {
  // Move toward center when cornered
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const dx = centerX - position.x;
  const dy = centerY - position.y;

  const magnitude = Math.sqrt(dx * dx + dy * dy);
  const normalizedDx = magnitude > 0 ? dx / magnitude : 0;
  const normalizedDy = magnitude > 0 ? dy / magnitude : 0;

  // Move 100 pixels toward center
  return {
    x: position.x + normalizedDx * 100,
    y: position.y + normalizedDy * 100,
  };
}

/**
 * Predict where cursor will be based on velocity
 */
export function predictThreatPosition(
  currentPosition: Position,
  previousPosition: Position,
  predictionFactor: number = 2
): Position {
  const dx = currentPosition.x - previousPosition.x;
  const dy = currentPosition.y - previousPosition.y;

  return {
    x: currentPosition.x + dx * predictionFactor,
    y: currentPosition.y + dy * predictionFactor,
  };
}
