import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import FocusableButton from '../components/FocusableButton';
import { colors, fontSize, spacing, rounded, commonStyles } from '../theme';

function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function DashboardScreen() {
  const { children, tonight, history, goBack } = useFamilyContext();
  const [selectedChild, setSelectedChild] = useState(0);

  const child = children[selectedChild];
  const childHistory = child ? history[child.id] || [] : [];
  const childTonight = child ? tonight[child.id] : undefined;

  const streak = computeStreak(childHistory.map((e) => e.date));
  const totalRewards = childHistory.length;

  let completionTime: string | null = null;
  if (childTonight?.completedAt && childTonight?.timerStartedAt) {
    completionTime = formatElapsed(childTonight.completedAt - childTonight.timerStartedAt);
  }

  const rewardCounts: Record<string, { count: number; icon: string }> = {};
  for (const entry of childHistory) {
    if (!rewardCounts[entry.rewardTitle]) {
      rewardCounts[entry.rewardTitle] = { count: 0, icon: entry.rewardIcon };
    }
    rewardCounts[entry.rewardTitle].count++;
  }

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <FocusableButton
          label="←"
          variant="ghost"
          size="sm"
          onPress={goBack}
          hasTVPreferredFocus
        />
        <Text style={styles.title}>Dashboard</Text>
      </View>

      {children.length > 1 && (
        <TVFocusGuideView style={styles.tabs}>
          {children.map((c, idx) => (
            <FocusableButton
              key={c.id}
              label={`${c.avatar} ${c.name}`}
              variant={idx === selectedChild ? 'primary' : 'secondary'}
              size="sm"
              onPress={() => setSelectedChild(idx)}
              style={styles.tab}
            />
          ))}
        </TVFocusGuideView>
      )}

      {child && (
        <ScrollView style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Night Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>{totalRewards}</Text>
              <Text style={styles.statLabel}>Total Rewards</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statEmoji}>⏱️</Text>
              <Text style={styles.statValue}>{completionTime || '--'}</Text>
              <Text style={styles.statLabel}>Tonight's Time</Text>
            </View>
          </View>

          {childTonight?.allComplete && (
            <View style={styles.tonightBanner}>
              <Text style={styles.tonightIcon}>{childTonight.rewardIcon}</Text>
              <View style={styles.tonightInfo}>
                <Text style={styles.tonightLabel}>Tonight's Reward</Text>
                <Text style={styles.tonightReward}>{childTonight.rewardWon}</Text>
              </View>
            </View>
          )}

          {Object.keys(rewardCounts).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rewards Earned</Text>
              {Object.entries(rewardCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([title, { count, icon }]) => (
                  <View key={title} style={styles.rewardRow}>
                    <Text style={styles.rewardIcon}>{icon}</Text>
                    <Text style={styles.rewardTitle}>{title}</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.rewardCount}>{count}</Text>
                    </View>
                  </View>
                ))}
            </View>
          )}

          {childHistory.length === 0 && !childTonight?.allComplete && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>🌙</Text>
              <Text style={styles.emptyText}>
                No bedtime history yet for {child.name}
              </Text>
              <Text style={styles.emptyHint}>
                Complete a checklist to see stats here
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const uniqueDates = [...new Set(dates)].sort().reverse();
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(today);
    expected.setDate(expected.getDate() - i);
    const expectedKey = expected.toISOString().split('T')[0];
    if (uniqueDates[i] === expectedKey) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    marginLeft: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  tab: {
    marginRight: spacing.sm,
  },
  content: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    ...rounded('xl'),
    padding: spacing.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statEmoji: {
    fontSize: 36,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xxl,
    fontWeight: '800',
    color: colors.accent,
  },
  statLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  tonightBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...rounded('xl'),
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  tonightIcon: {
    fontSize: 56,
    marginRight: spacing.lg,
  },
  tonightInfo: {
    flex: 1,
  },
  tonightLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tonightReward: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.success,
    marginTop: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...rounded('lg'),
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rewardIcon: {
    fontSize: 44,
    marginRight: spacing.md,
  },
  rewardTitle: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  countBadge: {
    backgroundColor: colors.accentDim,
    ...rounded('round'),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    minWidth: 52,
    alignItems: 'center',
  },
  rewardCount: {
    fontSize: fontSize.xs,
    fontWeight: '800',
    color: colors.accent,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyEmoji: {
    fontSize: 100,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptyHint: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
