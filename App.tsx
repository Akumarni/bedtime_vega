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
      <View style={styles.loading}>
        <Text style={styles.loadingMoon}>🌙</Text>
        <ActivityIndicator size="large" color={colors.primaryLight} />
        <Text style={styles.loadingText}>Loading...</Text>
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
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingMoon: {
    fontSize: 80,
    marginBottom: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
