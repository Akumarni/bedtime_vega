import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import ChecklistItemRow from '../components/ChecklistItemRow';
import ProgressBar from '../components/ProgressBar';
import FocusableButton from '../components/FocusableButton';
import { colors, fontSize, spacing, rounded, commonStyles } from '../theme';

function formatTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00';
  const m = Math.floor(totalSeconds / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function ChecklistScreen() {
  const {
    nav,
    children,
    tonight,
    toggleItem,
    startTimer,
    navigate,
    goBack,
    getChildProgress,
    getChecklistForChild,
  } = useFamilyContext();

  const checklistItems = nav.childId ? getChecklistForChild(nav.childId) : [];
  const child = children.find((c) => c.id === nav.childId);
  const childTonight = nav.childId ? tonight[nav.childId] : undefined;
  const progress = nav.childId
    ? getChildProgress(nav.childId)
    : { completed: 0, total: 0 };

  const allDone =
    progress.completed >= progress.total && progress.total > 0;

  const timerMinutes = child?.timerMinutes ?? 15;
  const timerStartedAt = childTonight?.timerStartedAt ?? null;

  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);

  useEffect(() => {
    if (!nav.childId) return;
    startTimer(nav.childId);
  }, [nav.childId, startTimer]);

  useEffect(() => {
    if (!timerStartedAt) return;

    const tick = () => {
      const elapsed = (Date.now() - timerStartedAt) / 1000;
      const remaining = timerMinutes * 60 - elapsed;
      setRemainingSeconds(remaining);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [timerStartedAt, timerMinutes]);

  useEffect(() => {
    if (allDone && nav.childId && !childTonight?.allComplete) {
      const timer = setTimeout(() => {
        navigate('reward', nav.childId);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [allDone, nav.childId, childTonight?.allComplete, navigate]);

  const handleToggle = useCallback(
    (itemId: string) => {
      if (!nav.childId) return;
      const currentlyChecked = childTonight?.items?.[itemId] ?? false;
      toggleItem(nav.childId, itemId, !currentlyChecked);
    },
    [nav.childId, childTonight, toggleItem],
  );

  if (!child) {
    return (
      <View style={[commonStyles.screenContainer, commonStyles.center]}>
        <Text style={commonStyles.title}>Child not found</Text>
        <FocusableButton label="Go Back" onPress={goBack} hasTVPreferredFocus />
      </View>
    );
  }

  const timerExpired = remainingSeconds !== null && remainingSeconds <= 0;

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="←"
          variant="ghost"
          size="sm"
          onPress={goBack}
        />
        <Text style={styles.avatar}>{child.avatar}</Text>
        <View style={styles.nameBlock}>
          <Text style={styles.childName}>{child.name}</Text>
          <Text style={styles.subtitle}>Bedtime Checklist</Text>
        </View>

        <View style={styles.headerRight}>
          {remainingSeconds !== null && (
            <View style={[styles.timerPill, timerExpired && styles.timerExpired]}>
              <Text style={styles.timerIcon}>{timerExpired ? '⏰' : '⏱️'}</Text>
              <Text style={[styles.timerText, timerExpired && styles.timerTextExpired]}>
                {timerExpired ? "Time's up" : formatTime(remainingSeconds)}
              </Text>
            </View>
          )}
          <View style={styles.progressBox}>
            <ProgressBar
              completed={progress.completed}
              total={progress.total}
              showLabel={false}
            />
            <Text style={styles.progressLabel}>
              {progress.completed}/{progress.total}
            </Text>
          </View>
        </View>
      </View>

      {allDone && (
        <View style={styles.completeBanner}>
          <Text style={styles.completeText}>
            Amazing job, {child.name}!
          </Text>
          <Text style={styles.completeSubtext}>
            Spinning the reward wheel...
          </Text>
        </View>
      )}

      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        <TVFocusGuideView>
          {checklistItems.map((item, idx) => {
            const isChecked = childTonight?.items?.[item.id] ?? false;
            return (
              <ChecklistItemRow
                key={item.id}
                title={item.title}
                icon={item.icon}
                isChecked={isChecked}
                onToggle={() => handleToggle(item.id)}
                hasTVPreferredFocus={idx === 0}
              />
            );
          })}
        </TVFocusGuideView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    fontSize: 52,
    marginLeft: spacing.md,
    marginRight: spacing.sm,
  },
  nameBlock: {
    flex: 0,
    marginRight: spacing.lg,
  },
  childName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  headerRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...rounded('round'),
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.lg,
  },
  timerExpired: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerDim,
  },
  timerIcon: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  timerText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.accent,
  },
  timerTextExpired: {
    color: colors.danger,
  },
  progressBox: {
    width: 200,
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '600',
  },
  completeBanner: {
    backgroundColor: colors.successDim,
    ...rounded('lg'),
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.success,
  },
  completeText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.successLight,
  },
  completeSubtext: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
});
