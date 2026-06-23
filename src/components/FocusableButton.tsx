import React, { useState, useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, fontSize, borderRadius, spacing } from '../theme';

interface Props {
  label: string;
  onPress: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  disabled?: boolean;
  hasTVPreferredFocus?: boolean;
}

export default function FocusableButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
  style,
  disabled = false,
  hasTVPreferredFocus = false,
}: Props) {
  const [focused, setFocused] = useState(false);

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <TouchableOpacity
      onPress={disabled ? undefined : onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.8}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={[
        styles.base,
        variantStyle.container,
        sizeStyle.container,
        focused && styles.focused,
        focused && variantStyle.focused,
        disabled && styles.disabled,
        style,
      ]}>
      {icon ? (
        <Text style={[styles.icon, sizeStyle.icon]}>{icon}</Text>
      ) : null}
      <Text
        style={[
          styles.label,
          variantStyle.label,
          sizeStyle.label,
          disabled && styles.disabledText,
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: colors.focusRing,
    transform: [{ scale: 1.05 }],
  },
  label: {
    fontWeight: '600',
  },
  icon: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.4,
  },
  disabledText: {
    color: colors.textMuted,
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: colors.primary },
    focused: { backgroundColor: colors.primaryLight },
    label: { color: colors.textPrimary } as TextStyle,
  }),
  secondary: StyleSheet.create({
    container: { backgroundColor: colors.surface },
    focused: { backgroundColor: colors.surfaceLight },
    label: { color: colors.textPrimary } as TextStyle,
  }),
  accent: StyleSheet.create({
    container: { backgroundColor: colors.accentDim },
    focused: { backgroundColor: colors.accent },
    label: { color: colors.background } as TextStyle,
  }),
  danger: StyleSheet.create({
    container: { backgroundColor: colors.dangerDim },
    focused: { backgroundColor: colors.danger },
    label: { color: colors.textPrimary } as TextStyle,
  }),
  ghost: StyleSheet.create({
    container: { backgroundColor: 'transparent' },
    focused: { backgroundColor: colors.surfaceLight },
    label: { color: colors.textSecondary } as TextStyle,
  }),
};

const sizeStyles = {
  sm: StyleSheet.create({
    container: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    label: { fontSize: fontSize.sm } as TextStyle,
    icon: { fontSize: fontSize.sm } as TextStyle,
  }),
  md: StyleSheet.create({
    container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
    label: { fontSize: fontSize.md } as TextStyle,
    icon: { fontSize: fontSize.md } as TextStyle,
  }),
  lg: StyleSheet.create({
    container: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.xl },
    label: { fontSize: fontSize.lg } as TextStyle,
    icon: { fontSize: fontSize.lg } as TextStyle,
  }),
};
