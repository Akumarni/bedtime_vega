import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  height = 16,
}: Props) {
  const percent = total > 0 ? (completed / total) * 100 : 0;
  const allDone = completed >= total && total > 0;

  return (
    <View style={styles.container}>
      <View style={[styles.track, { height }]}>
        <View
          style={[
            styles.fill,
            { width: `${percent}%`, height },
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
