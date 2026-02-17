/**
 * Centralized logger for Ex-Eraser.
 * Every execution flow must include detailed logging (Claude.md rule #5).
 *
 * SECURITY: In production builds, only 'error' level logs are emitted.
 * All info/warn/debug logs are gated behind __DEV__ to prevent PII leakage
 * to device system logs (Finding 3 — Security Audit 2026-02-18).
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
      if (__DEV__) console.info(timestamp, formatted, data ?? '');
      break;
    case 'warn':
      if (__DEV__) console.warn(timestamp, formatted, data ?? '');
      break;
    case 'error':
      // Errors always log, but strip data payload in production
      if (__DEV__) {
        console.error(timestamp, formatted, data ?? '');
      } else {
        console.error(timestamp, formatted);
      }
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
