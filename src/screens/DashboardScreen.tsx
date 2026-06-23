import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { TVFocusGuideView } from '@amazon-devices/react-native-kepler';
import { useFamilyContext } from '../context/FamilyContext';
import FocusableButton from '../components/FocusableButton';
import { colors, fontSize, spacing, borderRadius, commonStyles } from '../theme';

export default function DashboardScreen() {
  const { children, history, goBack } = useFamilyContext();
  const [selectedChild, setSelectedChild] = useState(0);

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

      <TVFocusGuideView style={styles.tabs}>
        {children.map((c, idx) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setSelectedChild(idx)}
            activeOpacity={0.8}
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
          </TouchableOpacity>
        ))}
      </TVFocusGuideView>

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

          {childHistory.length === 0 && (
            <View style={[commonStyles.center, { paddingVertical: spacing.xxxl }]}>
              <Text style={{ fontSize: 120 }}>🌙</Text>
              <Text style={styles.emptyText}>
                No bedtime history yet for {child.name}
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
    borderWidth: 4,
    borderColor: 'transparent',
  },
  tabActive: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.surfaceLight,
  },
  tabAvatar: {
    fontSize: 56,
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
    fontSize: 56,
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
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});
