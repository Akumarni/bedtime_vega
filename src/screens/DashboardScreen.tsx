import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  BackHandler,
  Pressable,
} from 'react-native';
import { useFamilyContext } from '../context/FamilyContext';
import FocusableButton from '../components/FocusableButton';
import { colors, fontSize, spacing, borderRadius, commonStyles } from '../theme';

export default function DashboardScreen() {
  const { children, history, goBack } = useFamilyContext();
  const [selectedChild, setSelectedChild] = useState(0);

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => handler.remove();
  }, [goBack]);

  const child = children[selectedChild];
  const childHistory = child ? history[child.id] || [] : [];

  const streak = computeStreak(childHistory.map((e) => e.date));
  const totalRewards = childHistory.length;

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
          label="← Back"
          variant="ghost"
          size="sm"
          onPress={goBack}
        />
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <View style={styles.tabs}>
        {children.map((c, idx) => (
          <Pressable
            key={c.id}
            onPress={() => setSelectedChild(idx)}
            style={[
              styles.tab,
              idx === selectedChild && styles.tabActive,
            ]}>
            <Text style={styles.tabAvatar}>{c.avatar}</Text>
            <Text
              style={[
                styles.tabName,
                idx === selectedChild && styles.tabNameActive,
              ]}>
              {c.name}
            </Text>
          </Pressable>
        ))}
      </View>

      {child && (
        <ScrollView style={styles.content}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Night Streak 🔥</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{totalRewards}</Text>
              <Text style={styles.statLabel}>Total Rewards ⭐</Text>
            </View>
          </View>

          {Object.keys(rewardCounts).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Rewards Earned</Text>
              {Object.entries(rewardCounts)
                .sort((a, b) => b[1].count - a[1].count)
                .map(([title, { count, icon }]) => (
                  <View key={title} style={styles.rewardRow}>
                    <Text style={styles.rewardIcon}>{icon}</Text>
                    <Text style={styles.rewardTitle}>{title}</Text>
                    <Text style={styles.rewardCount}>×{count}</Text>
                  </View>
                ))}
            </View>
          )}

          {childHistory.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Nights</Text>
              {childHistory.slice(0, 14).map((entry) => (
                <View key={entry.id} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{formatDate(entry.date)}</Text>
                  <Text style={styles.historyReward}>
                    {entry.rewardIcon} {entry.rewardTitle}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {childHistory.length === 0 && (
            <View style={[commonStyles.center, { paddingVertical: spacing.xxxl }]}>
              <Text style={{ fontSize: 64 }}>🌙</Text>
              <Text style={styles.emptyText}>
                No bedtime history yet for {child.name}
              </Text>
              <Text style={styles.emptySubtext}>
                Complete tonight's checklist to get started!
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

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const diff = Math.round(
    (today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff === 0) return 'Tonight';
  if (diff === 1) return 'Last night';
  if (diff < 7)
    return date.toLocaleDateString('en-US', { weekday: 'long' });
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
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
    marginLeft: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.surfaceLight,
  },
  tabAvatar: {
    fontSize: 28,
    marginRight: spacing.sm,
  },
  tabName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabNameActive: {
    color: colors.textPrimary,
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
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.hero,
    fontWeight: '800',
    color: colors.accent,
  },
  statLabel: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rewardIcon: {
    fontSize: 28,
    marginRight: spacing.md,
  },
  rewardTitle: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textPrimary,
  },
  rewardCount: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.accent,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  historyDate: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    width: 120,
  },
  historyReward: {
    fontSize: fontSize.md,
    color: colors.textPrimary,
    flex: 1,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});
