import React from 'react';
import { Providers } from './Providers';
import { Navigation } from './Navigation';
import { logger } from '../utils/logger';

const TAG = 'App';

export default function App() {
  logger.info(TAG, 'App mounted');

  return (
    <Providers>
      <Navigation />
    </Providers>
  );
}
