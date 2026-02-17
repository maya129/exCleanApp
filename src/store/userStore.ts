import { create } from 'zustand';
import { logger } from '../utils/logger';

const TAG = 'UserStore';

export type SubscriptionTier = 'free' | 'healing_pass';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface UserStoreState {
  user: User | null;
  isAuthenticated: boolean;
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  user: null,
  isAuthenticated: false,
  subscriptionTier: 'free',
  isLoading: true,

  setUser: (user) => {
    logger.info(TAG, user ? `User signed in: ${user.uid}` : 'User signed out');
    set({ user, isAuthenticated: !!user, isLoading: false });
  },

  setSubscriptionTier: (tier) => {
    logger.info(TAG, `Subscription updated: ${tier}`);
    set({ subscriptionTier: tier });
  },

  setLoading: (loading) => set({ isLoading: loading }),

  logout: () => {
    logger.info(TAG, 'User logged out');
    set({ user: null, isAuthenticated: false, subscriptionTier: 'free' });
  },
}));
