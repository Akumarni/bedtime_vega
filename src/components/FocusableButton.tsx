import React, { useState, useRef, useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  Animated,
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
}

export default function FocusableButton({
  label,
  onPress,
  icon,
  variant = 'primary',
  size = 'md',
  style,
  disabled = false,
}: Props) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;

  const handleFocus = useCallback(() => {
    setFocused(true);
    Animated.spring(scale, {
      toValue: 1.05,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    Animated.spring(scale, {
      toValue: 1,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={disabled ? undefined : onPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  focused: {
    borderColor: colors.focusRing,
    shadowColor: colors.focusGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
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
    container: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
    label: { fontSize: fontSize.sm } as TextStyle,
    icon: { fontSize: fontSize.sm } as TextStyle,
  }),
  md: StyleSheet.create({
    container: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
    label: { fontSize: fontSize.md } as TextStyle,
    icon: { fontSize: fontSize.md } as TextStyle,
  }),
  lg: StyleSheet.create({
    container: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg },
    label: { fontSize: fontSize.lg } as TextStyle,
    icon: { fontSize: fontSize.lg } as TextStyle,
  }),
};
