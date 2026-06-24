import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, rounded } from '../theme';

interface Props {
  name: string;
  avatar: string;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  onPress: () => void;
  hasTVPreferredFocus?: boolean;
}

export default function ChildProfile({
  name,
  avatar,
  completedCount,
  totalCount,
  isComplete,
  onPress,
  hasTVPreferredFocus = false,
}: Props) {
  const [focused, setFocused] = useState(false);

  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      activeOpacity={0.8}
      hasTVPreferredFocus={hasTVPreferredFocus}
      style={[
        styles.card,
        focused && styles.cardFocused,
        isComplete && styles.cardComplete,
      ]}>
      <Text style={styles.avatar}>{avatar}</Text>
      <Text style={styles.name}>{name}</Text>

      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
              isComplete && styles.progressComplete,
            ]}
          />
        </View>
        <Text style={[styles.progressText, isComplete && styles.progressDone]}>
          {isComplete ? '✓ All Done!' : `${completedCount} of ${totalCount}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    ...rounded('xxl'),
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 400,
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  cardFocused: {
    borderColor: colors.focusRing,
    backgroundColor: colors.surfaceLight,
  },
  cardComplete: {
    borderColor: colors.successDim,
  },
  avatar: {
    fontSize: 100,
    marginBottom: spacing.lg,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '80%',
    height: 12,
    backgroundColor: colors.surfaceHighlight,
    ...rounded('round'),
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    ...rounded('round'),
  },
  progressComplete: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  progressDone: {
    color: colors.success,
    fontWeight: '700',
  },
});
