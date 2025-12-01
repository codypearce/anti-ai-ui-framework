import { componentLoggers } from '../utils/logger';

export interface RunawayOptions {
  /** Distance in pixels at which evasion triggers */
  evasionDistance?: number;
  /** How far to move when evading (pixels) */
  escapeDistance?: number;
  /** Container element - defaults to element.parentElement */
  container?: HTMLElement;
  /** Called when user clicks the button */
  onCatch?: () => void;
}

export function makeButtonRunaway(element: HTMLElement, options: RunawayOptions = {}) {
  const evasionDistance = options.evasionDistance ?? 120;
  const escapeDistance = options.escapeDistance ?? 80;
  const container = options.container ?? (element.parentElement as HTMLElement | null) ?? document.body;
  const onCatch = options.onCatch;
  const logger = componentLoggers.runawayButton;

  // Ensure container has relative positioning
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.style.overflow = 'hidden';

  // Style element for smooth movement
  element.style.position = 'absolute';
  element.style.transform = 'translate(-50%, -50%)';
  element.style.transition = 'left 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)';
  element.style.userSelect = 'none';

  function setPosition(x: number, y: number) {
    element.style.left = `${x}%`;
    element.style.top = `${y}%`;
  }

  // Initialize centered
  setPosition(50, 50);

  function onMouseMove(ev: MouseEvent) {
    const cRect = container.getBoundingClientRect();
    const mouseX = ev.clientX - cRect.left;
    const mouseY = ev.clientY - cRect.top;

    // Get button center position
    const eRect = element.getBoundingClientRect();
    const btnCenterX = eRect.left + eRect.width / 2 - cRect.left;
    const btnCenterY = eRect.top + eRect.height / 2 - cRect.top;

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

      setPosition(newX, newY);
      logger.debug('Evading to', { x: newX, y: newY });
    }
  }

  function onClick() {
    if (onCatch) {
      onCatch();
    }
  }

  container.addEventListener('mousemove', onMouseMove);
  element.addEventListener('click', onClick);

  return function cleanup() {
    container.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('click', onClick);
    // Reset styles
    element.style.position = '';
    element.style.left = '';
    element.style.top = '';
    element.style.transform = '';
    element.style.transition = '';
    element.style.userSelect = '';
  };
}

