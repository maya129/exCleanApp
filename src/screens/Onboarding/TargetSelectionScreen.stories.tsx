import type { Meta, StoryObj } from '@storybook/react';
import { TargetSelectionScreen } from './TargetSelectionScreen';

const meta: Meta<typeof TargetSelectionScreen> = {
  title: 'Screens/TargetSelectionScreen',
  component: TargetSelectionScreen,
  args: {
    onComplete: (profile) =>
      console.log('[Story] Profile submitted:', JSON.stringify(profile)),
    onBack: () => console.log('[Story] Back pressed'),
  },
};

export default meta;

type Story = StoryObj<typeof TargetSelectionScreen>;

export const Default: Story = {};

export const WithoutBack: Story = {
  args: {
    onBack: undefined,
  },
};
