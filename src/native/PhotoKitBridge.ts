/**
 * TypeScript interface for the PhotoKitModule native bridge.
 * Native implementation: ios/ExEraser/PhotoKitModule.swift
 * Uses PHPhotoLibrary, PHAsset, PHAssetChangeRequest
 */

import { NativeModules } from 'react-native';

export interface PhotoAsset {
  id: string;
  uri: string;
  thumbnailUri: string;
  mediaType: 'photo' | 'video';
  creationDate: string;
  isFavorite: boolean;
  isCloudAsset: boolean;
}

export interface PhotoKitBridgeInterface {
  /**
   * Fetch all photo assets within a date range.
   */
  fetchAssetsByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<PhotoAsset[]>;

  /**
   * Export a photo/video from the library to the app sandbox.
   * @returns Path to the exported file in the sandbox
   */
  exportAsset(assetId: string, destinationDir: string): Promise<string>;

  /**
   * Delete a photo/video from the library (moves to Recently Deleted).
   */
  deleteAsset(assetId: string): Promise<void>;

  /**
   * Restore a previously exported asset back to the photo library.
   * @returns New PHAsset ID
   */
  restoreAsset(filePath: string): Promise<string>;

  /**
   * Get the total number of assets in the library.
   */
  getTotalAssetCount(): Promise<number>;

  /**
   * Check current photo library authorization status.
   * Returns: 'authorized' | 'limited' | 'denied' | 'notDetermined'
   */
  getAuthorizationStatus(): Promise<string>;

  /**
   * Request full photo library access.
   */
  requestAuthorization(): Promise<string>;
}

const { PhotoKitModule } = NativeModules;

export default PhotoKitModule as PhotoKitBridgeInterface;
