import { logger } from './logger';
import PhotoKitBridge from '../native/PhotoKitBridge';
import EventKitBridge from '../native/EventKitBridge';

const TAG = 'Permissions';

export type PermissionStatus = 'granted' | 'denied' | 'limited' | 'undetermined';

export type PermissionType = 'photos' | 'calendar' | 'contacts' | 'notifications' | 'faceId';

/** Map native status strings to our PermissionStatus type. */
function mapNativeStatus(nativeStatus: string): PermissionStatus {
  switch (nativeStatus) {
    case 'authorized':
      return 'granted';
    case 'limited':
      return 'limited';
    case 'denied':
    case 'restricted':
      return 'denied';
    case 'notDetermined':
    default:
      return 'undetermined';
  }
}

/**
 * Request a specific permission with logging.
 * Wired to native PhotoKit/EventKit bridges for photos and calendar.
 */
export async function requestPermission(
  type: PermissionType,
): Promise<PermissionStatus> {
  logger.info(TAG, `Requesting permission: ${type}`);

  try {
    switch (type) {
      case 'photos': {
        const nativeStatus = await PhotoKitBridge.requestAuthorization();
        const status = mapNativeStatus(nativeStatus);
        logger.info(TAG, `Photos permission result: ${status}`);
        return status;
      }
      case 'calendar': {
        const granted = await EventKitBridge.requestAccess();
        const status: PermissionStatus = granted ? 'granted' : 'denied';
        logger.info(TAG, `Calendar permission result: ${status}`);
        return status;
      }
      case 'contacts':
      case 'notifications':
      case 'faceId':
        // TODO: Phase 3+ — CNContactStore, UNUserNotificationCenter, LAContext
        logger.warn(TAG, `Permission ${type}: not yet implemented, returning 'undetermined'`);
        return 'undetermined';
      default:
        logger.warn(TAG, `Unknown permission type: ${type}`);
        return 'undetermined';
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(TAG, `Permission request failed for ${type}: ${message}`);
    return 'undetermined';
  }
}

/** Check current status of a permission without prompting. */
export async function checkPermission(
  type: PermissionType,
): Promise<PermissionStatus> {
  logger.info(TAG, `Checking permission: ${type}`);

  try {
    switch (type) {
      case 'photos': {
        const nativeStatus = await PhotoKitBridge.getAuthorizationStatus();
        return mapNativeStatus(nativeStatus);
      }
      case 'calendar': {
        const nativeStatus = await EventKitBridge.getAuthorizationStatus();
        return mapNativeStatus(nativeStatus);
      }
      case 'contacts':
      case 'notifications':
      case 'faceId':
        // TODO: Phase 3+ — implement native status checks
        return 'undetermined';
      default:
        return 'undetermined';
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error(TAG, `Permission check failed for ${type}: ${message}`);
    return 'undetermined';
  }
}

/** Returns true if we have full photo library access (not limited). */
export async function hasFullPhotoAccess(): Promise<boolean> {
  const status = await checkPermission('photos');
  return status === 'granted';
}
