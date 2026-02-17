/**
 * TypeScript interface for the FaceDetectionModule native bridge.
 * Native implementation: ios/ExEraser/FaceDetectionModule.swift
 * Uses Apple Vision: VNDetectFaceRectanglesRequest, VNGenerateFacePrintRequest
 */

import { NativeModules } from 'react-native';

export interface FaceMatch {
  assetId: string;
  confidence: number;
  thumbnailUri: string;
  date: string;
}

export interface FaceDetectionBridgeInterface {
  /**
   * Scan the photo library for faces matching the reference photos.
   * @param referencePhotoUris - URIs of 3-5 reference photos of the ex
   * @param threshold - Minimum confidence score (0.0-1.0), default 0.6
   * @param batchSize - Photos per batch, default 50
   * @returns Array of matched photos with confidence scores
   */
  scanLibrary(
    referencePhotoUris: string[],
    threshold: number,
    batchSize: number,
  ): Promise<FaceMatch[]>;

  /**
   * Cancel an in-progress scan.
   */
  cancelScan(): Promise<void>;

  /**
   * Get the total number of photos in the library (for progress calculation).
   */
  getPhotoCount(): Promise<number>;
}

const { FaceDetectionModule } = NativeModules;

export default FaceDetectionModule as FaceDetectionBridgeInterface;
