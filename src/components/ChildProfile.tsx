import React, { useState, useRef, useCallback } from 'react';
import { Pressable, View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../theme';

interface Props {
  name: string;
  avatar: string;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
  onPress: () => void;
}

export default function ChildProfile({
  name,
  avatar,
  completedCount,
  totalCount,
  isComplete,
  onPress,
}: Props) {
  const [focused, setFocused] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const handleFocus = useCallback(() => {
    setFocused(true);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1.08,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scale, glow]);

  const handleBlur = useCallback(() => {
    setFocused(false);
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [scale, glow]);

  const progressPercent =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale }] }]}>
      <Pressable
        onPress={onPress}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
            {isComplete
              ? '✓ Done!'
              : `${completedCount}/${totalCount}`}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    marginHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
    minHeight: 220,
    justifyContent: 'center',
  },
  cardFocused: {
    borderColor: colors.focusRing,
    backgroundColor: colors.surfaceLight,
    shadowColor: colors.focusGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardComplete: {
    borderColor: colors.successDim,
  },
  avatar: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  name: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressTrack: {
    width: '80%',
    height: 8,
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
