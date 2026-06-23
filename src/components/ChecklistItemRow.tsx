import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
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

  return (
    <TouchableOpacity
      onPress={onToggle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.8}
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
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <Text style={styles.icon}>{icon}</Text>

      <Text style={[styles.title, isChecked && styles.titleChecked]}>
        {title}
      </Text>

      {isChecked && <Text style={styles.doneLabel}>Done!</Text>}
    </TouchableOpacity>
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
    borderWidth: 4,
    borderColor: 'transparent',
  },
  containerFocused: {
    borderColor: colors.focusRing,
    backgroundColor: colors.surfaceLight,
    transform: [{ scale: 1.02 }],
  },
  containerChecked: {
    backgroundColor: colors.surfaceHighlight,
    opacity: 0.7,
  },
  checkbox: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.sm,
    borderWidth: 4,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
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
    fontSize: 64,
    marginRight: spacing.lg,
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
    marginLeft: spacing.lg,
  },
});
