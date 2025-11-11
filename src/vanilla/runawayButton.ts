import { constrainToBounds, type Position } from '../utils/randomPosition';
import {
  calculateEvasion,
  addEvasionJitter,
  isElementCornered,
  calculateEscapeRoute,
} from '../utils/evasionLogic';
import { warnProductionUsage, componentLoggers } from '../utils/logger';

export interface RunawayOptions {
  speed?: number;
  evasionDistance?: number;
  jitter?: number;
  container?: HTMLElement; // defaults to element.parentElement
}

export function makeButtonRunaway(element: HTMLElement, options: RunawayOptions = {}) {
  const speed = options.speed ?? 1;
  const evasionDistance = options.evasionDistance ?? 120;
  const jitter = options.jitter ?? 6;
  const container = options.container ?? (element.parentElement as HTMLElement | null) ?? document.body;
  const logger = componentLoggers.runawayButton;

  warnProductionUsage('RunawayButton (vanilla)');

  // Ensure positioning
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  const initialPositioning = getComputedStyle(element).position;
  if (initialPositioning === 'static') {
    element.style.position = 'absolute';
  }

  // Initialize position roughly centered
  const cRect = container.getBoundingClientRect();
  const eRect = element.getBoundingClientRect();
  let pos: Position = {
    x: Math.max(0, (cRect.width - eRect.width) / 2),
    y: Math.max(0, (cRect.height - eRect.height) / 2),
  };
  element.style.left = `${pos.x}px`;
  element.style.top = `${pos.y}px`;

  function onMouseMove(ev: MouseEvent) {
    const cRect = container.getBoundingClientRect();
    const eRect = element.getBoundingClientRect();
    const threat: Position = { x: ev.clientX - cRect.left, y: ev.clientY - cRect.top };

    const result = calculateEvasion(
      { x: pos.x + eRect.width / 2, y: pos.y + eRect.height / 2 },
      threat,
      { evasionDistance, speed }
    );

    if (result.shouldEvade && result.newPosition) {
      let next: Position = {
        x: result.newPosition.x - eRect.width / 2,
        y: result.newPosition.y - eRect.height / 2,
      };

      if (isElementCornered(pos, cRect.width, cRect.height, 50)) {
        const escape = calculateEscapeRoute(pos, cRect.width, cRect.height);
        next = { x: escape.x, y: escape.y };
      }

      next = addEvasionJitter(next, jitter);
      const constrained = constrainToBounds(
        next,
        { minX: 0, minY: 0, maxX: Math.max(0, cRect.width - eRect.width), maxY: Math.max(0, cRect.height - eRect.height) }
      );

      pos = constrained;
      element.style.left = `${pos.x}px`;
      element.style.top = `${pos.y}px`;

      logger.debug('Evading to', constrained);
    }
  }

  container.addEventListener('mousemove', onMouseMove);

  return function cleanup() {
    container.removeEventListener('mousemove', onMouseMove);
  };
}

