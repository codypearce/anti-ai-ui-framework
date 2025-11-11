// Bot Detection Utilities
export {
  PerfectMovementDetector,
  detectPerfectMovement,
  type MouseMovementPoint,
  type PerfectMovementDetectorOptions,
} from './detectPerfectMovement';

export {
  ExactClickDetector,
  detectExactClick,
  type ClickPoint,
  type ExactClickDetectorOptions,
} from './detectExactClicks';

export {
  TimingDetector,
  measureReactionTime,
  type TimingEvent,
  type TimingDetectorOptions,
} from './detectTiming';

export {
  PatternDetector,
  analyzeSequence,
  type ActionSequence,
  type PatternDetectorOptions,
} from './detectPatterns';

// Position and Movement Utilities
export {
  randomPosition,
  getElementBounds,
  getViewportBounds,
  getContainerBounds,
  distance,
  isWithinBounds,
  constrainToBounds,
  type Bounds,
  type Position,
  type RandomPositionOptions,
} from './randomPosition';

export {
  calculateEvasion,
  calculateAdaptiveEvasion,
  addEvasionJitter,
  isElementCornered,
  calculateEscapeRoute,
  predictThreatPosition,
  type EvasionOptions,
  type EvasionResult,
} from './evasionLogic';

// Logging Utilities
export {
  logger,
  createLogger,
  componentLoggers,
  warnProductionUsage,
  logBotDetection,
  type LogLevel,
  type LoggerOptions,
} from './logger';
