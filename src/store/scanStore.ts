import { create } from 'zustand';
import { logger } from '../utils/logger';

const TAG = 'ScanStore';

// --- Types (from TechSpec §4.1) ---

export type ScanPhase = 'faces' | 'dates' | 'calendar' | 'messages';

export type ScanState =
  | { status: 'idle' }
  | { status: 'scanning'; progress: number; phase: ScanPhase }
  | { status: 'review'; results: ScanResult[] }
  | { status: 'complete'; summary: CleanupSummary }
  | { status: 'error'; message: string };

export interface ScanResult {
  id: string;
  assetId: string;
  type: 'photo' | 'video' | 'calendar_event' | 'message';
  matchType: 'face' | 'date_range' | 'contact';
  confidence: number;
  thumbnailUri: string;
  date: string;
  userDecision?: 'vault' | 'delete' | 'keep';
}

export interface CleanupSummary {
  totalScanned: number;
  totalMatched: number;
  totalVaulted: number;
  totalDeleted: number;
  totalKept: number;
}

export interface ExProfile {
  name: string;
  phoneNumber: string;
  referencePhotoUris: string[];
  dateRanges?: { start: string; end: string }[];
}

// --- Store ---

interface ScanStoreState {
  scan: ScanState;
  exProfile: ExProfile | null;
  setExProfile: (profile: ExProfile) => void;
  startScan: () => void;
  updateProgress: (progress: number, phase: ScanPhase) => void;
  setResults: (results: ScanResult[]) => void;
  setDecision: (resultId: string, decision: 'vault' | 'delete' | 'keep') => void;
  completeScan: (summary: CleanupSummary) => void;
  setScanError: (message: string) => void;
  resetScan: () => void;
}

export const useScanStore = create<ScanStoreState>((set, get) => ({
  scan: { status: 'idle' },
  exProfile: null,

  setExProfile: (profile) => {
    logger.info(TAG, 'Ex profile set', { name: profile.name });
    set({ exProfile: profile });
  },

  startScan: () => {
    logger.info(TAG, 'Scan started');
    set({ scan: { status: 'scanning', progress: 0, phase: 'faces' } });
  },

  updateProgress: (progress, phase) => {
    logger.debug(TAG, `Scan progress: ${Math.round(progress * 100)}% (${phase})`);
    set({ scan: { status: 'scanning', progress, phase } });
  },

  setResults: (results) => {
    logger.info(TAG, `Scan found ${results.length} matches`);
    set({ scan: { status: 'review', results } });
  },

  setDecision: (resultId, decision) => {
    const { scan } = get();
    if (scan.status !== 'review') return;
    const updated = scan.results.map((r) =>
      r.id === resultId ? { ...r, userDecision: decision } : r,
    );
    logger.debug(TAG, `Decision set: ${resultId} → ${decision}`);
    set({ scan: { status: 'review', results: updated } });
  },

  completeScan: (summary) => {
    logger.info(TAG, 'Scan complete', summary);
    set({ scan: { status: 'complete', summary } });
  },

  setScanError: (message) => {
    logger.error(TAG, `Scan error: ${message}`);
    set({ scan: { status: 'error', message } });
  },

  resetScan: () => {
    logger.info(TAG, 'Scan reset');
    set({ scan: { status: 'idle' }, exProfile: null });
  },
}));
