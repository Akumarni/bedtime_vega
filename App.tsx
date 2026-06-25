import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useKeplerBackHandler } from '@amazon-devices/react-native-kepler';
import { FamilyProvider, useFamilyContext } from './src/context/FamilyContext';
import HomeScreen from './src/screens/HomeScreen';
import ChecklistScreen from './src/screens/ChecklistScreen';
import RewardWheelScreen from './src/screens/RewardWheelScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SettingsPinScreen from './src/screens/SettingsPinScreen';
import SetupScreen from './src/screens/SetupScreen';
import { colors, fontSize, spacing } from './src/theme';

function AppRouter() {
  const { isLoading, isSetupComplete, nav, goBack } = useFamilyContext();
  const keplerBackHandler = useKeplerBackHandler();

  useEffect(() => {
    const sub = keplerBackHandler.addEventListener('hardwareBackPress', () => {
      if (!isSetupComplete || isLoading) return true;
      if (nav.screen === 'home') return true;
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [keplerBackHandler, nav.screen, isSetupComplete, isLoading, goBack]);

  if (isLoading) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashStars}>
          <Text style={styles.splashStar1}>⭐</Text>
          <Text style={styles.splashStar2}>✨</Text>
          <Text style={styles.splashStar3}>⭐</Text>
          <Text style={styles.splashStar4}>✨</Text>
          <Text style={styles.splashStar5}>⭐</Text>
        </View>
        <Text style={styles.splashMoon}>🌙</Text>
        <Text style={styles.splashTitle}>Bedtime</Text>
        <Text style={styles.splashTitleAccent}>Checklist</Text>
        <View style={styles.splashDivider} />
        <Text style={styles.splashTagline}>Making bedtime an adventure</Text>
        <ActivityIndicator
          size="large"
          color={colors.primaryLight}
          style={styles.splashSpinner}
        />
      </View>
    );
  }

  if (!isSetupComplete) {
    return <SetupScreen />;
  }

  const screenKey = `${nav.screen}-${nav.childId || ''}`;

  switch (nav.screen) {
    case 'checklist':
      return <ChecklistScreen key={screenKey} />;
    case 'reward':
      return <RewardWheelScreen key={screenKey} />;
    case 'dashboard':
      return <DashboardScreen key={screenKey} />;
    case 'settings-pin':
      return <SettingsPinScreen key={screenKey} />;
    case 'settings':
    case 'settings-children':
    case 'settings-checklist':
    case 'settings-rewards':
      return <SettingsScreen key={screenKey} />;
    default:
      return <HomeScreen key={screenKey} />;
  }
}

export default function App() {
  return (
    <FamilyProvider>
      <AppRouter />
    </FamilyProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashStars: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  splashStar1: {
    position: 'absolute',
    top: 60,
    left: 200,
    fontSize: 32,
  },
  splashStar2: {
    position: 'absolute',
    top: 40,
    right: 300,
    fontSize: 24,
  },
  splashStar3: {
    position: 'absolute',
    top: 150,
    right: 120,
    fontSize: 28,
  },
  splashStar4: {
    position: 'absolute',
    bottom: 140,
    left: 150,
    fontSize: 20,
  },
  splashStar5: {
    position: 'absolute',
    bottom: 100,
    right: 350,
    fontSize: 26,
  },
  splashMoon: {
    fontSize: 120,
    marginBottom: spacing.lg,
  },
  splashTitle: {
    fontSize: fontSize.hero,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  splashTitleAccent: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.accent,
    marginTop: -spacing.sm,
  },
  splashDivider: {
    width: 120,
    height: 3,
    backgroundColor: colors.primary,
    marginVertical: spacing.lg,
  },
  splashTagline: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  splashSpinner: {
    marginTop: spacing.xxl,
  },
});
