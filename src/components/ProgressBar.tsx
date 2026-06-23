import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../theme';

interface Props {
  completed: number;
  total: number;
  showLabel?: boolean;
  height?: number;
}

export default function ProgressBar({
  completed,
  total,
  showLabel = true,
  height = 12,
}: Props) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percent = total > 0 ? (completed / total) * 100 : 0;
  const allDone = completed >= total && total > 0;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percent,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [percent, animatedWidth]);

  const width = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <Animated.View
          style={[
            styles.fill,
            { width, height },
            allDone && styles.fillComplete,
          ]}
        />
      </View>
      {showLabel && (
        <Text style={[styles.label, allDone && styles.labelComplete]}>
          {allDone ? 'All done! ⭐' : `${completed} of ${total}`}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  track: {
    width: '100%',
    backgroundColor: colors.surfaceHighlight,
    borderRadius: borderRadius.round,
    overflow: 'hidden',
  },
  fill: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.round,
  },
  fillComplete: {
    backgroundColor: colors.success,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  labelComplete: {
    color: colors.success,
    fontWeight: '700',
  },
});
