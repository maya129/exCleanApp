/**
 * Ex-Eraser Color Palette
 * Empathetic & minimalist — soft blues and greens for calm, healing energy.
 */

export const colors = {
  // Primary — calming teal/blue
  primary: {
    50: '#E8F4F8',
    100: '#C5E4ED',
    200: '#9FD3E1',
    300: '#78C1D5',
    400: '#5AB3CC',
    500: '#3DA5C3', // main brand color
    600: '#3494B0',
    700: '#2A7F98',
    800: '#216A80',
    900: '#154857',
  },

  // Secondary — soft sage green
  secondary: {
    50: '#EDF5F0',
    100: '#D1E7D9',
    200: '#B3D7C0',
    300: '#94C7A7',
    400: '#7DBB94',
    500: '#66AF81', // main accent
    600: '#5A9D73',
    700: '#4C8762',
    800: '#3E7152',
    900: '#2A4D37',
  },

  // Neutral — warm grays
  neutral: {
    0: '#FFFFFF',
    50: '#F7F8FA',
    100: '#EEF0F3',
    200: '#DDE1E6',
    300: '#C1C7CF',
    400: '#A2ABB5',
    500: '#78828E',
    600: '#5A6370',
    700: '#434B56',
    800: '#2D333B',
    900: '#1C2028',
  },

  // Semantic
  success: '#66AF81',
  warning: '#E8B84B',
  error: '#D96B6B',
  info: '#3DA5C3',

  // Backgrounds
  background: {
    primary: '#FFFFFF',
    secondary: '#F7F8FA',
    tertiary: '#EEF0F3',
    dark: '#1C2028',
  },

  // Text
  text: {
    primary: '#1C2028',
    secondary: '#5A6370',
    tertiary: '#A2ABB5',
    inverse: '#FFFFFF',
    accent: '#3DA5C3',
  },

  // Vault-specific
  vault: {
    background: '#154857',
    surface: '#216A80',
    accent: '#5AB3CC',
  },
} as const;

export type ColorToken = typeof colors;
