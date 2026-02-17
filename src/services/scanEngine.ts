/**
 * Scan Engine — orchestrates the "Search & Rescue" mission.
 * Coordinates face scanning, date-range filtering, and contact matching.
 * See TechSpec §4.1 for architecture.
 */

import { logger } from '../utils/logger';
import { SCAN_BATCH_SIZE, FACE_MATCH_THRESHOLD } from '../utils/constants';
import type { ExProfile, ScanResult, ScanPhase, CleanupSummary } from '../store/scanStore';
import FaceDetectionBridge, {
  FaceDetectionEvents,
  type FaceMatch,
  type ScanProgressEvent,
} from '../native/FaceDetectionBridge';
import PhotoKitBridge, { type PhotoAsset } from '../native/PhotoKitBridge';
import EventKitBridge, { type CalendarEvent } from '../native/EventKitBridge';

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

// --- Phase implementations (wired to native bridges) ---

async function scanFaces(
  profile: ExProfile,
  onProgress: (p: number) => void,
): Promise<ScanResult[]> {
  logger.info(TAG, 'scanFaces: starting face scan via native bridge');

  // Subscribe to progress events from native
  const progressListener = FaceDetectionEvents.addListener(
    'onScanProgress',
    (event: ScanProgressEvent) => {
      if (event.total > 0) {
        onProgress(event.processed / event.total);
      }
      logger.debug(TAG, `scanFaces progress: ${event.processed}/${event.total} (batch matches: ${event.batchMatches})`);
    },
  );

  try {
    const matches: FaceMatch[] = await FaceDetectionBridge.scanLibrary(
      profile.referencePhotoUris,
      FACE_MATCH_THRESHOLD,
      SCAN_BATCH_SIZE,
    );

    logger.info(TAG, `scanFaces: native bridge returned ${matches.length} matches`);

    return matches.map((match, index) => ({
      id: `face_${match.assetId}_${index}`,
      assetId: match.assetId,
      type: 'photo' as const,
      matchType: 'face' as const,
      confidence: match.confidence,
      thumbnailUri: match.thumbnailUri,
      date: match.date,
    }));
  } finally {
    progressListener.remove();
  }
}

async function scanDateRanges(
  ranges: { start: string; end: string }[],
  onProgress: (p: number) => void,
): Promise<ScanResult[]> {
  logger.info(TAG, `scanDateRanges: scanning ${ranges.length} date ranges`);

  const allResults: ScanResult[] = [];

  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i];
    logger.info(TAG, `scanDateRanges: fetching range ${i + 1}/${ranges.length} — ${range.start} to ${range.end}`);

    const assets: PhotoAsset[] = await PhotoKitBridge.fetchAssetsByDateRange(
      range.start,
      range.end,
    );

    logger.info(TAG, `scanDateRanges: range ${i + 1} returned ${assets.length} assets`);

    const results: ScanResult[] = assets.map((asset, index) => ({
      id: `date_${asset.id}_${index}`,
      assetId: asset.id,
      type: (asset.mediaType === 'video' ? 'video' : 'photo') as 'photo' | 'video',
      matchType: 'date_range' as const,
      confidence: 1.0, // Date range matches are exact
      thumbnailUri: asset.thumbnailUri,
      date: asset.creationDate,
    }));

    allResults.push(...results);
    onProgress((i + 1) / ranges.length);
  }

  logger.info(TAG, `scanDateRanges: total ${allResults.length} assets across all ranges`);
  return allResults;
}

async function scanCalendar(
  profile: ExProfile,
  onProgress: (p: number) => void,
): Promise<ScanResult[]> {
  logger.info(TAG, 'scanCalendar: searching events for target profile');

  // 5-year lookback from today
  const now = new Date();
  const fiveYearsAgo = new Date(now);
  fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

  const fromDate = fiveYearsAgo.toISOString();
  const toDate = now.toISOString();

  onProgress(0.1);

  const events: CalendarEvent[] = await EventKitBridge.searchEvents(
    profile.name,
    profile.phoneNumber,
    fromDate,
    toDate,
  );

  onProgress(0.9);

  logger.info(TAG, `scanCalendar: found ${events.length} matching calendar events`);

  const results: ScanResult[] = events.map((event, index) => ({
    id: `cal_${event.eventId}_${index}`,
    assetId: event.eventId,
    type: 'calendar_event' as const,
    matchType: 'contact' as const,
    confidence: 1.0, // Calendar matches are exact text matches
    thumbnailUri: '', // Calendar events have no thumbnail
    date: event.startDate,
  }));

  onProgress(1);
  return results;
}
