import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import ChildProfile from '../components/ChildProfile';
import FocusableButton from '../components/FocusableButton';
import { colors, fontSize, spacing, commonStyles } from '../theme';

export default function HomeScreen() {
  const {
    familyId,
    familyName,
    children,
    tonight,
    navigate,
    getChildProgress,
  } = useFamilyContext();

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good evening</Text>
          <Text style={styles.familyName}>{familyName} Family</Text>
        </View>
        <TVFocusGuideView style={styles.headerButtons}>
          <FocusableButton
            label="Dashboard"
            icon="📊"
            variant="ghost"
            size="sm"
            onPress={() => navigate('dashboard')}
          />
          <FocusableButton
            label="Settings"
            icon="⚙️"
            variant="ghost"
            size="sm"
            onPress={() => navigate('settings')}
            style={{ marginLeft: spacing.md }}
          />
        </TVFocusGuideView>
      </View>

      <Text style={styles.prompt}>Who's ready for bed? 🌙</Text>

      <TVFocusGuideView style={styles.childrenRow}>
        {children.map((child, idx) => {
          const progress = getChildProgress(child.id);
          const childTonight = tonight[child.id];
          const isComplete = childTonight?.allComplete ?? false;

          return (
            <ChildProfile
              key={child.id}
              name={child.name}
              avatar={child.avatar}
              completedCount={progress.completed}
              totalCount={progress.total}
              isComplete={isComplete}
              hasTVPreferredFocus={idx === 0}
              onPress={() => {
                if (isComplete) {
                  navigate('dashboard', child.id);
                } else {
                  navigate('checklist', child.id);
                }
              }}
            />
          );
        })}
      </TVFocusGuideView>

      <View style={styles.footer}>
        <Text style={styles.familyCode}>Family Code: {familyId}</Text>
        <Text style={styles.familyCodeHint}>
          Enter this code on your phone to manage settings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  greeting: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  familyName: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  prompt: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.primaryLight,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  childrenRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  familyCode: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: '600',
    letterSpacing: 2,
  },
  familyCodeHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
