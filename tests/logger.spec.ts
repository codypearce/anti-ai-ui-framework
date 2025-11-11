import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  logger,
  createLogger,
  warnProductionUsage,
  logBotDetection,
  type LogLevel,
} from '../src/utils/logger';

describe('logger utility', () => {
  let consoleDebugSpy: ReturnType<typeof vi.spyOn>;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn>;
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupSpy: ReturnType<typeof vi.spyOn>;
  let consoleGroupEndSpy: ReturnType<typeof vi.spyOn>;
  let consoleTableSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    consoleTableSpy = vi.spyOn(console, 'table').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log debug messages when level is debug', () => {
    const testLogger = createLogger('test', { level: 'debug' });
    testLogger.debug('debug message', { foo: 'bar' });

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[anti-ai-ui:test] debug message',
      { foo: 'bar' }
    );
  });

  it('should log info messages', () => {
    const testLogger = createLogger('test');
    testLogger.info('info message');

    expect(consoleInfoSpy).toHaveBeenCalledWith('[anti-ai-ui:test] info message');
  });

  it('should log warn messages', () => {
    const testLogger = createLogger('test');
    testLogger.warn('warn message');

    expect(consoleWarnSpy).toHaveBeenCalledWith('[anti-ai-ui:test] warn message');
  });

  it('should log error messages', () => {
    const testLogger = createLogger('test');
    testLogger.error('error message');

    expect(consoleErrorSpy).toHaveBeenCalledWith('[anti-ai-ui:test] error message');
  });

  it('should respect log level - info level skips debug', () => {
    const testLogger = createLogger('test', { level: 'info' });
    testLogger.debug('should not log');
    testLogger.info('should log');

    expect(consoleDebugSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).toHaveBeenCalled();
  });

  it('should respect log level - warn level skips info and debug', () => {
    const testLogger = createLogger('test', { level: 'warn' });
    testLogger.debug('no');
    testLogger.info('no');
    testLogger.warn('yes');

    expect(consoleDebugSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalled();
  });

  it('should respect log level - error level only logs errors', () => {
    const testLogger = createLogger('test', { level: 'error' });
    testLogger.debug('no');
    testLogger.info('no');
    testLogger.warn('no');
    testLogger.error('yes');

    expect(consoleDebugSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it('should not log when disabled', () => {
    const testLogger = createLogger('test', { enabled: false });
    testLogger.debug('no');
    testLogger.info('no');
    testLogger.warn('no');
    testLogger.error('no');

    expect(consoleDebugSpy).not.toHaveBeenCalled();
    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should enable/disable logging dynamically', () => {
    const testLogger = createLogger('test');
    testLogger.setEnabled(false);
    testLogger.info('should not log');

    testLogger.setEnabled(true);
    testLogger.info('should log');

    expect(consoleInfoSpy).toHaveBeenCalledTimes(1);
  });

  it('should change log level dynamically', () => {
    const testLogger = createLogger('test', { level: 'info' });
    testLogger.debug('no');

    testLogger.setLevel('debug');
    testLogger.debug('yes');

    expect(consoleDebugSpy).toHaveBeenCalledTimes(1);
  });

  it('should support console.group', () => {
    const testLogger = createLogger('test');
    testLogger.group('Test Group');

    expect(consoleGroupSpy).toHaveBeenCalledWith('[anti-ai-ui:test] Test Group');
  });

  it('should support console.groupEnd', () => {
    const testLogger = createLogger('test');
    testLogger.groupEnd();

    expect(consoleGroupEndSpy).toHaveBeenCalledTimes(1);
  });

  it('should support console.table', () => {
    const testLogger = createLogger('test');
    const data = [{ id: 1, name: 'test' }];
    testLogger.table(data);

    expect(consoleTableSpy).toHaveBeenCalledWith(data);
  });

  it('should not call group/groupEnd/table when disabled', () => {
    const testLogger = createLogger('test', { enabled: false });
    testLogger.group('Test');
    testLogger.groupEnd();
    testLogger.table([]);

    expect(consoleGroupSpy).not.toHaveBeenCalled();
    expect(consoleGroupEndSpy).not.toHaveBeenCalled();
    expect(consoleTableSpy).not.toHaveBeenCalled();
  });

  it('warnProductionUsage logs component initialization', () => {
    // Enable debug level on default logger since it defaults to 'info'
    logger.setLevel('debug');
    warnProductionUsage('TestComponent');

    // Should call debug on default logger
    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[anti-ai-ui] TestComponent initialized'
    );
  });

  it('logBotDetection logs bot detection events', () => {
    logBotDetection('click-pattern', 0.85, { clicks: 10 });

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '[anti-ai-ui] Bot detection: click-pattern (score: 0.85)',
      { clicks: 10 }
    );
  });

  it('logBotDetection formats score to 2 decimals', () => {
    logBotDetection('timing', 0.123456);

    expect(consoleInfoSpy).toHaveBeenCalledWith(
      '[anti-ai-ui] Bot detection: timing (score: 0.12)',
      undefined
    );
  });
});
