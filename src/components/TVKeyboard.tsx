import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { colors, fontSize, spacing, rounded } from '../theme';
import FocusableButton from './FocusableButton';

const ROWS = [
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
  ['K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
  ['U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4'],
  ['5', '6', '7', '8', '9', '0', '-', '.', "'", ','],
];

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  maxLength?: number;
}

export default function TVKeyboard({
  value,
  onChangeText,
  onSubmit,
  placeholder = '',
  maxLength,
}: Props) {
  const [uppercase, setUppercase] = useState(true);

  const handleKey = (key: string) => {
    if (maxLength && value.length >= maxLength) return;
    const char = uppercase ? key : key.toLowerCase();
    onChangeText(value + char);
    if (uppercase) setUppercase(false);
  };

  const handleSpace = () => {
    if (maxLength && value.length >= maxLength) return;
    onChangeText(value + ' ');
  };

  const handleDelete = () => {
    onChangeText(value.slice(0, -1));
  };

  const handleClear = () => {
    onChangeText('');
    setUppercase(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.display}>
        <Text style={[styles.displayText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <Text style={styles.cursor}>|</Text>
      </View>

      <View style={styles.keyboard}>
        {ROWS.map((row, rowIdx) => (
          <TVFocusGuideView key={rowIdx} style={styles.row}>
            {row.map((key) => (
              <FocusableButton
                key={key}
                label={uppercase ? key : key.toLowerCase()}
                variant="secondary"
                size="sm"
                onPress={() => handleKey(key)}
                style={styles.key}
                hasTVPreferredFocus={rowIdx === 0 && key === 'A'}
              />
            ))}
          </TVFocusGuideView>
        ))}

        <TVFocusGuideView style={styles.row}>
          <FocusableButton
            label={uppercase ? 'abc' : 'ABC'}
            variant="ghost"
            size="sm"
            onPress={() => setUppercase(!uppercase)}
            style={styles.actionKey}
          />
          <FocusableButton
            label="Space"
            variant="secondary"
            size="sm"
            onPress={handleSpace}
            style={styles.spaceKey}
          />
          <FocusableButton
            label="Del"
            variant="danger"
            size="sm"
            onPress={handleDelete}
            style={styles.actionKey}
          />
          <FocusableButton
            label="Clear"
            variant="ghost"
            size="sm"
            onPress={handleClear}
            style={styles.actionKey}
          />
          <FocusableButton
            label="Done"
            variant="accent"
            size="sm"
            onPress={onSubmit}
            style={styles.actionKey}
          />
        </TVFocusGuideView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 860,
    alignItems: 'center',
  },
  display: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...rounded('lg'),
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.lg,
    minWidth: 400,
    minHeight: 64,
    borderWidth: 1,
    borderColor: colors.border,
  },
  displayText: {
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  placeholder: {
    color: colors.textMuted,
  },
  cursor: {
    fontSize: fontSize.lg,
    color: colors.accent,
    fontWeight: '300',
    marginLeft: 2,
  },
  keyboard: {
    width: '100%',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  key: {
    width: 66,
    height: 56,
    marginHorizontal: 2,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  actionKey: {
    height: 56,
    marginHorizontal: 2,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
  },
  spaceKey: {
    height: 56,
    marginHorizontal: 2,
    paddingHorizontal: spacing.xxl,
    paddingVertical: 0,
    minWidth: 180,
  },
});
