import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import FocusableButton from '../components/FocusableButton';
import TVKeyboard from '../components/TVKeyboard';
import TVNumPad from '../components/TVNumPad';
import { avatarEmojis, colors, fontSize, spacing, rounded, commonStyles } from '../theme';

type SetupStep =
  | 'welcome'
  | 'family-name'
  | 'child-count'
  | 'child-name'
  | 'child-avatar'
  | 'pin';

export default function SetupScreen() {
  const { setupFamily } = useFamilyContext();

  const [step, setStep] = useState<SetupStep>('welcome');
  const [familyName, setFamilyName] = useState('');
  const [childCount, setChildCount] = useState(2);
  const [childNames, setChildNames] = useState<string[]>([]);
  const [childAvatars, setChildAvatars] = useState<string[]>([]);
  const [currentChildIdx, setCurrentChildIdx] = useState(0);
  const [currentName, setCurrentName] = useState('');
  const [pin, setPin] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleFamilyNameDone = () => {
    if (!familyName.trim()) return;
    setStep('child-count');
  };

  const handleChildCountSelected = (count: number) => {
    setChildCount(count);
    setChildNames([]);
    setChildAvatars([]);
    setCurrentChildIdx(0);
    setCurrentName('');
    setStep('child-name');
  };

  const handleChildNameDone = () => {
    if (!currentName.trim()) return;
    const names = [...childNames, currentName.trim()];
    setChildNames(names);
    setCurrentName('');
    setStep('child-avatar');
  };

  const handleAvatarSelected = (emoji: string) => {
    const avatars = [...childAvatars, emoji];
    setChildAvatars(avatars);
    const nextIdx = currentChildIdx + 1;
    if (nextIdx < childCount) {
      setCurrentChildIdx(nextIdx);
      setCurrentName('');
      setStep('child-name');
    } else {
      setStep('pin');
    }
  };

  const handlePinDone = async () => {
    if (pin.length < 4 || isCreating) return;
    setIsCreating(true);
    await setupFamily(familyName.trim(), pin, childNames);
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
          style={styles.topSpace}
          hasTVPreferredFocus
        />
      </View>
    );
  }

  if (step === 'family-name') {
    return (
      <View style={[commonStyles.screenContainer, styles.centered]}>
        <Text style={styles.stepTitle}>What's your family name?</Text>
        <Text style={styles.stepSubtitle}>Use the on-screen keyboard</Text>
        <TVKeyboard
          value={familyName}
          onChangeText={setFamilyName}
          onSubmit={handleFamilyNameDone}
          placeholder="e.g. Johnson"
          maxLength={20}
        />
      </View>
    );
  }

  if (step === 'child-count') {
    return (
      <View style={[commonStyles.screenContainer, styles.centered]}>
        <Text style={styles.stepTitle}>How many kids?</Text>
        <Text style={styles.stepSubtitle}>
          {familyName} family — select the number of children
        </Text>
        <TVFocusGuideView style={styles.countRow}>
          {[1, 2, 3, 4].map((n) => (
            <FocusableButton
              key={n}
              label={String(n)}
              variant={n === childCount ? 'accent' : 'secondary'}
              size="lg"
              onPress={() => handleChildCountSelected(n)}
              style={styles.countButton}
              hasTVPreferredFocus={n === 2}
            />
          ))}
        </TVFocusGuideView>
        <FocusableButton
          label="← Back"
          variant="ghost"
          size="sm"
          onPress={() => setStep('family-name')}
          style={styles.topSpace}
        />
      </View>
    );
  }

  if (step === 'child-name') {
    return (
      <View style={[commonStyles.screenContainer, styles.centered]}>
        <Text style={styles.stepTitle}>
          Child {currentChildIdx + 1} of {childCount}
        </Text>
        <Text style={styles.stepSubtitle}>Enter their name</Text>
        <TVKeyboard
          value={currentName}
          onChangeText={setCurrentName}
          onSubmit={handleChildNameDone}
          placeholder="Name"
          maxLength={15}
        />
      </View>
    );
  }

  if (step === 'child-avatar') {
    return (
      <View style={[commonStyles.screenContainer, styles.centered]}>
        <Text style={styles.stepTitle}>
          Pick an avatar for {childNames[currentChildIdx]}
        </Text>
        <Text style={styles.stepSubtitle}>Choose an emoji character</Text>
        <TVFocusGuideView style={styles.avatarGrid}>
          {avatarEmojis.map((emoji, idx) => (
            <FocusableButton
              key={emoji}
              label={emoji}
              variant="secondary"
              size="lg"
              onPress={() => handleAvatarSelected(emoji)}
              style={styles.avatarButton}
              hasTVPreferredFocus={idx === 0}
            />
          ))}
        </TVFocusGuideView>
      </View>
    );
  }

  if (step === 'pin') {
    return (
      <View style={[commonStyles.screenContainer, styles.centered]}>
        <Text style={styles.stepTitle}>Set a parent PIN</Text>
        <Text style={styles.stepSubtitle}>
          Used to access settings from the companion app
        </Text>
        <TVNumPad
          value={pin}
          onChangeText={setPin}
          onSubmit={handlePinDone}
          maxLength={4}
          label=""
        />
        {isCreating && (
          <Text style={styles.creatingText}>Setting up your family...</Text>
        )}
      </View>
    );
  }

  return null;
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
    maxWidth: 600,
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
  topSpace: {
    marginTop: spacing.xxl,
  },
  countRow: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  countButton: {
    width: 140,
    height: 140,
    marginHorizontal: spacing.md,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    maxWidth: 700,
    marginTop: spacing.lg,
  },
  avatarButton: {
    width: 140,
    height: 140,
    margin: spacing.md,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  creatingText: {
    fontSize: fontSize.md,
    color: colors.accent,
    marginTop: spacing.xl,
    fontWeight: '600',
  },
});
