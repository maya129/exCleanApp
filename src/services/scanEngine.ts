/**
 * Scan Engine — orchestrates the "Search & Rescue" mission.
 * Coordinates face scanning, date-range filtering, and contact matching.
 * See TechSpec §4.1 for architecture.
 */

import { logger } from '../utils/logger';
import { SCAN_BATCH_SIZE, FACE_MATCH_THRESHOLD } from '../utils/constants';
import type { ExProfile, ScanResult, ScanPhase, CleanupSummary } from '../store/scanStore';

const TAG = 'ScanEngine';

export interface ScanCallbacks {
  onProgress: (progress: number, phase: ScanPhase) => void;
  onResults: (results: ScanResult[]) => void;
  onComplete: (summary: CleanupSummary) => void;
  onError: (message: string) => void;
}

/**
 * Run the full scan pipeline against the user's device.
 * Phase 1: Face detection (Apple Vision via native bridge)
 * Phase 2: Date-range scan (if user specified date ranges)
 * Phase 3: Calendar event matching
 */
export async function runScan(
  profile: ExProfile,
  callbacks: ScanCallbacks,
): Promise<void> {
  logger.info(TAG, 'Starting scan pipeline', {
    name: profile.name,
    referencePhotos: profile.referencePhotoUris.length,
    dateRanges: profile.dateRanges?.length ?? 0,
  });

  const allResults: ScanResult[] = [];

  try {
    // Phase 1: Face scan
    callbacks.onProgress(0, 'faces');
    const faceResults = await scanFaces(profile, (p) =>
      callbacks.onProgress(p * 0.6, 'faces'),
    );
    allResults.push(...faceResults);
    logger.info(TAG, `Face scan complete: ${faceResults.length} matches`);

    // Phase 2: Date-range scan
    if (profile.dateRanges && profile.dateRanges.length > 0) {
      callbacks.onProgress(0.6, 'dates');
      const dateResults = await scanDateRanges(profile.dateRanges, (p) =>
        callbacks.onProgress(0.6 + p * 0.15, 'dates'),
      );
      allResults.push(...deduplicateResults(dateResults, allResults));
      logger.info(TAG, `Date range scan complete: ${dateResults.length} matches`);
    }

    // Phase 3: Calendar scan
    callbacks.onProgress(0.75, 'calendar');
    const calendarResults = await scanCalendar(profile, (p) =>
      callbacks.onProgress(0.75 + p * 0.25, 'calendar'),
    );
    allResults.push(...calendarResults);
    logger.info(TAG, `Calendar scan complete: ${calendarResults.length} matches`);

    callbacks.onProgress(1, 'calendar');
    callbacks.onResults(allResults);
    logger.info(TAG, `Scan pipeline complete: ${allResults.length} total matches`);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown scan error';
    logger.error(TAG, `Scan pipeline failed: ${message}`);
    callbacks.onError(message);
  }
}

/** Deduplicate results by assetId, keeping the higher-confidence match. */
function deduplicateResults(
  newResults: ScanResult[],
  existing: ScanResult[],
): ScanResult[] {
  const existingIds = new Set(existing.map((r) => r.assetId));
  return newResults.filter((r) => !existingIds.has(r.assetId));
}

/**
 * Build cleanup summary from user decisions.
 */
export function buildSummary(results: ScanResult[]): CleanupSummary {
  return {
    totalScanned: results.length,
    totalMatched: results.length,
    totalVaulted: results.filter((r) => r.userDecision === 'vault').length,
    totalDeleted: results.filter((r) => r.userDecision === 'delete').length,
    totalKept: results.filter((r) => r.userDecision === 'keep').length,
  };
}

// --- Phase implementations (stubs — wired to native bridges in Phase 2) ---

async function scanFaces(
  _profile: ExProfile,
  _onProgress: (p: number) => void,
): Promise<ScanResult[]> {
  // TODO: Phase 2 — call FaceDetectionBridge.scanLibrary(referencePhotoUris, threshold, batchSize)
  logger.warn(TAG, 'scanFaces: stub — native bridge not yet wired');
  return [];
}

async function scanDateRanges(
  _ranges: { start: string; end: string }[],
  _onProgress: (p: number) => void,
): Promise<ScanResult[]> {
  // TODO: Phase 2 — call PhotoKitBridge.fetchAssetsByDateRange(ranges)
  logger.warn(TAG, 'scanDateRanges: stub — native bridge not yet wired');
  return [];
}

async function scanCalendar(
  _profile: ExProfile,
  _onProgress: (p: number) => void,
): Promise<ScanResult[]> {
  // TODO: Phase 2 — call EventKitBridge.searchEvents(name, phoneNumber)
  logger.warn(TAG, 'scanCalendar: stub — native bridge not yet wired');
  return [];
}
