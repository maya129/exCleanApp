import Foundation
import Photos
import UniformTypeIdentifiers

/// Native module for photo library access via PhotoKit.
/// Handles fetching, exporting, deleting, and restoring photos/videos.
@objc(PhotoKitModule)
class PhotoKitModule: NSObject {

  private let dateFormatter: ISO8601DateFormatter = {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withInternetDateTime]
    return formatter
  }()

  /// Fetch all photo assets within a date range.
  @objc func fetchAssetsByDateRange(
    _ startDate: String,
    endDate: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    DispatchQueue.global(qos: .userInitiated).async { [weak self] in
      guard let self = self else { return }

      guard let start = self.dateFormatter.date(from: startDate),
            let end = self.dateFormatter.date(from: endDate) else {
        NSLog("[ExEraser][PhotoKit] fetchAssetsByDateRange: invalid date format — start=\(startDate), end=\(endDate)")
        reject("PHOTOKIT_ERROR", "Invalid date format. Use ISO 8601.", nil)
        return
      }

      NSLog("[ExEraser][PhotoKit] fetchAssetsByDateRange: \(startDate) to \(endDate)")

      let fetchOptions = PHFetchOptions()
      fetchOptions.predicate = NSPredicate(
        format: "creationDate >= %@ AND creationDate <= %@",
        start as NSDate,
        end as NSDate
      )
      fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
      fetchOptions.includeAssetSourceTypes = [.typeUserLibrary, .typeCloudShared, .typeiTunesSynced]

      let assets = PHAsset.fetchAssets(with: fetchOptions)
      var results: [[String: Any]] = []

      assets.enumerateObjects { asset, _, _ in
        let mediaType: String
        switch asset.mediaType {
        case .image: mediaType = "photo"
        case .video: mediaType = "video"
        default: return // skip audio and unknown types
        }

        let dateString = asset.creationDate.map { self.dateFormatter.string(from: $0) } ?? ""

        results.append([
          "id": asset.localIdentifier,
          "uri": "ph://\(asset.localIdentifier)",
          "thumbnailUri": "ph://\(asset.localIdentifier)",
          "mediaType": mediaType,
          "creationDate": dateString,
          "isFavorite": asset.isFavorite,
          "isCloudAsset": asset.sourceType.contains(.typeCloudShared),
        ])
      }

      NSLog("[ExEraser][PhotoKit] fetchAssetsByDateRange: found \(results.count) assets")
      resolve(results)
    }
  }

  /// Export a photo/video from the library to the app sandbox.
  @objc func exportAsset(
    _ assetId: String,
    destinationDir: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    NSLog("[ExEraser][PhotoKit] exportAsset: \(assetId) → \(destinationDir)")

    let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
    guard let asset = fetchResult.firstObject else {
      NSLog("[ExEraser][PhotoKit] exportAsset: asset not found — \(assetId)")
      reject("PHOTOKIT_ERROR", "Asset not found: \(assetId)", nil)
      return
    }

    // Ensure destination directory exists
    let fileManager = FileManager.default
    if !fileManager.fileExists(atPath: destinationDir) {
      do {
        try fileManager.createDirectory(atPath: destinationDir, withIntermediateDirectories: true)
      } catch {
        reject("PHOTOKIT_ERROR", "Failed to create destination directory: \(error.localizedDescription)", error)
        return
      }
    }

    if asset.mediaType == .video {
      // Export video
      let videoOptions = PHVideoRequestOptions()
      videoOptions.isNetworkAccessAllowed = true
      videoOptions.deliveryMode = .highQualityFormat

      PHImageManager.default().requestAVAsset(forVideo: asset, options: videoOptions) { avAsset, _, info in
        guard let urlAsset = avAsset as? AVURLAsset else {
          reject("PHOTOKIT_ERROR", "Failed to get video URL for asset: \(assetId)", nil)
          return
        }

        let safeId = assetId.replacingOccurrences(of: "/", with: "_")
        let ext = urlAsset.url.pathExtension.isEmpty ? "mov" : urlAsset.url.pathExtension
        let destPath = (destinationDir as NSString).appendingPathComponent("\(safeId).\(ext)")

        do {
          try FileManager.default.copyItem(atPath: urlAsset.url.path, toPath: destPath)
          NSLog("[ExEraser][PhotoKit] exportAsset: video exported to \(destPath)")
          resolve(destPath)
        } catch {
          reject("PHOTOKIT_ERROR", "Failed to copy video: \(error.localizedDescription)", error)
        }
      }
    } else {
      // Export image
      let imageOptions = PHImageRequestOptions()
      imageOptions.isNetworkAccessAllowed = true
      imageOptions.isSynchronous = false
      imageOptions.deliveryMode = .highQualityFormat

      PHImageManager.default().requestImageDataAndOrientation(for: asset, options: imageOptions) { data, uti, _, info in
        guard let imageData = data else {
          reject("PHOTOKIT_ERROR", "Failed to get image data for asset: \(assetId)", nil)
          return
        }

        let safeId = assetId.replacingOccurrences(of: "/", with: "_")
        var ext = "jpg"
        if let uti = uti, let utType = UTType(uti) {
          ext = utType.preferredFilenameExtension ?? "jpg"
        }
        let destPath = (destinationDir as NSString).appendingPathComponent("\(safeId).\(ext)")

        do {
          try imageData.write(to: URL(fileURLWithPath: destPath))
          NSLog("[ExEraser][PhotoKit] exportAsset: image exported to \(destPath)")
          resolve(destPath)
        } catch {
          reject("PHOTOKIT_ERROR", "Failed to write image: \(error.localizedDescription)", error)
        }
      }
    }
  }

  /// Delete a photo/video from the library (triggers system confirmation dialog).
  @objc func deleteAsset(
    _ assetId: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    NSLog("[ExEraser][PhotoKit] deleteAsset: \(assetId)")

    let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil)
    guard fetchResult.firstObject != nil else {
      NSLog("[ExEraser][PhotoKit] deleteAsset: asset not found — \(assetId)")
      reject("PHOTOKIT_ERROR", "Asset not found: \(assetId)", nil)
      return
    }

    PHPhotoLibrary.shared().performChanges({
      PHAssetChangeRequest.deleteAssets(fetchResult)
    }) { success, error in
      if success {
        NSLog("[ExEraser][PhotoKit] deleteAsset: successfully deleted \(assetId)")
        resolve(nil)
      } else {
        let message = error?.localizedDescription ?? "Unknown error"
        NSLog("[ExEraser][PhotoKit] deleteAsset: failed — \(message)")
        reject("PHOTOKIT_ERROR", "Failed to delete asset: \(message)", error)
      }
    }
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
