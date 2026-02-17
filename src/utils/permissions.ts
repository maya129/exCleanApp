import { Platform } from 'react-native';
import { logger } from './logger';

const TAG = 'Permissions';

export type PermissionStatus = 'granted' | 'denied' | 'limited' | 'undetermined';

export type PermissionType = 'photos' | 'calendar' | 'contacts' | 'notifications' | 'faceId';

/**
 * Request a specific permission with logging.
 * Actual native calls will be wired in Phase 2 when native bridges are built.
 */
export async function requestPermission(
  type: PermissionType,
): Promise<PermissionStatus> {
  logger.info(TAG, `Requesting permission: ${type}`);

  // TODO: Phase 2 — wire to actual native permission APIs
  // Photos:        PHPhotoLibrary.requestAuthorization
  // Calendar:      EKEventStore.requestFullAccessToEvents
  // Contacts:      CNContactStore.requestAccess
  // Notifications: UNUserNotificationCenter.requestAuthorization
  // FaceID:        LAContext.canEvaluatePolicy

  logger.warn(TAG, `Permission ${type}: stub returning 'undetermined'`);
  return 'undetermined';
}

/** Check current status of a permission without prompting. */
export async function checkPermission(
  type: PermissionType,
): Promise<PermissionStatus> {
  logger.info(TAG, `Checking permission: ${type}`);

  // TODO: Phase 2 — wire to native status checks
  return 'undetermined';
}

/** Returns true if we have full photo library access (not limited). */
export async function hasFullPhotoAccess(): Promise<boolean> {
  const status = await checkPermission('photos');
  return status === 'granted';
}
