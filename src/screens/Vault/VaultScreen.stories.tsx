import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { VaultScreen } from './VaultScreen';
import { useVaultStore } from '../../store/vaultStore';
import type { VaultItem } from '../../store/vaultStore';

const MOCK_ITEMS: VaultItem[] = [
  {
    id: 'v1',
    originalId: 'ph-001',
    type: 'photo',
    filePath: null,
    thumbnailPath: null,
    metadata: { date: '2025-06-15', confidence: 0.87 },
    matchType: 'face',
    createdAt: '2026-02-18T10:00:00Z',
    source: 'camera_roll',
  },
  {
    id: 'v2',
    originalId: 'ph-002',
    type: 'photo',
    filePath: null,
    thumbnailPath: null,
    metadata: { date: '2025-07-20', confidence: 0.92 },
    matchType: 'face',
    createdAt: '2026-02-18T10:01:00Z',
    source: 'icloud',
  },
  {
    id: 'v3',
    originalId: 'vid-001',
    type: 'video',
    filePath: null,
    thumbnailPath: null,
    metadata: { date: '2025-08-01', confidence: 0.75 },
    matchType: 'date_range',
    createdAt: '2026-02-18T10:02:00Z',
    source: 'camera_roll',
  },
  {
    id: 'v4',
    originalId: 'ev-001',
    type: 'calendar',
    filePath: null,
    thumbnailPath: null,
    metadata: { date: '2025-09-10', confidence: 1.0 },
    matchType: 'contact',
    createdAt: '2026-02-18T10:03:00Z',
    source: 'calendar',
  },
  {
    id: 'v5',
    originalId: 'ph-003',
    type: 'photo',
    filePath: null,
    thumbnailPath: null,
    metadata: { date: '2025-05-22', confidence: 0.68 },
    matchType: 'face',
    createdAt: '2026-02-18T10:04:00Z',
    source: 'camera_roll',
  },
];

function VaultWithMockData() {
  const store = useVaultStore();

  React.useEffect(() => {
    store.setItems(MOCK_ITEMS);
    store.unlock();
    return () => {
      store.setItems([]);
      store.lock();
    };
  }, []);

  return <VaultScreen />;
}

function VaultEmpty() {
  const store = useVaultStore();

  React.useEffect(() => {
    store.setItems([]);
    store.unlock();
    return () => store.lock();
  }, []);

  return <VaultScreen />;
}

function VaultLocked() {
  const store = useVaultStore();

  React.useEffect(() => {
    store.setItems(MOCK_ITEMS);
    store.lock();
  }, []);

  return <VaultScreen />;
}

const meta: Meta<typeof VaultScreen> = {
  title: 'Screens/VaultScreen',
  component: VaultScreen,
};

export default meta;

type Story = StoryObj<typeof VaultScreen>;

export const Locked: Story = {
  render: () => <VaultLocked />,
};

export const UnlockedWithItems: Story = {
  render: () => <VaultWithMockData />,
};

export const UnlockedEmpty: Story = {
  render: () => <VaultEmpty />,
};
