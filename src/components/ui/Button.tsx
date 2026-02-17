import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, borderRadius } from '../../theme/spacing';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'default' | 'small';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'default',
  disabled = false,
}: ButtonProps) {
  const containerStyle: ViewStyle[] = [
    styles.base,
    variantStyles[variant].container,
    size === 'small' && styles.small,
    disabled && styles.disabled,
  ];

  const textStyle: TextStyle[] = [
    size === 'small' ? styles.smallText : styles.text,
    variantStyles[variant].text,
    disabled && styles.disabledText,
  ];

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={textStyle}>{title}</Text>
    </TouchableOpacity>
  );
}

const variantStyles = {
  primary: {
    container: {
      backgroundColor: colors.primary[500],
    } as ViewStyle,
    text: {
      color: colors.text.inverse,
    } as TextStyle,
  },
  secondary: {
    container: {
      backgroundColor: colors.primary[50],
    } as ViewStyle,
    text: {
      color: colors.primary[700],
    } as TextStyle,
  },
  danger: {
    container: {
      backgroundColor: colors.error,
    } as ViewStyle,
    text: {
      color: colors.text.inverse,
    } as TextStyle,
  },
  ghost: {
    container: {
      backgroundColor: 'transparent',
    } as ViewStyle,
    text: {
      color: colors.text.secondary,
    } as TextStyle,
  },
};

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  text: {
    ...typography.button,
  },
  smallText: {
    ...typography.small,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.4,
  },
  disabledText: {
    opacity: 0.6,
  },
});
