/**
 * Vault Manager — handles CRUD for the encrypted Vault.
 * Files are encrypted at rest with AES-256, key stored in iOS Keychain.
 * See TechSpec §4.2 for architecture.
 */

import { logger } from '../utils/logger';
import type { VaultItem, CoolingOffItem } from '../store/vaultStore';
import type { ScanResult } from '../store/scanStore';
import { getCoolingOffExpiry } from '../utils/dates';

const TAG = 'VaultManager';

/**
 * Move a scan result into the Vault.
 * 1. Copy the file to app sandbox
 * 2. Encrypt the file
 * 3. Generate encrypted thumbnail
 * 4. Insert record into vault.db
 * 5. Remove original from photo library (if user consented)
 */
export async function moveToVault(result: ScanResult): Promise<VaultItem> {
  logger.info(TAG, `Moving to vault: ${result.id} (${result.type})`);

  // TODO: Phase 4 — implement actual file copy + encryption
  const vaultItem: VaultItem = {
    id: generateId(),
    originalId: result.assetId,
    type: result.type === 'calendar_event' ? 'calendar' : result.type,
    filePath: null, // set after encryption
    thumbnailPath: null, // set after thumbnail generation
    metadata: { date: result.date, confidence: result.confidence },
    matchType: result.matchType,
    createdAt: new Date().toISOString(),
    source: 'camera_roll', // TODO: determine from asset metadata
  };

  logger.info(TAG, `Vault item created: ${vaultItem.id}`);
  return vaultItem;
}

/**
 * Mark an item for permanent deletion with cooling-off period.
 */
export async function markForDeletion(vaultItem: VaultItem): Promise<CoolingOffItem> {
  logger.info(TAG, `Marking for deletion: ${vaultItem.id}`);

  const coolingOff: CoolingOffItem = {
    id: generateId(),
    vaultItemId: vaultItem.id,
    deleteAfter: getCoolingOffExpiry(),
    reminded: false,
    status: 'pending',
  };

  logger.info(TAG, `Cooling off created: expires ${coolingOff.deleteAfter}`);
  return coolingOff;
}

/**
 * Restore an item from the Vault back to the user's photo library / calendar.
 */
export async function restoreFromVault(vaultItem: VaultItem): Promise<void> {
  logger.info(TAG, `Restoring from vault: ${vaultItem.id} (${vaultItem.type})`);

  // TODO: Phase 4 — decrypt file, move back to photo library via PhotoKitBridge
  logger.warn(TAG, 'restoreFromVault: stub — native bridge not yet wired');
}

/**
 * Permanently delete a vault item's files from disk.
 */
export async function permanentlyDelete(vaultItem: VaultItem): Promise<void> {
  logger.info(TAG, `Permanently deleting: ${vaultItem.id}`);

  // TODO: Phase 4 — delete encrypted file + thumbnail from sandbox, remove DB record
  logger.warn(TAG, 'permanentlyDelete: stub — file operations not yet implemented');
}

/**
 * Load all vault items from the local database.
 */
export async function loadVaultItems(): Promise<VaultItem[]> {
  logger.info(TAG, 'Loading vault items from DB');
  // TODO: Phase 4 — query vault.db
  return [];
}

/**
 * Load all active cooling-off items from the local database.
 */
export async function loadCoolingOffItems(): Promise<CoolingOffItem[]> {
  logger.info(TAG, 'Loading cooling off items from DB');
  // TODO: Phase 4 — query cooling_off table
  return [];
}

function generateId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${Date.now()}-${hex}`;
}
