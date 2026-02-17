import type { Meta, StoryObj } from '@storybook/react';
import { OnboardingScreen } from './OnboardingScreen';

const meta: Meta<typeof OnboardingScreen> = {
  title: 'Screens/OnboardingScreen',
  component: OnboardingScreen,
  args: {
    onComplete: () => console.log('[Story] Onboarding complete'),
  },
};

export default meta;

type Story = StoryObj<typeof OnboardingScreen>;

export const Default: Story = {};

export const WithCustomCallback: Story = {
  args: {
    onComplete: () => console.log('[Story] Custom onComplete fired'),
  },
};
