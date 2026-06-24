import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import RewardWheel from '../components/RewardWheel';
import FocusableButton from '../components/FocusableButton';
import { RewardItem } from '../types';
import { colors, fontSize, spacing, commonStyles } from '../theme';

export default function RewardWheelScreen() {
  const { nav, children, getRewardsForChild, completeChild, navigate, goBack } =
    useFamilyContext();

  const child = children.find((c) => c.id === nav.childId);
  const childRewards = nav.childId ? getRewardsForChild(nav.childId) : [];
  const [spinning, setSpinning] = useState(false);
  const [landed, setLanded] = useState(false);

  const handleSpin = () => {
    setSpinning(true);
  };

  const handleComplete = useCallback(
    async (reward: RewardItem) => {
      setLanded(true);
      if (nav.childId) {
        await completeChild(nav.childId, reward.title, reward.icon);
      }
    },
    [nav.childId, completeChild],
  );

  if (!child) {
    return (
      <View style={[commonStyles.screenContainer, commonStyles.center]}>
        <Text style={commonStyles.title}>Something went wrong</Text>
        <FocusableButton label="Go Home" onPress={goBack} hasTVPreferredFocus />
      </View>
    );
  }

  if (!spinning) {
    return (
      <View style={[commonStyles.screenContainer, styles.container]}>
        <Text style={styles.celebEmoji}>{child.avatar}</Text>
        <Text style={styles.title}>Great job, {child.name}!</Text>
        <Text style={styles.subtitle}>
          You finished your bedtime checklist
        </Text>
        <FocusableButton
          label="Spin for a Reward!"
          icon="🎰"
          variant="accent"
          size="lg"
          onPress={handleSpin}
          style={styles.spinButton}
          hasTVPreferredFocus
        />
      </View>
    );
  }

  return (
    <View style={[commonStyles.screenContainer, styles.container]}>
      <Text style={styles.title}>
        {landed ? `${child.name} earned a reward!` : 'Spinning...'}
      </Text>
      <Text style={styles.subtitle}>
        {landed
          ? 'Here is your prize for tonight'
          : "Let's see what you won..."}
      </Text>

      <View style={styles.wheelContainer}>
        <RewardWheel rewards={childRewards} onComplete={handleComplete} />
      </View>

      {landed && (
        <TVFocusGuideView style={styles.actions}>
          <FocusableButton
            label="Back to Home"
            icon="🏠"
            variant="primary"
            size="lg"
            onPress={() => navigate('home')}
            hasTVPreferredFocus
          />
        </TVFocusGuideView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebEmoji: {
    fontSize: 120,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  spinButton: {
    marginTop: spacing.xl,
  },
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 700,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
});
