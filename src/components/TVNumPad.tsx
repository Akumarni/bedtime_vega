import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { colors, fontSize, spacing, rounded } from '../theme';
import FocusableButton from './FocusableButton';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  maxLength?: number;
  label?: string;
}

export default function TVNumPad({
  value,
  onChangeText,
  onSubmit,
  maxLength = 4,
  label = 'Enter PIN',
}: Props) {
  const handleDigit = (digit: string) => {
    if (value.length >= maxLength) return;
    onChangeText(value + digit);
  };

  const handleDelete = () => {
    onChangeText(value.slice(0, -1));
  };

  const dots = Array.from({ length: maxLength }, (_, i) => (
    <View
      key={i}
      style={[
        styles.dot,
        i < value.length && styles.dotFilled,
      ]}
    />
  ));

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View style={styles.dotsRow}>{dots}</View>

      <View style={styles.pad}>
        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']].map(
          (row, rowIdx) => (
            <TVFocusGuideView key={rowIdx} style={styles.row}>
              {row.map((digit) => (
                <FocusableButton
                  key={digit}
                  label={digit}
                  variant="secondary"
                  size="md"
                  onPress={() => handleDigit(digit)}
                  style={styles.digitKey}
                  hasTVPreferredFocus={digit === '1'}
                />
              ))}
            </TVFocusGuideView>
          ),
        )}
        <TVFocusGuideView style={styles.row}>
          <FocusableButton
            label="Del"
            variant="danger"
            size="md"
            onPress={handleDelete}
            style={styles.digitKey}
          />
          <FocusableButton
            label="0"
            variant="secondary"
            size="md"
            onPress={() => handleDigit('0')}
            style={styles.digitKey}
          />
          <FocusableButton
            label="OK"
            variant="accent"
            size="md"
            onPress={onSubmit}
            disabled={value.length < maxLength}
            style={styles.digitKey}
          />
        </TVFocusGuideView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  dotsRow: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
  },
  dot: {
    width: 36,
    height: 36,
    ...rounded('round'),
    backgroundColor: colors.surfaceHighlight,
    marginHorizontal: spacing.sm,
    borderWidth: 2,
    borderColor: colors.borderLight,
  },
  dotFilled: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pad: {
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  digitKey: {
    width: 110,
    height: 80,
    marginHorizontal: spacing.xs,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
});
