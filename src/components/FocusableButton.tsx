import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, fontSize, rounded, spacing } from '../theme';

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
    ...rounded('md'),
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: colors.focusRing,
  },
  label: {
    fontWeight: '600',
  },
  icon: {
    marginRight: spacing.sm,
  },
  disabled: {
    opacity: 0.35,
  },
  disabledText: {
    color: colors.textMuted,
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: colors.primary },
    focused: { backgroundColor: colors.primaryLight },
    label: { color: '#FFFFFF' } as TextStyle,
  }),
  secondary: StyleSheet.create({
    container: { backgroundColor: colors.surface, borderColor: colors.border },
    focused: { backgroundColor: colors.surfaceLight, borderColor: colors.focusRing },
    label: { color: colors.textPrimary } as TextStyle,
  }),
  accent: StyleSheet.create({
    container: { backgroundColor: colors.accentDim },
    focused: { backgroundColor: colors.accent },
    label: { color: '#FFFFFF' } as TextStyle,
  }),
  danger: StyleSheet.create({
    container: { backgroundColor: colors.dangerDim },
    focused: { backgroundColor: colors.danger },
    label: { color: '#FFFFFF' } as TextStyle,
  }),
  ghost: StyleSheet.create({
    container: { backgroundColor: 'transparent' },
    focused: { backgroundColor: colors.surfaceLight },
    label: { color: colors.textSecondary } as TextStyle,
  }),
};

const sizeStyles = {
  sm: StyleSheet.create({
    container: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
    label: { fontSize: fontSize.xs } as TextStyle,
    icon: { fontSize: fontSize.xs } as TextStyle,
  }),
  md: StyleSheet.create({
    container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
    label: { fontSize: fontSize.sm } as TextStyle,
    icon: { fontSize: fontSize.sm } as TextStyle,
  }),
  lg: StyleSheet.create({
    container: { paddingHorizontal: spacing.xxl, paddingVertical: spacing.lg },
    label: { fontSize: fontSize.md } as TextStyle,
    icon: { fontSize: fontSize.md } as TextStyle,
  }),
};
