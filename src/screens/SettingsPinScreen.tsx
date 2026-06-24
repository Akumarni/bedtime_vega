import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFamilyContext } from '../context/FamilyContext';
import TVNumPad from '../components/TVNumPad';
import FocusableButton from '../components/FocusableButton';
import { colors, fontSize, spacing, commonStyles } from '../theme';

export default function SettingsPinScreen() {
  const { familyPin, navigate, goBack } = useFamilyContext();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (pin === familyPin) {
      navigate('settings');
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <View style={[commonStyles.screenContainer, styles.container]}>
      <FocusableButton
        label="←"
        variant="ghost"
        size="sm"
        onPress={goBack}
        style={styles.backButton}
      />

      <Text style={styles.lockIcon}>🔒</Text>
      <Text style={styles.title}>Parent PIN Required</Text>
      <Text style={styles.subtitle}>
        Settings are protected so little ones can't make changes
      </Text>

      {error && (
        <Text style={styles.errorText}>Incorrect PIN — try again</Text>
      )}

      <TVNumPad
        value={pin}
        onChangeText={(v) => { setPin(v); setError(false); }}
        onSubmit={handleSubmit}
        maxLength={4}
        label=""
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.xxl,
  },
  lockIcon: {
    fontSize: 72,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    maxWidth: 500,
  },
  errorText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.danger,
    marginBottom: spacing.lg,
  },
});
