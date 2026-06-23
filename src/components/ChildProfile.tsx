import React, { useState } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../theme';

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
        <Text style={styles.progressText}>
          {isComplete ? '✓ Done!' : `${completedCount}/${totalCount}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'transparent',
    minHeight: 440,
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  cardFocused: {
    borderColor: colors.focusRing,
    backgroundColor: colors.surfaceLight,
    transform: [{ scale: 1.05 }],
  },
  cardComplete: {
    borderColor: colors.successDim,
  },
  avatar: {
    fontSize: 120,
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
    height: 16,
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
  },
  progressComplete: {
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
