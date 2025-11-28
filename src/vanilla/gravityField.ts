import { componentLoggers } from '../utils/logger';

export interface GravityWell {
  x: number;
  y: number;
  strength: number;
}

export type WellFollowMode = 'follow' | 'fixed' | 'repel' | 'orbit';

export interface GravityFieldOptions {
  wellCount?: number;
  wellStrength?: number;
  noise?: number;
  reseedOnHover?: boolean;
  updateInterval?: number;
  followMode?: WellFollowMode;
  followSpeed?: number;
  showWells?: boolean;
  wellColor?: string;
}

interface DriftingElement {
  element: HTMLElement;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
}

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
    const distance = Math.sqrt(dx * dx + dy * dy);

    const effectiveDistance = Math.max(distance, 20);
    const force = (well.strength * 1000) / (effectiveDistance * effectiveDistance);

    if (distance > 0) {
      fx += (dx / distance) * force;
      fy += (dy / distance) * force;
    }
  }

  const maxForce = 5;
  const totalForce = Math.sqrt(fx * fx + fy * fy);
  if (totalForce > maxForce) {
    fx = (fx / totalForce) * maxForce;
    fy = (fy / totalForce) * maxForce;
  }

  return { fx, fy };
}

export function makeGravityField(container: HTMLElement, options: GravityFieldOptions = {}) {
  const {
    wellCount = 3,
    wellStrength = 0.5,
    noise = 2,
    reseedOnHover = true,
    updateInterval = 50,
    followMode = 'follow',
    followSpeed = 0.005,
    showWells = true,
    wellColor = '#e94560',
  } = options;

  const logger = componentLoggers.gravityField;

  // Ensure positioning
  if (getComputedStyle(container).position === 'static') {
    container.style.position = 'relative';
  }
  container.style.overflow = 'hidden';

  const containerRect = container.getBoundingClientRect();
  const width = containerRect.width || 400;
  const height = containerRect.height || 300;

  // Initialize gravity wells
  let wells = generateWells(wellCount, width, height, wellStrength);
  logger.debug('Initialized gravity wells', wells);

  // Create well visualization elements
  let wellElements: HTMLElement[] = [];

  // Add keyframes for spiral animation
  const styleId = 'gravity-field-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
      @keyframes gravity-spiral-in {
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
      }
    `;
    document.head.appendChild(styleEl);
  }

  function createWellElements() {
    // Remove old elements
    wellElements.forEach(el => el.remove());
    wellElements = [];

    if (!showWells) return;

    wells.forEach(well => {
      const el = document.createElement('div');
      const size = 90 + well.strength * 60;
      el.style.cssText = `
        position: absolute;
        left: ${well.x}px;
        top: ${well.y}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        pointer-events: none;
        transform: translate(-50%, -50%);
      `;

      // Add spiraling particles
      const delays = [0, 0.5, 1, 1.5, 2];
      delays.forEach(delay => {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: absolute;
          width: 3px;
          height: 3px;
          background: ${wellColor};
          border-radius: 50%;
          top: 50%;
          left: 50%;
          animation: gravity-spiral-in 2.5s linear infinite ${delay}s;
        `;
        el.appendChild(particle);
      });

      // Black center core
      const core = document.createElement('div');
      core.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 14px;
        height: 14px;
        background: #000;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 8px 4px rgba(0, 0, 0, 0.8);
      `;
      el.appendChild(core);

      container.appendChild(el);
      wellElements.push(el);
    });
  }

  function updateWellElements() {
    if (!showWells) return;
    wellElements.forEach((el, i) => {
      if (wells[i]) {
        el.style.left = `${wells[i].x}px`;
        el.style.top = `${wells[i].y}px`;
      }
    });
  }

  // Get all direct children BEFORE adding wells
  const children = Array.from(container.children) as HTMLElement[];

  createWellElements();
  const driftingElements: DriftingElement[] = children.map((element, index) => {
    element.style.position = 'absolute';
    element.style.transition = 'none';

    const x = 50 + (index % 3) * 100;
    const y = 50 + Math.floor(index / 3) * 80;

    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    element.style.transform = 'translate(-50%, -50%)';

    return {
      element,
      x,
      y,
      velocityX: 0,
      velocityY: 0,
    };
  });

  let animationId: number | null = null;
  let lastUpdate = 0;

  function updatePositions(timestamp: number) {
    if (timestamp - lastUpdate < updateInterval) {
      animationId = requestAnimationFrame(updatePositions);
      return;
    }
    lastUpdate = timestamp;

    const padding = 40;

    for (const item of driftingElements) {
      const { fx, fy } = calculateGravityForce(item.x, item.y, wells);

      const noiseX = (Math.random() - 0.5) * noise * 2;
      const noiseY = (Math.random() - 0.5) * noise * 2;

      const damping = 0.92;
      item.velocityX = (item.velocityX + fx) * damping + noiseX;
      item.velocityY = (item.velocityY + fy) * damping + noiseY;

      item.x += item.velocityX;
      item.y += item.velocityY;

      if (item.x < padding) {
        item.x = padding;
        item.velocityX = Math.abs(item.velocityX) * 0.5;
      } else if (item.x > width - padding) {
        item.x = width - padding;
        item.velocityX = -Math.abs(item.velocityX) * 0.5;
      }

      if (item.y < padding) {
        item.y = padding;
        item.velocityY = Math.abs(item.velocityY) * 0.5;
      } else if (item.y > height - padding) {
        item.y = height - padding;
        item.velocityY = -Math.abs(item.velocityY) * 0.5;
      }

      item.element.style.left = `${item.x}px`;
      item.element.style.top = `${item.y}px`;
    }

    updateWellElements();

    animationId = requestAnimationFrame(updatePositions);
  }

  // Start animation
  animationId = requestAnimationFrame(updatePositions);

  // Event handlers
  function handleMouseEnter() {
    if (!reseedOnHover) return;
    wells = generateWells(wellCount, width, height, wellStrength);
    createWellElements();
    logger.debug('Reseeded gravity wells on hover', wells);
  }

  function handleMouseMove(e: MouseEvent) {
    if (followMode === 'fixed') return;

    const rect = container.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    wells = wells.map((well, i) => {
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
        const angle = Date.now() / 1000 + i * ((Math.PI * 2) / wells.length);
        const orbitRadius = 80 + i * 30;
        return {
          ...well,
          x: well.x + (mouseX + Math.cos(angle) * orbitRadius - well.x) * followSpeed,
          y: well.y + (mouseY + Math.sin(angle) * orbitRadius - well.y) * followSpeed,
        };
      }
      return well;
    });
  }

  container.addEventListener('mouseenter', handleMouseEnter);
  container.addEventListener('mousemove', handleMouseMove);

  // Return cleanup function
  return function cleanup() {
    if (animationId) {
      cancelAnimationFrame(animationId);
    }
    container.removeEventListener('mouseenter', handleMouseEnter);
    container.removeEventListener('mousemove', handleMouseMove);

    // Remove well elements
    wellElements.forEach(el => el.remove());
    wellElements = [];

    for (const item of driftingElements) {
      item.element.style.position = '';
      item.element.style.left = '';
      item.element.style.top = '';
      item.element.style.transform = '';
      item.element.style.transition = '';
    }
  };
}
