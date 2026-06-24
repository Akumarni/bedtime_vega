import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, fontSize, spacing, rounded } from '../theme';
import { RewardItem } from '../types';

const ITEM_HEIGHT = 110;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPIN_CYCLES = 4;
const CENTER_SLOT = Math.floor(VISIBLE_ITEMS / 2);

interface Props {
  rewards: RewardItem[];
  onComplete: (reward: RewardItem) => void;
}

export default function RewardWheel({ rewards, onComplete }: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [hasLanded, setHasLanded] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const extendedRewards = React.useMemo(() => {
    if (rewards.length === 0) return [];
    const totalCycles = SPIN_CYCLES + 3;
    const extended: (RewardItem & { key: string })[] = [];
    for (let cycle = 0; cycle < totalCycles; cycle++) {
      for (let i = 0; i < rewards.length; i++) {
        extended.push({ ...rewards[i], key: `${cycle}-${i}` });
      }
    }
    return extended;
  }, [rewards]);

  useEffect(() => {
    if (rewards.length === 0) return;

    const winner = Math.floor(Math.random() * rewards.length);
    setWinnerIndex(winner);

    const targetIndex = SPIN_CYCLES * rewards.length + winner;
    const targetY = (targetIndex - CENTER_SLOT) * ITEM_HEIGHT;

    const totalSteps = 80;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / totalSteps;
      const eased = 1 - Math.pow(1 - progress, 4);
      const y = eased * targetY;

      scrollRef.current?.scrollTo({ y, animated: false });

      if (step >= totalSteps) {
        clearInterval(timer);
        scrollRef.current?.scrollTo({ y: targetY, animated: false });
        setHasLanded(true);
        setTimeout(() => {
          onCompleteRef.current(rewards[winner]);
        }, 2000);
      }
    }, 60);

    return () => clearInterval(timer);
  }, [rewards]);

  if (rewards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No rewards configured</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollContainer}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}>
          {extendedRewards.map((item, index) => {
            const isWinner =
              hasLanded &&
              index === SPIN_CYCLES * rewards.length + winnerIndex!;

            return (
              <View
                key={item.key}
                style={[
                  styles.rewardRow,
                  isWinner && styles.rewardRowWinner,
                ]}>
                <Text style={styles.rewardIcon}>{item.icon}</Text>
                <Text
                  style={[
                    styles.rewardTitle,
                    isWinner && styles.rewardTitleWinner,
                  ]}>
                  {item.title}
                </Text>
                {isWinner && <Text style={styles.starBurst}>⭐</Text>}
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.glowFar} pointerEvents="none" />
        <View style={styles.glowMid} pointerEvents="none" />
        <View style={styles.glassFrame} pointerEvents="none" />
      </View>

      {hasLanded && winnerIndex !== null && (
        <View style={styles.winnerBanner}>
          <Text style={styles.winnerEmoji}>{rewards[winnerIndex].icon}</Text>
          <Text style={styles.winnerText}>{rewards[winnerIndex].title}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: fontSize.lg,
    color: colors.textMuted,
  },
  viewport: {
    height: VIEWPORT_HEIGHT,
    width: 700,
    overflow: 'hidden',
    ...rounded('xl'),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scrollContainer: {
    flex: 1,
  },
  glowFar: {
    position: 'absolute',
    top: CENTER_SLOT * ITEM_HEIGHT - 10,
    left: -1,
    right: -1,
    height: ITEM_HEIGHT + 20,
    backgroundColor: 'transparent',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderColor: '#2E2510',
    zIndex: 2,
  },
  glowMid: {
    position: 'absolute',
    top: CENTER_SLOT * ITEM_HEIGHT - 5,
    left: -1,
    right: -1,
    height: ITEM_HEIGHT + 10,
    backgroundColor: 'transparent',
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#6B5525',
    zIndex: 2,
  },
  glassFrame: {
    position: 'absolute',
    top: CENTER_SLOT * ITEM_HEIGHT,
    left: -1,
    right: -1,
    height: ITEM_HEIGHT,
    backgroundColor: 'transparent',
    borderTopWidth: 3,
    borderBottomWidth: 3,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderColor: colors.accent,
    zIndex: 2,
  },
  rewardRow: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  rewardRowWinner: {
    backgroundColor: colors.surfaceHighlight,
  },
  rewardIcon: {
    fontSize: 48,
    marginRight: spacing.lg,
  },
  rewardTitle: {
    flex: 1,
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rewardTitleWinner: {
    color: colors.accent,
    fontWeight: '800',
  },
  starBurst: {
    fontSize: 44,
    marginLeft: spacing.md,
  },
  winnerBanner: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    ...rounded('xl'),
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  winnerEmoji: {
    fontSize: 64,
    marginRight: spacing.lg,
  },
  winnerText: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.accent,
  },
});
