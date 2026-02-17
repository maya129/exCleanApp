/**
 * Cooling Off Service — manages the 7-day deletion queue.
 * Items marked for deletion enter a holding period before permanent removal.
 * See TechSpec §4.3 for flow.
 */

import { logger } from '../utils/logger';
import { isExpired, daysRemaining } from '../utils/dates';
import { COOLING_OFF_REMINDER_DAY, COOLING_OFF_DAYS } from '../utils/constants';
import { permanentlyDelete, loadCoolingOffItems, loadVaultItems } from './vaultManager';
import type { CoolingOffItem } from '../store/vaultStore';

const TAG = 'CoolingOff';

/**
 * Process all cooling-off items:
 * - Delete expired items
 * - Schedule Day 6 reminders for upcoming expirations
 *
 * Called on app foreground + via BGAppRefreshTask.
 */
export async function processCoolingOffQueue(): Promise<void> {
  logger.info(TAG, 'Processing cooling off queue');

  const coolingOffItems = await loadCoolingOffItems();
  const vaultItems = await loadVaultItems();
  const pending = coolingOffItems.filter((c) => c.status === 'pending');

  logger.info(TAG, `${pending.length} items in cooling off queue`);

  for (const item of pending) {
    if (isExpired(item.deleteAfter)) {
      await handleExpiredItem(item, vaultItems);
    } else if (shouldSendReminder(item)) {
      await scheduleReminder(item);
    }
  }

  logger.info(TAG, 'Cooling off queue processing complete');
}

async function handleExpiredItem(
  item: CoolingOffItem,
  vaultItems: { id: string }[],
): Promise<void> {
  logger.info(TAG, `Item expired: ${item.vaultItemId}`);

  const vaultItem = vaultItems.find((v) => v.id === item.vaultItemId);
  if (vaultItem) {
    await permanentlyDelete(vaultItem as any);
  }
  // TODO: update cooling_off record status to 'deleted' in DB
}

function shouldSendReminder(item: CoolingOffItem): boolean {
  if (item.reminded) return false;
  const remaining = daysRemaining(item.deleteAfter);
  return remaining <= (COOLING_OFF_DAYS - COOLING_OFF_REMINDER_DAY);
}

async function scheduleReminder(_item: CoolingOffItem): Promise<void> {
  logger.info(TAG, `Scheduling Day 6 reminder for: ${_item.vaultItemId}`);
  // TODO: Phase 5 — UNUserNotificationCenter local notification
  // "Tomorrow, these items will be gone forever. Want to take one last look?"
}
