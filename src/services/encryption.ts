/**
 * Encryption Service — AES-256 file encryption for the Vault.
 * Encryption key stored in iOS Keychain (hardware-backed).
 * See TechSpec §6 for security architecture.
 */

import { logger } from '../utils/logger';

const TAG = 'Encryption';

/**
 * Encrypt a file from sourcePath and write to destinationPath.
 * Uses AES-256-GCM with a key stored in iOS Keychain.
 */
export async function encryptFile(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  logger.info(TAG, `Encrypting: ${sourcePath} → ${destinationPath}`);
  // TODO: Phase 4 — implement via native module using CommonCrypto / CryptoKit
  logger.warn(TAG, 'encryptFile: stub — native crypto not yet wired');
}

/**
 * Decrypt a file from sourcePath and write to destinationPath.
 */
export async function decryptFile(
  sourcePath: string,
  destinationPath: string,
): Promise<void> {
  logger.info(TAG, `Decrypting: ${sourcePath} → ${destinationPath}`);
  // TODO: Phase 4 — implement via native module
  logger.warn(TAG, 'decryptFile: stub — native crypto not yet wired');
}

/**
 * Initialize encryption key in iOS Keychain if not already present.
 * Called once during first app launch.
 */
export async function initializeEncryptionKey(): Promise<void> {
  logger.info(TAG, 'Initializing encryption key');
  // TODO: Phase 4 — generate AES-256 key, store in Keychain
  // kSecAttrAccessibleWhenUnlockedThisDeviceOnly
  logger.warn(TAG, 'initializeEncryptionKey: stub');
}

/**
 * Verify the encryption key exists and is accessible.
 * Returns false if the key was lost (e.g., device restore without Keychain).
 */
export async function verifyEncryptionKey(): Promise<boolean> {
  logger.info(TAG, 'Verifying encryption key');
  // TODO: Phase 4
  return false;
}
