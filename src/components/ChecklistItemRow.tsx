import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, rounded } from '../theme';

interface Props {
  title: string;
  icon: string;
  isChecked: boolean;
  onToggle: () => void;
  hasTVPreferredFocus?: boolean;
}

export default function ChecklistItemRow({
  title,
  icon,
  isChecked,
  onToggle,
  hasTVPreferredFocus = false,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <TouchableOpacity
      onPress={onToggle}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.8}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={[
        styles.container,
        focused && styles.containerFocused,
        isChecked && styles.containerChecked,
      ]}>
      <View
        style={[
          styles.checkbox,
          isChecked && styles.checkboxChecked,
          focused && !isChecked && styles.checkboxFocused,
        ]}>
        {isChecked && <Text style={styles.checkmark}>✓</Text>}
      </View>

      <Text style={styles.icon}>{icon}</Text>

      <Text style={[styles.title, isChecked && styles.titleChecked]}>
        {title}
      </Text>

      {isChecked && (
        <View style={styles.doneBadge}>
          <Text style={styles.doneLabel}>Done</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...rounded('lg'),
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  containerFocused: {
    borderColor: colors.focusRing,
    backgroundColor: colors.surfaceLight,
  },
  containerChecked: {
    borderColor: colors.successDim,
  },
  checkbox: {
    width: 52,
    height: 52,
    ...rounded('sm'),
    borderWidth: 3,
    borderColor: colors.borderLight,
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
    color: '#FFFFFF',
    fontSize: fontSize.sm,
    fontWeight: '800',
  },
  icon: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  titleChecked: {
    color: colors.textMuted,
  },
  doneBadge: {
    backgroundColor: colors.successDim,
    ...rounded('sm'),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  doneLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.successLight,
  },
});
