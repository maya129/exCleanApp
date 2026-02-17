import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      options: ['primary', 'secondary', 'danger', 'ghost'],
      control: { type: 'select' },
    },
    size: {
      options: ['default', 'small'],
      control: { type: 'select' },
    },
    disabled: {
      control: { type: 'boolean' },
    },
  },
  args: {
    title: 'Continue',
    onPress: () => console.log('[Story] Button pressed'),
    variant: 'primary',
    size: 'default',
    disabled: false,
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = {
  args: { variant: 'secondary', title: 'Cancel' },
};

export const Danger: Story = {
  args: { variant: 'danger', title: 'Delete forever' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', title: 'Back' },
};

export const Small: Story = {
  args: { size: 'small', title: 'Small button' },
};

export const Disabled: Story = {
  args: { disabled: true, title: 'Not available' },
};
