import React, { useState, useRef, useCallback } from 'react';
import { Pressable, View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../theme';

interface Props {
  title: string;
  icon: string;
  isChecked: boolean;
  onToggle: () => void;
}

export default function ChecklistItemRow({
  title,
  icon,
  isChecked,
  onToggle,
}: Props) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const checkScale = useRef(new Animated.Value(isChecked ? 1 : 0)).current;

  const handleFocus = useCallback(() => {
    setFocused(true);
    Animated.spring(scale, {
      toValue: 1.03,
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

  const handlePress = useCallback(() => {
    Animated.sequence([
      Animated.timing(checkScale, {
        toValue: isChecked ? 0 : 1.2,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(checkScale, {
        toValue: isChecked ? 0 : 1,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  }, [checkScale, isChecked, onToggle]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={handlePress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        style={[
          styles.container,
          focused && styles.containerFocused,
          isChecked && styles.containerChecked,
        ]}>
        <View
          style={[
            styles.checkbox,
            isChecked && styles.checkboxChecked,
            focused && styles.checkboxFocused,
          ]}>
          {isChecked && (
            <Animated.Text
              style={[styles.checkmark, { transform: [{ scale: checkScale }] }]}>
              ✓
            </Animated.Text>
          )}
        </View>

        <Text style={styles.icon}>{icon}</Text>

        <Text
          style={[styles.title, isChecked && styles.titleChecked]}>
          {title}
        </Text>

        {isChecked && <Text style={styles.doneLabel}>Done!</Text>}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  containerFocused: {
    borderColor: colors.focusRing,
    backgroundColor: colors.surfaceLight,
    shadowColor: colors.focusGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  containerChecked: {
    backgroundColor: colors.surfaceHighlight,
    opacity: 0.7,
  },
  checkbox: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  checkboxChecked: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkboxFocused: {
    borderColor: colors.focusRing,
  },
  checkmark: {
    color: colors.background,
    fontSize: fontSize.md,
    fontWeight: '800',
  },
  icon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  titleChecked: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  doneLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.success,
    marginLeft: spacing.md,
  },
});
