/**
 * Debug logging utilities for the framework
 * Helps developers understand what's happening without cluttering production
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerOptions {
  /** Enable/disable logging */
  enabled?: boolean;
  /** Minimum log level to display */
  level?: LogLevel;
  /** Prefix for all log messages */
  prefix?: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private options: Required<LoggerOptions>;

  constructor(options: LoggerOptions = {}) {
    this.options = {
      enabled: options.enabled ?? true,
      level: options.level ?? 'info',
      prefix: options.prefix ?? '[anti-ai-ui]',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.options.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.options.level];
  }

  private formatMessage(message: string): string {
    return `${this.options.prefix} ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage(message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage(message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage(message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage(message), ...args);
    }
  }

  group(label: string): void {
    if (this.options.enabled) {
      console.group(this.formatMessage(label));
    }
  }

  groupEnd(): void {
    if (this.options.enabled) {
      console.groupEnd();
    }
  }

  table(data: unknown): void {
    if (this.options.enabled) {
      console.table(data);
    }
  }

  setEnabled(enabled: boolean): void {
    this.options.enabled = enabled;
  }

  setLevel(level: LogLevel): void {
    this.options.level = level;
  }
}

// Default logger instance
export const logger = new Logger();

/**
 * Create a scoped logger with a specific prefix
 */
export function createLogger(prefix: string, options?: LoggerOptions): Logger {
  return new Logger({
    ...options,
    prefix: `[anti-ai-ui:${prefix}]`,
  });
}

/**
 * Component-specific loggers
 */
export const componentLoggers = {
  runawayButton: createLogger('RunawayButton'),
  fakeDownloadGrid: createLogger('FakeDownloadGrid'),
  cookieHell: createLogger('CookieHell'),
  popupChaos: createLogger('PopupChaos'),
  passwordHell: createLogger('PasswordHell'),
  shiftingInterface: createLogger('ShiftingInterface'),
  semanticGaslighting: createLogger('SemanticGaslighting'),
  mitosisButton: createLogger('MitosisButton'),
  threeFormCarousel: createLogger('ThreeFormCarousel'),
  tabIndexRandomization: createLogger('TabIndexRandomization'),
  trafficLightForm: createLogger('TrafficLightForm'),
  fakeMarqueeFields: createLogger('FakeMarqueeFields'),
  formChaos: createLogger('FormChaos'),
  glitchText: createLogger('GlitchText'),
  floatingBannerAds: createLogger('FloatingBannerAds'),
  labelPositionSwap: createLogger('LabelPositionSwap'),
  opacityFlash: createLogger('OpacityFlash'),
  marqueeInputs: createLogger('MarqueeInputs'),
  gravityField: createLogger('GravityField'),
  pendulumFields: createLogger('PendulumFields'),
};

/**
 * Log bot detection event
 */
export function logBotDetection(
  detectorType: string,
  score: number,
  details?: Record<string, unknown>
): void {
  logger.info(`Bot detection: ${detectorType} (score: ${score.toFixed(2)})`, details);
}
