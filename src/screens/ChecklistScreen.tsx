import React, { useEffect, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, BackHandler } from 'react-native';
import { useFamilyContext } from '../context/FamilyContext';
import ChecklistItemRow from '../components/ChecklistItemRow';
import ProgressBar from '../components/ProgressBar';
import FocusableButton from '../components/FocusableButton';
import { colors, fontSize, spacing, commonStyles } from '../theme';

export default function ChecklistScreen() {
  const {
    nav,
    children,
    checklistItems,
    tonight,
    toggleItem,
    navigate,
    goBack,
    getChildProgress,
  } = useFamilyContext();

  const child = children.find((c) => c.id === nav.childId);
  const childTonight = nav.childId ? tonight[nav.childId] : undefined;
  const progress = nav.childId
    ? getChildProgress(nav.childId)
    : { completed: 0, total: 0 };

  const allDone =
    progress.completed >= progress.total && progress.total > 0;

  useEffect(() => {
    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      goBack();
      return true;
    });
    return () => handler.remove();
  }, [goBack]);

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
        <FocusableButton label="Go Back" onPress={goBack} />
      </View>
    );
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
        <View style={styles.childInfo}>
          <Text style={styles.avatar}>{child.avatar}</Text>
          <Text style={styles.childName}>{child.name}'s Bedtime</Text>
        </View>
        <View style={styles.progressWrapper}>
          <ProgressBar
            completed={progress.completed}
            total={progress.total}
          />
        </View>
      </View>

      {allDone && (
        <View style={styles.completeBanner}>
          <Text style={styles.completeText}>
            Amazing job, {child.name}! 🌟
          </Text>
          <Text style={styles.completeSubtext}>
            Spinning the reward wheel...
          </Text>
        </View>
      )}

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}>
        {checklistItems.map((item) => {
          const isChecked = childTonight?.items?.[item.id] ?? false;
          return (
            <ChecklistItemRow
              key={item.id}
              title={item.title}
              icon={item.icon}
              isChecked={isChecked}
              onToggle={() => handleToggle(item.id)}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: spacing.lg,
  },
  avatar: {
    fontSize: 40,
    marginRight: spacing.md,
  },
  childName: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  progressWrapper: {
    width: 200,
    marginLeft: spacing.lg,
  },
  completeBanner: {
    backgroundColor: colors.surfaceHighlight,
    borderRadius: 16,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  completeText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.success,
  },
  completeSubtext: {
    fontSize: fontSize.md,
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
