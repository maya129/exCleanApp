import { create } from 'zustand';
import { logger } from '../utils/logger';

const TAG = 'VaultStore';

// --- Types (from TechSpec §4.2) ---

export interface VaultItem {
  id: string;
  originalId: string;
  type: 'photo' | 'video' | 'calendar' | 'message';
  filePath: string | null;
  thumbnailPath: string | null;
  metadata: Record<string, unknown>;
  matchType: 'face' | 'date_range' | 'contact';
  createdAt: string;
  source: 'camera_roll' | 'icloud' | 'calendar' | 'messages';
}

export interface CoolingOffItem {
  id: string;
  vaultItemId: string;
  deleteAfter: string;
  reminded: boolean;
  status: 'pending' | 'deleted' | 'restored';
}

// --- Store ---

interface VaultStoreState {
  items: VaultItem[];
  coolingOffItems: CoolingOffItem[];
  isUnlocked: boolean;
  unlock: () => void;
  lock: () => void;
  addItem: (item: VaultItem) => void;
  removeItem: (id: string) => void;
  restoreItem: (id: string) => void;
  addCoolingOffItem: (item: CoolingOffItem) => void;
  cancelDeletion: (coolingOffId: string) => void;
  setItems: (items: VaultItem[]) => void;
  setCoolingOffItems: (items: CoolingOffItem[]) => void;
}

export const useVaultStore = create<VaultStoreState>((set, get) => ({
  items: [],
  coolingOffItems: [],
  isUnlocked: false,

  unlock: () => {
    logger.info(TAG, 'Vault unlocked');
    set({ isUnlocked: true });
  },

  lock: () => {
    logger.info(TAG, 'Vault locked');
    set({ isUnlocked: false });
  },

  addItem: (item) => {
    logger.info(TAG, `Item added to vault: ${item.id} (${item.type})`);
    set((state) => ({ items: [...state.items, item] }));
  },

  removeItem: (id) => {
    logger.info(TAG, `Item removed from vault: ${id}`);
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  restoreItem: (id) => {
    logger.info(TAG, `Item restored from vault: ${id}`);
    // Actual restore logic (move file back to photo library) handled by vaultManager service
    set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
  },

  addCoolingOffItem: (item) => {
    logger.info(TAG, `Cooling off started: ${item.vaultItemId}, expires ${item.deleteAfter}`);
    set((state) => ({ coolingOffItems: [...state.coolingOffItems, item] }));
  },

  cancelDeletion: (coolingOffId) => {
    logger.info(TAG, `Cooling off cancelled: ${coolingOffId}`);
    set((state) => ({
      coolingOffItems: state.coolingOffItems.map((c) =>
        c.id === coolingOffId ? { ...c, status: 'restored' as const } : c,
      ),
    }));
  },

  setItems: (items) => set({ items }),
  setCoolingOffItems: (items) => set({ coolingOffItems: items }),
}));
