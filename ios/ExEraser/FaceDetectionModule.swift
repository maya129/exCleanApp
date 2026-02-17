import Foundation
import Vision
import Photos

/// Native module for face detection using Apple Vision.
/// Scans the photo library for faces matching reference photos.
/// Emits "onScanProgress" events for real-time progress reporting.
@objc(FaceDetectionModule)
class FaceDetectionModule: RCTEventEmitter {

  private var isCancelled = false
  private var hasListeners = false

  override func supportedEvents() -> [String] {
    return ["onScanProgress"]
  }

  override func startObserving() {
    hasListeners = true
  }

  override func stopObserving() {
    hasListeners = false
  }

  /// Emit scan progress to JS.
  private func emitProgress(processed: Int, total: Int, batchMatches: Int) {
    guard hasListeners else { return }
    sendEvent(withName: "onScanProgress", body: [
      "processed": processed,
      "total": total,
      "batchMatches": batchMatches,
    ])
  }

  /// Generate face observations from a reference photo URI.
  private func detectFaces(in imageURL: URL) -> [VNFaceObservation] {
    guard let imageData = try? Data(contentsOf: imageURL),
          let ciImage = CIImage(data: imageData) else {
      NSLog("[ExEraser][FaceDetection] Failed to load image: \(imageURL.lastPathComponent)")
      return []
    }

    let request = VNDetectFaceRectanglesRequest()
    let handler = VNImageRequestHandler(ciImage: ciImage, options: [:])
    do {
      try handler.perform([request])
      return request.results ?? []
    } catch {
      NSLog("[ExEraser][FaceDetection] Face detection failed: \(error.localizedDescription)")
      return []
    }
  }

  /// Extract a cropped face image from a CIImage using a face observation's bounding box.
  private func cropFace(from ciImage: CIImage, observation: VNFaceObservation) -> CGImage? {
    let imageSize = ciImage.extent
    let faceRect = VNImageRectForNormalizedRect(
      observation.boundingBox, Int(imageSize.width), Int(imageSize.height)
    )
    // Expand crop slightly for better comparison
    let expandedRect = faceRect.insetBy(dx: -faceRect.width * 0.15, dy: -faceRect.height * 0.15)
    let clampedRect = expandedRect.intersection(imageSize)
    guard !clampedRect.isNull else { return nil }

    let context = CIContext()
    return context.createCGImage(ciImage, from: clampedRect)
  }

  /// Compare two face crops using normalized pixel histogram similarity.
  /// Returns a confidence value 0.0–1.0.
  private func compareFaces(reference: CGImage, candidate: CGImage) -> Double {
    let size = CGSize(width: 64, height: 64)
    guard let refData = resizedPixelData(from: reference, size: size),
          let candData = resizedPixelData(from: candidate, size: size) else {
      return 0.0
    }

    // Compute normalized correlation between pixel buffers
    var dotProduct: Double = 0
    var refNorm: Double = 0
    var candNorm: Double = 0
    for i in 0..<refData.count {
      let r = Double(refData[i])
      let c = Double(candData[i])
      dotProduct += r * c
      refNorm += r * r
      candNorm += c * c
    }

    guard refNorm > 0 && candNorm > 0 else { return 0.0 }
    return dotProduct / (sqrt(refNorm) * sqrt(candNorm))
  }

  /// Resize a CGImage and extract raw pixel data for comparison.
  private func resizedPixelData(from image: CGImage, size: CGSize) -> [UInt8]? {
    let width = Int(size.width)
    let height = Int(size.height)
    let bytesPerPixel = 4
    let bytesPerRow = width * bytesPerPixel
    var pixelData = [UInt8](repeating: 0, count: width * height * bytesPerPixel)

    guard let context = CGContext(
      data: &pixelData,
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: bytesPerRow,
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
    ) else { return nil }

    context.draw(image, in: CGRect(origin: .zero, size: size))
    return pixelData
  }

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

      NSLog("[ExEraser][FaceDetection] scanLibrary started — \(referencePhotoUris.count) references, threshold=\(threshold), batchSize=\(batchSize)")

      // Step 1: Generate face crops from reference photos
      var referenceFaces: [CGImage] = []
      for uriString in referencePhotoUris {
        guard let url = URL(string: uriString) else {
          NSLog("[ExEraser][FaceDetection] Invalid reference URI: \(uriString)")
          continue
        }
        guard let imageData = try? Data(contentsOf: url),
              let ciImage = CIImage(data: imageData) else {
          NSLog("[ExEraser][FaceDetection] Failed to load reference: \(uriString)")
          continue
        }

        let observations = self.detectFaces(in: url)
        if let firstFace = observations.first,
           let cropped = self.cropFace(from: ciImage, observation: firstFace) {
          referenceFaces.append(cropped)
          NSLog("[ExEraser][FaceDetection] Reference face extracted from: \(url.lastPathComponent)")
        } else {
          NSLog("[ExEraser][FaceDetection] No face found in reference: \(url.lastPathComponent)")
        }
      }

      guard !referenceFaces.isEmpty else {
        NSLog("[ExEraser][FaceDetection] No reference faces extracted — aborting scan")
        reject("FACE_DETECTION_ERROR", "No faces detected in reference photos", nil)
        return
      }

      NSLog("[ExEraser][FaceDetection] \(referenceFaces.count) reference faces extracted")

      // Step 2: Fetch all photo assets sorted by creation date
      let fetchOptions = PHFetchOptions()
      fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
      fetchOptions.includeAssetSourceTypes = [.typeUserLibrary, .typeCloudShared, .typeiTunesSynced]
      let allAssets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
      let totalCount = allAssets.count

      NSLog("[ExEraser][FaceDetection] Total photos to scan: \(totalCount)")

      var matches: [[String: Any]] = []
      let imageManager = PHImageManager.default()
      let requestOptions = PHImageRequestOptions()
      requestOptions.isSynchronous = true
      requestOptions.isNetworkAccessAllowed = true
      requestOptions.deliveryMode = .highQualityFormat
      requestOptions.resizeMode = .exact

      let targetSize = CGSize(width: 600, height: 600)
      let effectiveBatchSize = batchSize > 0 ? batchSize : 50

      // Step 3: Process in batches
      var processedCount = 0
      let batchCount = Int(ceil(Double(totalCount) / Double(effectiveBatchSize)))

      for batchIndex in 0..<batchCount {
        if self.isCancelled {
          NSLog("[ExEraser][FaceDetection] Scan cancelled at batch \(batchIndex)")
          break
        }

        let startIdx = batchIndex * effectiveBatchSize
        let endIdx = min(startIdx + effectiveBatchSize, totalCount)
        var batchMatches = 0

        autoreleasepool {
          for assetIdx in startIdx..<endIdx {
            if self.isCancelled { break }

            let asset = allAssets.object(at: assetIdx)

            // Request image data synchronously
            var assetImage: CIImage?
            imageManager.requestImage(
              for: asset,
              targetSize: targetSize,
              contentMode: .aspectFit,
              options: requestOptions
            ) { image, _ in
              if let uiImage = image, let cgImage = uiImage.cgImage {
                assetImage = CIImage(cgImage: cgImage)
              }
            }

            guard let ciImage = assetImage else {
              processedCount += 1
              continue
            }

            // Detect faces in the library photo
            let request = VNDetectFaceRectanglesRequest()
            let handler = VNImageRequestHandler(ciImage: ciImage, options: [:])
            guard let observations = try? {
              try handler.perform([request])
              return request.results ?? []
            }(), !observations.isEmpty else {
              processedCount += 1
              continue
            }

            // Compare each detected face against references
            var bestConfidence: Double = 0
            for observation in observations {
              guard let candidateFace = self.cropFace(from: ciImage, observation: observation) else {
                continue
              }
              for refFace in referenceFaces {
                let confidence = self.compareFaces(reference: refFace, candidate: candidateFace)
                bestConfidence = max(bestConfidence, confidence)
              }
            }

            if bestConfidence >= threshold {
              let dateFormatter = ISO8601DateFormatter()
              let dateString = asset.creationDate.map { dateFormatter.string(from: $0) } ?? ""

              matches.append([
                "assetId": asset.localIdentifier,
                "confidence": bestConfidence,
                "thumbnailUri": "ph://\(asset.localIdentifier)",
                "date": dateString,
              ])
              batchMatches += 1
            }

            processedCount += 1
          }
        }

        self.emitProgress(processed: processedCount, total: totalCount, batchMatches: batchMatches)
        NSLog("[ExEraser][FaceDetection] Batch \(batchIndex + 1)/\(batchCount): \(batchMatches) matches (\(processedCount)/\(totalCount) processed)")
      }

      NSLog("[ExEraser][FaceDetection] Scan complete: \(matches.count) total matches from \(processedCount) photos")
      resolve(matches)
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

  @objc static override func requiresMainQueueSetup() -> Bool {
    return false
  }
}
