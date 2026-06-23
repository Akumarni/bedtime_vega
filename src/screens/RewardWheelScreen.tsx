import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { useFamilyContext } from '../context/FamilyContext';
import RewardWheel from '../components/RewardWheel';
import FocusableButton from '../components/FocusableButton';
import { RewardItem } from '../types';
import { colors, fontSize, spacing, commonStyles } from '../theme';

export default function RewardWheelScreen() {
  const { nav, children, rewards, completeChild, navigate, goBack } =
    useFamilyContext();

  const child = children.find((c) => c.id === nav.childId);
  const [landed, setLanded] = useState(false);
  const [wonReward, setWonReward] = useState<RewardItem | null>(null);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => handler.remove();
  }, [goBack]);

  const handleComplete = useCallback(
    async (reward: RewardItem) => {
      setWonReward(reward);
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
        <FocusableButton label="Go Home" onPress={goBack} />
      </View>
    );
  }

  return (
    <View style={[commonStyles.screenContainer, styles.container]}>
      <Text style={styles.title}>
        {landed ? `${child.name} earned a reward!` : `Great job, ${child.name}!`}
      </Text>
      <Text style={styles.subtitle}>
        {landed
          ? 'Here is your prize for tonight 🎉'
          : "Let's see what you won tonight..."}
      </Text>

      <View style={styles.wheelContainer}>
        <RewardWheel rewards={rewards} onComplete={handleComplete} />
      </View>

      {landed && (
        <View style={styles.actions}>
          <FocusableButton
            label="Back to Home"
            icon="🏠"
            variant="primary"
            size="lg"
            onPress={() => navigate('home')}
          />
          <FocusableButton
            label="View Dashboard"
            icon="📊"
            variant="secondary"
            size="lg"
            onPress={() => navigate('dashboard', child.id)}
            style={{ marginLeft: spacing.lg }}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.accent,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  wheelContainer: {
    flex: 1,
    justifyContent: 'center',
    maxHeight: 560,
  },
  actions: {
    flexDirection: 'row',
    marginTop: spacing.xxl,
  },
});
