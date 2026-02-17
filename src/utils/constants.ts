/** Cooling off period before permanent deletion (days). */
export const COOLING_OFF_DAYS = 7;

/** Day to send "last chance" reminder before deletion. */
export const COOLING_OFF_REMINDER_DAY = 6;

/** Face match confidence threshold (0.0–1.0). Lower = more matches, more false positives. */
export const FACE_MATCH_THRESHOLD = 0.6;

/** Number of photos to process per batch during face scan. */
export const SCAN_BATCH_SIZE = 50;

/** Minimum reference photos required to start a scan. */
export const MIN_REFERENCE_PHOTOS = 3;

/** Maximum reference photos allowed. */
export const MAX_REFERENCE_PHOTOS = 5;

/** App display name. */
export const APP_NAME = 'Ex-Eraser';

/** RevenueCat entitlement identifier. */
export const ENTITLEMENT_HEALING_PASS = 'healing_pass';

/** PostHog event names. */
export const AnalyticsEvents = {
  SCAN_STARTED: 'scan_started',
  SCAN_COMPLETED: 'scan_completed',
  SCAN_CANCELLED: 'scan_cancelled',
  ITEM_VAULTED: 'item_vaulted',
  ITEM_DELETED: 'item_deleted',
  ITEM_RESTORED: 'item_restored',
  COOLING_OFF_REVERSAL: 'cooling_off_reversal',
  VAULT_OPENED: 'vault_opened',
  SUBSCRIPTION_STARTED: 'subscription_started',
  ONBOARDING_COMPLETED: 'onboarding_completed',
} as const;
