import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FamilyProvider, useFamilyContext } from './src/context/FamilyContext';
import HomeScreen from './src/screens/HomeScreen';
import ChecklistScreen from './src/screens/ChecklistScreen';
import RewardWheelScreen from './src/screens/RewardWheelScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SetupScreen from './src/screens/SetupScreen';
import { colors, fontSize, spacing } from './src/theme';

function AppRouter() {
  const { isLoading, isSetupComplete, nav } = useFamilyContext();

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

  switch (nav.screen) {
    case 'checklist':
      return <ChecklistScreen />;
    case 'reward':
      return <RewardWheelScreen />;
    case 'dashboard':
      return <DashboardScreen />;
    case 'settings':
    case 'settings-children':
    case 'settings-checklist':
    case 'settings-rewards':
      return <SettingsScreen />;
    default:
      return <HomeScreen />;
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
    fontSize: 64,
    marginBottom: spacing.xl,
  },
  loadingText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});
