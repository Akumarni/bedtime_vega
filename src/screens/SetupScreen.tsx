import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useFamilyContext } from '../context/FamilyContext';
import FocusableButton from '../components/FocusableButton';
import { colors, fontSize, spacing, borderRadius, commonStyles } from '../theme';

type SetupStep = 'welcome' | 'family-name' | 'children' | 'pin';

export default function SetupScreen() {
  const { setupFamily } = useFamilyContext();

  const [step, setStep] = useState<SetupStep>('welcome');
  const [familyName, setFamilyName] = useState('');
  const [childNames, setChildNames] = useState(['', '']);
  const [pin, setPin] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleAddChild = () => {
    if (childNames.length < 4) {
      setChildNames([...childNames, '']);
    }
  };

  const handleRemoveChild = (idx: number) => {
    if (childNames.length > 1) {
      setChildNames(childNames.filter((_, i) => i !== idx));
    }
  };

  const handleUpdateChild = (idx: number, name: string) => {
    const updated = [...childNames];
    updated[idx] = name;
    setChildNames(updated);
  };

  const handleFinish = async () => {
    setIsCreating(true);
    const validNames = childNames.filter((n) => n.trim());
    await setupFamily(familyName.trim(), pin, validNames);
  };

  if (step === 'welcome') {
    return (
      <View style={[commonStyles.screenContainer, styles.centered]}>
        <Text style={styles.moonEmoji}>🌙</Text>
        <Text style={styles.welcomeTitle}>Bedtime Checklist</Text>
        <Text style={styles.welcomeSubtitle}>
          Making bedtime a breeze, one checkmark at a time
        </Text>
        <FocusableButton
          label="Get Started"
          variant="accent"
          size="lg"
          onPress={() => setStep('family-name')}
          style={{ marginTop: spacing.xxl }}
        />
      </View>
    );
  }

  if (step === 'family-name') {
    return (
      <View style={[commonStyles.screenContainer, styles.centered]}>
        <Text style={styles.stepTitle}>What's your family name?</Text>
        <TextInput
          style={styles.bigInput}
          value={familyName}
          onChangeText={setFamilyName}
          placeholder="e.g. Johnson"
          placeholderTextColor={colors.textMuted}
          autoFocus
        />
        <FocusableButton
          label="Next →"
          variant="primary"
          size="lg"
          onPress={() => setStep('children')}
          disabled={!familyName.trim()}
          style={{ marginTop: spacing.xl }}
        />
      </View>
    );
  }

  if (step === 'children') {
    return (
      <View style={[commonStyles.screenContainer, styles.centered]}>
        <Text style={styles.stepTitle}>Who are the kids?</Text>
        <Text style={styles.stepSubtitle}>Add 1 to 4 children</Text>

        {childNames.map((name, idx) => (
          <View key={idx} style={styles.childInputRow}>
            <TextInput
              style={[styles.bigInput, { flex: 1 }]}
              value={name}
              onChangeText={(v) => handleUpdateChild(idx, v)}
              placeholder={`Child ${idx + 1}'s name`}
              placeholderTextColor={colors.textMuted}
            />
            {childNames.length > 1 && (
              <FocusableButton
                label="✕"
                variant="danger"
                size="sm"
                onPress={() => handleRemoveChild(idx)}
                style={{ marginLeft: spacing.md }}
              />
            )}
          </View>
        ))}

        {childNames.length < 4 && (
          <FocusableButton
            label="+ Add Another Child"
            variant="ghost"
            size="sm"
            onPress={handleAddChild}
            style={{ marginTop: spacing.md }}
          />
        )}

        <View style={styles.navButtons}>
          <FocusableButton
            label="← Back"
            variant="ghost"
            size="md"
            onPress={() => setStep('family-name')}
          />
          <FocusableButton
            label="Next →"
            variant="primary"
            size="lg"
            onPress={() => setStep('pin')}
            disabled={!childNames.some((n) => n.trim())}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[commonStyles.screenContainer, styles.centered]}>
      <Text style={styles.stepTitle}>Set a parent PIN</Text>
      <Text style={styles.stepSubtitle}>
        Used to access settings from the phone companion app
      </Text>
      <TextInput
        style={[styles.bigInput, styles.pinInput]}
        value={pin}
        onChangeText={(v) => setPin(v.replace(/\D/g, '').slice(0, 4))}
        placeholder="4-digit PIN"
        placeholderTextColor={colors.textMuted}
        keyboardType="numeric"
        maxLength={4}
      />

      <View style={styles.navButtons}>
        <FocusableButton
          label="← Back"
          variant="ghost"
          size="md"
          onPress={() => setStep('children')}
        />
        <FocusableButton
          label={isCreating ? 'Creating...' : "Let's Go! 🌙"}
          variant="accent"
          size="lg"
          onPress={handleFinish}
          disabled={pin.length < 4 || isCreating}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moonEmoji: {
    fontSize: 96,
    marginBottom: spacing.xl,
  },
  welcomeTitle: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  welcomeSubtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    maxWidth: 500,
  },
  stepTitle: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  bigInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    fontSize: fontSize.lg,
    color: colors.textPrimary,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 350,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  pinInput: {
    letterSpacing: 16,
    fontSize: fontSize.xxl,
    fontWeight: '700',
    minWidth: 250,
  },
  childInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    maxWidth: 450,
    width: '100%',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 450,
    marginTop: spacing.xxl,
  },
});
