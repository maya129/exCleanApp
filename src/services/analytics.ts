/**
 * Analytics Service — anonymous event tracking via PostHog.
 * NO PII, NO content data — only feature usage events.
 * See TechSpec §5.1 for backend architecture.
 */

import { logger } from '../utils/logger';
import { AnalyticsEvents } from '../utils/constants';

const TAG = 'Analytics';

let isInitialized = false;

/**
 * Initialize PostHog with anonymous ID.
 * Called once at app startup.
 */
export async function initAnalytics(): Promise<void> {
  logger.info(TAG, 'Initializing analytics');
  // TODO: Phase 6 — PostHog.setup(apiKey, { host })
  isInitialized = true;
  logger.info(TAG, 'Analytics initialized (stub)');
}

/**
 * Track an anonymous event.
 */
export function trackEvent(
  event: string,
  properties?: Record<string, string | number | boolean>,
): void {
  if (!isInitialized) {
    logger.warn(TAG, `Dropping event (not initialized): ${event}`);
    return;
  }
  logger.debug(TAG, `Event: ${event}`, properties);
  // TODO: Phase 6 — PostHog.capture(event, properties)
}

/**
 * Track scan started event.
 */
export function trackScanStarted(photoCount: number): void {
  trackEvent(AnalyticsEvents.SCAN_STARTED, { photo_count: photoCount });
}

/**
 * Track scan completed event.
 */
export function trackScanCompleted(matchCount: number, vaultCount: number, deleteCount: number): void {
  trackEvent(AnalyticsEvents.SCAN_COMPLETED, {
    match_count: matchCount,
    vault_count: vaultCount,
    delete_count: deleteCount,
  });
}

/**
 * Track subscription event.
 */
export function trackSubscriptionStarted(tier: string): void {
  trackEvent(AnalyticsEvents.SUBSCRIPTION_STARTED, { tier });
}
