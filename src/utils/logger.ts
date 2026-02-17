/**
 * Centralized logger for Ex-Eraser.
 * Every execution flow must include detailed logging (Claude.md rule #5).
 * In production, swap console calls for a structured logging service.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_PREFIX = '[ExEraser]';

function log(level: LogLevel, tag: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const formatted = `${LOG_PREFIX}[${tag}] ${message}`;

  switch (level) {
    case 'debug':
      if (__DEV__) console.debug(timestamp, formatted, data ?? '');
      break;
    case 'info':
      console.info(timestamp, formatted, data ?? '');
      break;
    case 'warn':
      console.warn(timestamp, formatted, data ?? '');
      break;
    case 'error':
      console.error(timestamp, formatted, data ?? '');
      break;
  }
}

export const logger = {
  debug: (tag: string, message: string, data?: unknown) =>
    log('debug', tag, message, data),
  info: (tag: string, message: string, data?: unknown) =>
    log('info', tag, message, data),
  warn: (tag: string, message: string, data?: unknown) =>
    log('warn', tag, message, data),
  error: (tag: string, message: string, data?: unknown) =>
    log('error', tag, message, data),
};

declare const __DEV__: boolean;
