import React, { ReactNode, useEffect } from 'react';
import { StatusBar } from 'react-native';
import { logger } from '../utils/logger';
import { initAnalytics } from '../services/analytics';
import { initializeEncryptionKey } from '../services/encryption';
import { processCoolingOffQueue } from '../services/coolingOff';

const TAG = 'Providers';

interface ProvidersProps {
  children: ReactNode;
}

/**
 * App-level providers and initialization.
 * Wraps the app with necessary context and runs startup tasks.
 */
export function Providers({ children }: ProvidersProps) {
  useEffect(() => {
    initializeApp();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" />
      {children}
    </>
  );
}

async function initializeApp(): Promise<void> {
  logger.info(TAG, 'App initialization started');

  try {
    await initAnalytics();
    logger.info(TAG, 'Analytics initialized');

    await initializeEncryptionKey();
    logger.info(TAG, 'Encryption key verified');

    await processCoolingOffQueue();
    logger.info(TAG, 'Cooling off queue processed');

    logger.info(TAG, 'App initialization complete');
  } catch (error) {
    logger.error(TAG, 'App initialization failed', error);
  }
}
