# Utilities API Reference

This document provides comprehensive API documentation for all utility functions and bot detection tools provided by anti-ai-ui.

## Table of Contents

- [Bot Detection Utilities](#bot-detection-utilities)
  - [PerfectMovementDetector](#perfectmovementdetector)
  - [ExactClickDetector](#exactclickdetector)
  - [TimingDetector](#timingdetector)
  - [PatternDetector](#patterndetector)
- [Position and Movement Utilities](#position-and-movement-utilities)
  - [randomPosition](#randomposition)
  - [distance](#distance)
  - [constrainToBounds](#constraintobounds)
  - [getElementBounds](#getelementbounds)
- [Evasion Logic Utilities](#evasion-logic-utilities)
  - [calculateEvasion](#calculateevasion)
  - [calculateAdaptiveEvasion](#calculateadaptiveevasion)
  - [addEvasionJitter](#addevasionjitter)
  - [isElementCornered](#iselementcornered)
  - [calculateEscapeRoute](#calculateescaperoute)
- [Logging Utilities](#logging-utilities)
  - [logger](#logger)
  - [createLogger](#createlogger)
  - [warnProductionUsage](#warnproductionusage)

---

## Bot Detection Utilities

Advanced algorithms for identifying non-human interaction patterns.

### PerfectMovementDetector

Detects suspiciously perfect mouse movements that may indicate automated behavior. Real humans exhibit natural jitter and variation, while bots often move in perfectly straight lines or with exact intervals.

#### Import

```typescript
import { PerfectMovementDetector } from 'anti-ai-ui/utils';
```

#### Constructor

```typescript
new PerfectMovementDetector(options?: PerfectMovementDetectorOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minPoints` | `number` | `10` | Minimum number of points required for analysis. |
| `perfectnessThreshold` | `number` | `0.02` | Threshold for considering movement "too perfect" (0-1, lower = stricter). |
| `timeWindow` | `number` | `1000` | Time window in milliseconds to analyze. |

#### Methods

##### `addPoint(x: number, y: number): void`

Adds a mouse position point to the analysis buffer.

```typescript
const detector = new PerfectMovementDetector();

element.addEventListener('mousemove', (e) => {
  detector.addPoint(e.clientX, e.clientY);
});
```

##### `isPerfectMovement(): boolean`

Returns `true` if the movement pattern is suspiciously perfect, indicating possible automation.

```typescript
if (detector.isPerfectMovement()) {
  console.log('Bot-like movement detected');
  // Implement verification step
}
```

##### `getScore(): number`

Returns a score between 0-1 indicating the likelihood of bot behavior (1 = most likely bot).

```typescript
const score = detector.getScore();
console.log(`Bot probability: ${(score * 100).toFixed(1)}%`);
```

##### `reset(): void`

Clears all collected points.

```typescript
detector.reset();
```

#### Complete Example

```typescript
import { PerfectMovementDetector } from 'anti-ai-ui/utils';

const detector = new PerfectMovementDetector({
  minPoints: 15,
  perfectnessThreshold: 0.03,
  timeWindow: 2000
});

let botDetected = false;

document.addEventListener('mousemove', (e) => {
  detector.addPoint(e.clientX, e.clientY);

  if (detector.isPerfectMovement() && !botDetected) {
    botDetected = true;
    console.warn('Automated behavior detected');

    // Optional: Show verification challenge
    showVerificationChallenge();
  }
});

// Reset on page interactions
document.addEventListener('click', () => {
  detector.reset();
  botDetected = false;
});
```

#### Detection Algorithm

The detector analyzes three key metrics:

1. **Straightness Score**: Measures deviation from a straight line
2. **Timing Uniformity**: Detects unnaturally consistent timing between points
3. **Jitter Score**: Evaluates natural mouse movement variation

---

### ExactClickDetector

Identifies clicks that occur at pixel-perfect positions, which are uncommon in human behavior.

#### Import

```typescript
import { ExactClickDetector } from 'anti-ai-ui/utils';
```

#### Constructor

```typescript
new ExactClickDetector(options?: ExactClickDetectorOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tolerance` | `number` | `5` | Pixel tolerance for considering clicks "exact" (smaller = stricter). |
| `sampleSize` | `number` | `10` | Number of recent clicks to analyze. |
| `exactThreshold` | `number` | `0.7` | Ratio of exact clicks to total clicks to flag as suspicious (0-1). |

#### Methods

##### `addClick(x: number, y: number): void`

Records a click position for analysis.

```typescript
const detector = new ExactClickDetector();

button.addEventListener('click', (e) => {
  detector.addClick(e.clientX, e.clientY);
});
```

##### `isExactClicking(): boolean`

Returns `true` if the clicking pattern is suspiciously exact.

```typescript
if (detector.isExactClicking()) {
  console.log('Pixel-perfect clicking detected');
}
```

##### `reset(): void`

Clears all recorded click positions.

#### Example

```typescript
import { ExactClickDetector } from 'anti-ai-ui/utils';

const detector = new ExactClickDetector({
  tolerance: 3,
  sampleSize: 15,
  exactThreshold: 0.6
});

const buttons = document.querySelectorAll('.download-button');

buttons.forEach(button => {
  button.addEventListener('click', (e) => {
    detector.addClick(e.clientX, e.clientY);

    if (detector.isExactClicking()) {
      console.warn('Automated clicking detected');
      // Implement countermeasure
    }
  });
});
```

---

### TimingDetector

Measures reaction times and identifies unnaturally fast or consistent responses.

#### Import

```typescript
import { TimingDetector } from 'anti-ai-ui/utils';
```

#### Constructor

```typescript
new TimingDetector(options?: TimingDetectorOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minReactionTime` | `number` | `100` | Minimum humanly possible reaction time in ms. |
| `maxReactionTime` | `number` | `5000` | Maximum reasonable reaction time in ms. |
| `sampleSize` | `number` | `10` | Number of recent events to analyze. |

#### Methods

##### `startEvent(eventId: string): void`

Starts timing for a specific event.

```typescript
const detector = new TimingDetector();

// When showing a button
detector.startEvent('button-appear');
```

##### `endEvent(eventId: string): number | null`

Ends timing for an event and returns the reaction time in milliseconds.

```typescript
button.addEventListener('click', () => {
  const reactionTime = detector.endEvent('button-appear');
  console.log(`Reaction time: ${reactionTime}ms`);
});
```

##### `isSuspiciousTiming(): boolean`

Returns `true` if timing patterns are suspicious (too fast or too consistent).

```typescript
if (detector.isSuspiciousTiming()) {
  console.log('Suspicious timing detected');
}
```

##### `getAverageReactionTime(): number`

Returns the average reaction time across all recorded events.

##### `reset(): void`

Clears all timing data.

#### Example

```typescript
import { TimingDetector } from 'anti-ai-ui/utils';

const detector = new TimingDetector({
  minReactionTime: 150,
  maxReactionTime: 3000
});

function showChallenge() {
  detector.startEvent('challenge-shown');

  document.getElementById('submit').addEventListener('click', () => {
    const reactionTime = detector.endEvent('challenge-shown');

    if (detector.isSuspiciousTiming()) {
      console.warn('Inhuman reaction speed detected');
      // Show additional verification
    } else {
      console.log(`Human-like reaction: ${reactionTime}ms`);
    }
  });
}
```

---

### PatternDetector

Analyzes sequences of actions for repetitive or predictable patterns characteristic of automation.

#### Import

```typescript
import { PatternDetector } from 'anti-ai-ui/utils';
```

#### Constructor

```typescript
new PatternDetector(options?: PatternDetectorOptions)
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maxSequenceLength` | `number` | `20` | Maximum number of actions to track. |
| `patternThreshold` | `number` | `0.7` | Repetition ratio to flag as suspicious (0-1). |

#### Methods

##### `addAction(action: string): void`

Records an action in the sequence.

```typescript
const detector = new PatternDetector();

detector.addAction('click-button-1');
detector.addAction('wait-2s');
detector.addAction('click-button-2');
```

##### `hasRepetitivePattern(): boolean`

Returns `true` if the action sequence shows repetitive patterns.

```typescript
if (detector.hasRepetitivePattern()) {
  console.log('Repetitive behavior detected');
}
```

##### `getSequence(): string[]`

Returns the current action sequence.

##### `reset(): void`

Clears the action sequence.

#### Example

```typescript
import { PatternDetector } from 'anti-ai-ui/utils';

const detector = new PatternDetector({
  maxSequenceLength: 30,
  patternThreshold: 0.65
});

// Track user actions
document.querySelectorAll('button').forEach((btn, index) => {
  btn.addEventListener('click', () => {
    detector.addAction(`click-button-${index}`);

    if (detector.hasRepetitivePattern()) {
      console.warn('Automated pattern detected');
      // Implement verification
    }
  });
});
```

---

## Position and Movement Utilities

Helper functions for positioning elements and calculating spatial relationships.

### randomPosition

Generates a random position within specified bounds.

#### Import

```typescript
import { randomPosition } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function randomPosition(options?: RandomPositionOptions): Position
```

**Options:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minX` | `number` | `0` | Minimum X coordinate. |
| `maxX` | `number` | `window.innerWidth` | Maximum X coordinate. |
| `minY` | `number` | `0` | Minimum Y coordinate. |
| `maxY` | `number` | `window.innerHeight` | Maximum Y coordinate. |
| `padding` | `number` | `0` | Padding from edges in pixels. |

**Returns:** `{ x: number; y: number }`

#### Example

```typescript
import { randomPosition } from 'anti-ai-ui/utils';

const pos = randomPosition({
  minX: 0,
  maxX: 800,
  minY: 0,
  maxY: 600,
  padding: 20
});

element.style.left = `${pos.x}px`;
element.style.top = `${pos.y}px`;
```

---

### distance

Calculates the Euclidean distance between two points.

#### Import

```typescript
import { distance } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function distance(p1: Position, p2: Position): number
```

#### Example

```typescript
import { distance } from 'anti-ai-ui/utils';

const cursorPos = { x: 100, y: 200 };
const buttonPos = { x: 150, y: 250 };

const dist = distance(cursorPos, buttonPos);
console.log(`Distance: ${dist}px`);
```

---

### constrainToBounds

Constrains a position to stay within specified bounds.

#### Import

```typescript
import { constrainToBounds } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function constrainToBounds(position: Position, bounds: Bounds): Position
```

**Bounds:**

```typescript
interface Bounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}
```

#### Example

```typescript
import { constrainToBounds } from 'anti-ai-ui/utils';

const pos = { x: 1500, y: -50 };
const bounds = { minX: 0, minY: 0, maxX: 1000, maxY: 800 };

const constrained = constrainToBounds(pos, bounds);
// Result: { x: 1000, y: 0 }
```

---

### getElementBounds

Gets the bounding box of an element as a Bounds object.

#### Import

```typescript
import { getElementBounds } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function getElementBounds(element: HTMLElement): Bounds
```

#### Example

```typescript
import { getElementBounds } from 'anti-ai-ui/utils';

const container = document.getElementById('container');
const bounds = getElementBounds(container);

console.log(bounds);
// { minX: 0, minY: 0, maxX: 500, maxY: 300 }
```

---

## Evasion Logic Utilities

Advanced algorithms for implementing evasive movement patterns.

### calculateEvasion

Calculates the optimal evasion position away from a threat.

#### Import

```typescript
import { calculateEvasion } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function calculateEvasion(
  elementPos: Position,
  threatPos: Position,
  options: EvasionOptions
): EvasionResult
```

**Options:**

```typescript
interface EvasionOptions {
  evasionDistance: number; // Distance at which to trigger evasion
  speed: number;           // Speed multiplier
}
```

**Returns:**

```typescript
interface EvasionResult {
  shouldEvade: boolean;
  newPosition: Position | null;
  distance: number;
}
```

#### Example

```typescript
import { calculateEvasion } from 'anti-ai-ui/utils';

const buttonPos = { x: 200, y: 200 };
const cursorPos = { x: 180, y: 180 };

const result = calculateEvasion(buttonPos, cursorPos, {
  evasionDistance: 100,
  speed: 1.2
});

if (result.shouldEvade && result.newPosition) {
  element.style.left = `${result.newPosition.x}px`;
  element.style.top = `${result.newPosition.y}px`;
}
```

---

### calculateAdaptiveEvasion

Calculates evasion with adaptive behavior based on pursuit history.

#### Import

```typescript
import { calculateAdaptiveEvasion } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function calculateAdaptiveEvasion(
  elementPos: Position,
  threatPos: Position,
  options: EvasionOptions & { fear?: number }
): EvasionResult
```

The `fear` parameter (0-1) increases evasion distance and speed based on how aggressively the element is being pursued.

---

### addEvasionJitter

Adds random jitter to a position to make movement less predictable.

#### Import

```typescript
import { addEvasionJitter } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function addEvasionJitter(position: Position, jitter: number): Position
```

#### Example

```typescript
import { addEvasionJitter } from 'anti-ai-ui/utils';

const pos = { x: 100, y: 100 };
const jittered = addEvasionJitter(pos, 10);

// jittered might be { x: 107, y: 93 }
```

---

### isElementCornered

Checks if an element is cornered (near edges) and may need escape logic.

#### Import

```typescript
import { isElementCornered } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function isElementCornered(
  position: Position,
  containerWidth: number,
  containerHeight: number,
  threshold: number
): boolean
```

#### Example

```typescript
import { isElementCornered } from 'anti-ai-ui/utils';

const pos = { x: 10, y: 10 };

if (isElementCornered(pos, 800, 600, 50)) {
  console.log('Element is cornered!');
  // Use escape route logic
}
```

---

### calculateEscapeRoute

Calculates an escape route toward the center when cornered.

#### Import

```typescript
import { calculateEscapeRoute } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function calculateEscapeRoute(
  position: Position,
  containerWidth: number,
  containerHeight: number
): Position
```

#### Example

```typescript
import { calculateEscapeRoute, isElementCornered } from 'anti-ai-ui/utils';

if (isElementCornered(pos, width, height, 50)) {
  const escapePos = calculateEscapeRoute(pos, width, height);
  // Move element to escapePos
}
```

---

## Logging Utilities

Configurable logging system for debugging and monitoring.

### logger

Global logger instance with multiple log levels.

#### Import

```typescript
import { logger } from 'anti-ai-ui/utils';
```

#### Methods

```typescript
logger.debug('Debug message', data);
logger.info('Info message', data);
logger.warn('Warning message', data);
logger.error('Error message', data);
```

#### Example

```typescript
import { logger } from 'anti-ai-ui/utils';

logger.setLevel('debug'); // 'debug' | 'info' | 'warn' | 'error' | 'none'

logger.debug('Component mounted');
logger.info('User interaction detected');
logger.warn('Bot-like behavior detected');
logger.error('Critical error occurred');
```

---

### createLogger

Creates a custom logger instance with a specific prefix.

#### Import

```typescript
import { createLogger } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function createLogger(prefix: string, options?: LoggerOptions): Logger
```

#### Example

```typescript
import { createLogger } from 'anti-ai-ui/utils';

const myLogger = createLogger('MyComponent', { level: 'debug' });

myLogger.info('Component initialized');
myLogger.debug('Processing data:', data);
```

---

### warnProductionUsage

Logs a warning when a component is used in production environments.

#### Import

```typescript
import { warnProductionUsage } from 'anti-ai-ui/utils';
```

#### Signature

```typescript
function warnProductionUsage(componentName: string): void
```

This is automatically called by all components and helps developers understand deployment context.

---

## TypeScript Types

All utilities export comprehensive TypeScript types:

```typescript
import type {
  // Bot Detection
  MouseMovementPoint,
  PerfectMovementDetectorOptions,
  ClickPoint,
  ExactClickDetectorOptions,
  TimingEvent,
  TimingDetectorOptions,
  ActionSequence,
  PatternDetectorOptions,

  // Position & Movement
  Position,
  Bounds,
  RandomPositionOptions,

  // Evasion
  EvasionOptions,
  EvasionResult,

  // Logging
  LogLevel,
  LoggerOptions
} from 'anti-ai-ui/utils';
```

---

## Best Practices

### Combining Detectors

For robust bot detection, combine multiple detectors:

```typescript
import {
  PerfectMovementDetector,
  ExactClickDetector,
  TimingDetector
} from 'anti-ai-ui/utils';

const movementDetector = new PerfectMovementDetector();
const clickDetector = new ExactClickDetector();
const timingDetector = new TimingDetector();

let botScore = 0;

document.addEventListener('mousemove', (e) => {
  movementDetector.addPoint(e.clientX, e.clientY);
  if (movementDetector.isPerfectMovement()) botScore += 0.4;
});

button.addEventListener('click', (e) => {
  clickDetector.addClick(e.clientX, e.clientY);
  if (clickDetector.isExactClicking()) botScore += 0.3;

  const reactionTime = timingDetector.endEvent('button-shown');
  if (timingDetector.isSuspiciousTiming()) botScore += 0.3;

  if (botScore >= 0.7) {
    console.warn('High confidence bot detection');
    showVerificationChallenge();
  }
});
```

### Performance Considerations

- Bot detectors maintain buffers of recent events
- Use the `timeWindow` and `sampleSize` options to control memory usage
- Call `reset()` methods periodically to clear old data
- Consider debouncing high-frequency events like `mousemove`

### Browser Compatibility

All utilities work in modern browsers:
- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 12+)
- Opera: ✅ Full support
