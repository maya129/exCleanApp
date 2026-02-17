import Foundation
import Vision
import Photos

/// Native module for face detection using Apple Vision.
/// Scans the photo library for faces matching reference photos.
@objc(FaceDetectionModule)
class FaceDetectionModule: NSObject {

  private var isCancelled = false

  /// Scan the photo library for face matches against reference photos.
  @objc func scanLibrary(
    _ referencePhotoUris: [String],
    threshold: Double,
    batchSize: Int,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    isCancelled = false

    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      guard let self = self else { return }

      // Step 1: Generate face prints from reference photos
      // TODO: Phase 2 — VNGenerateFacePrintRequest for each reference
      // Step 2: Iterate photo library in batches
      // TODO: Phase 2 — PHAsset fetch + VNDetectFaceRectanglesRequest
      // Step 3: Compare face prints, collect matches above threshold
      // TODO: Phase 2 — VNFacePrintDistance comparison

      NSLog("[ExEraser][FaceDetection] scanLibrary called — stub implementation")
      resolve([]) // Return empty array for now
    }
  }

  /// Cancel an in-progress scan.
  @objc func cancelScan(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    isCancelled = true
    NSLog("[ExEraser][FaceDetection] Scan cancelled")
    resolve(nil)
  }

  /// Get the total number of photos in the library.
  @objc func getPhotoCount(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    let fetchOptions = PHFetchOptions()
    fetchOptions.includeAssetSourceTypes = [.typeUserLibrary, .typeCloudShared, .typeiTunesSynced]
    let assets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
    NSLog("[ExEraser][FaceDetection] Photo count: \(assets.count)")
    resolve(assets.count)
  }

  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }
}
