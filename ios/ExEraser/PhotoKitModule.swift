import Foundation
import Photos

/// Native module for photo library access via PhotoKit.
/// Handles fetching, exporting, deleting, and restoring photos/videos.
@objc(PhotoKitModule)
class PhotoKitModule: NSObject {

  /// Fetch all photo assets within a date range.
  @objc func fetchAssetsByDateRange(
    _ startDate: String,
    endDate: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // TODO: Phase 2 — PHFetchOptions with date predicate
    NSLog("[ExEraser][PhotoKit] fetchAssetsByDateRange called — stub")
    resolve([])
  }

  /// Export a photo/video from the library to the app sandbox.
  @objc func exportAsset(
    _ assetId: String,
    destinationDir: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // TODO: Phase 2 — PHImageManager requestImageDataAndOrientation
    NSLog("[ExEraser][PhotoKit] exportAsset called — stub")
    resolve("")
  }

  /// Delete a photo/video from the library.
  @objc func deleteAsset(
    _ assetId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // TODO: Phase 2 — PHAssetChangeRequest.deleteAssets
    NSLog("[ExEraser][PhotoKit] deleteAsset called — stub")
    resolve(nil)
  }

  /// Restore a previously exported asset back to the photo library.
  @objc func restoreAsset(
    _ filePath: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    // TODO: Phase 4 — PHAssetChangeRequest.creationRequestForAsset
    NSLog("[ExEraser][PhotoKit] restoreAsset called — stub")
    resolve("")
  }

  /// Get the total number of assets in the library.
  @objc func getTotalAssetCount(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let assets = PHAsset.fetchAssets(with: nil)
    NSLog("[ExEraser][PhotoKit] Total asset count: \(assets.count)")
    resolve(assets.count)
  }

  /// Check current photo library authorization status.
  @objc func getAuthorizationStatus(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
    let statusString: String
    switch status {
    case .authorized: statusString = "authorized"
    case .limited: statusString = "limited"
    case .denied: statusString = "denied"
    case .restricted: statusString = "denied"
    case .notDetermined: statusString = "notDetermined"
    @unknown default: statusString = "notDetermined"
    }
    NSLog("[ExEraser][PhotoKit] Authorization status: \(statusString)")
    resolve(statusString)
  }

  /// Request full photo library access.
  @objc func requestAuthorization(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
      let statusString: String
      switch status {
      case .authorized: statusString = "authorized"
      case .limited: statusString = "limited"
      case .denied: statusString = "denied"
      case .restricted: statusString = "denied"
      case .notDetermined: statusString = "notDetermined"
      @unknown default: statusString = "notDetermined"
      }
      NSLog("[ExEraser][PhotoKit] Authorization result: \(statusString)")
      resolve(statusString)
    }
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
