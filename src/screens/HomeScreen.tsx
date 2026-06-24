import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import ChildProfile from '../components/ChildProfile';
import FocusableButton from '../components/FocusableButton';
import QRCode from '../components/QRCode';
import { colors, fontSize, spacing, rounded, commonStyles } from '../theme';

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
            onPress={() => navigate('settings-pin')}
            style={styles.headerBtnSpace}
          />
        </TVFocusGuideView>
      </View>

      <Text style={styles.prompt}>Who's ready for bed?</Text>

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
        <View style={styles.qrContainer}>
          {familyId && (
            <QRCode
              value={`https://bedtime.jg-it.net?code=${familyId}`}
              size={120}
              color="#FFFFFF"
              bgColor={colors.surface}
            />
          )}
          <View style={styles.qrTextBlock}>
            <Text style={styles.familyCodeHint}>Scan to manage on your phone</Text>
            <Text style={styles.familyCode}>{familyId}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerBtnSpace: {
    marginLeft: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  familyName: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  prompt: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.primaryLight,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  childrenRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    paddingTop: spacing.sm,
  },
  qrContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...rounded('lg'),
    paddingRight: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrTextBlock: {
    marginLeft: spacing.md,
  },
  familyCodeHint: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  familyCode: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.primaryLight,
    letterSpacing: 3,
    marginTop: spacing.xs,
  },
});
