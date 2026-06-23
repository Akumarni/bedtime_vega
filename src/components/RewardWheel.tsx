import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../theme';
import { RewardItem } from '../types';

const ITEM_HEIGHT = 160;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPIN_CYCLES = 6;

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
    const totalCycles = SPIN_CYCLES + 2;
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

    const centerOffset = Math.floor(VISIBLE_ITEMS / 2);
    const targetIndex = SPIN_CYCLES * rewards.length + winner;
    const targetY = (targetIndex - centerOffset) * ITEM_HEIGHT;

    const steps = 60;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      const y = eased * targetY;

      scrollRef.current?.scrollTo({ y, animated: false });

      if (step >= steps) {
        clearInterval(timer);
        setHasLanded(true);
        setTimeout(() => {
          onCompleteRef.current(rewards[winner]);
        }, 1500);
      }
    }, 75);

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
        <View style={styles.centerHighlight} />

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
    width: 800,
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: colors.border,
    position: 'relative',
  },
  scrollContainer: {
    flex: 1,
  },
  centerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.surfaceHighlight,
    borderTopWidth: 4,
    borderBottomWidth: 4,
    borderColor: colors.accent,
    zIndex: 1,
  },
  rewardRow: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  rewardRowWinner: {
    backgroundColor: 'rgba(232, 184, 109, 0.15)',
  },
  rewardIcon: {
    fontSize: 72,
    marginRight: spacing.xl,
  },
  rewardTitle: {
    flex: 1,
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  rewardTitleWinner: {
    color: colors.accent,
    fontWeight: '800',
  },
  starBurst: {
    fontSize: 64,
    marginLeft: spacing.md,
  },
  winnerBanner: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    borderWidth: 4,
    borderColor: colors.accent,
  },
  winnerEmoji: {
    fontSize: 96,
    marginRight: spacing.xl,
  },
  winnerText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.accent,
  },
});
