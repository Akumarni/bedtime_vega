import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../theme';
import { RewardItem } from '../types';

const ITEM_HEIGHT = 100;
const VISIBLE_ITEMS = 5;
const VIEWPORT_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const SPIN_CYCLES = 6;
const SPIN_DURATION = 4500;

interface Props {
  rewards: RewardItem[];
  onComplete: (reward: RewardItem) => void;
}

export default function RewardWheel({ rewards, onComplete }: Props) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;
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
        extended.push({
          ...rewards[i],
          key: `${cycle}-${i}`,
        });
      }
    }
    return extended;
  }, [rewards]);

  const spin = useCallback(() => {
    if (rewards.length === 0) return;

    const winner = Math.floor(Math.random() * rewards.length);
    setWinnerIndex(winner);
    setHasLanded(false);

    const centerOffset = Math.floor(VISIBLE_ITEMS / 2);
    const targetIndex = SPIN_CYCLES * rewards.length + winner;
    const targetY = (targetIndex - centerOffset) * ITEM_HEIGHT;

    scrollY.setValue(0);

    Animated.timing(scrollY, {
      toValue: targetY,
      duration: SPIN_DURATION,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      setHasLanded(true);
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();

      setTimeout(() => {
        onCompleteRef.current(rewards[winner]);
      }, 1500);
    });
  }, [rewards, scrollY, glowOpacity]);

  useEffect(() => {
    const timer = setTimeout(spin, 800);
    return () => clearTimeout(timer);
  }, [spin]);

  if (rewards.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No rewards configured</Text>
      </View>
    );
  }

  const translateY = Animated.multiply(scrollY, -1);

  return (
    <View style={styles.container}>
      <View style={styles.viewport}>
        <View style={styles.topFade} pointerEvents="none" />
        <View style={styles.bottomFade} pointerEvents="none" />

        <Animated.View style={styles.centerHighlight} />

        <Animated.View
          style={[
            styles.scrollContainer,
            { transform: [{ translateY }] },
          ]}>
          {extendedRewards.map((item, index) => {
            const isWinner =
              hasLanded &&
              index === SPIN_CYCLES * rewards.length + winnerIndex!;

            return (
              <Animated.View
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
                {isWinner && (
                  <Animated.Text
                    style={[styles.starBurst, { opacity: glowOpacity }]}>
                    ⭐
                  </Animated.Text>
                )}
              </Animated.View>
            );
          })}
        </Animated.View>
      </View>

      {hasLanded && winnerIndex !== null && (
        <Animated.View style={[styles.winnerBanner, { opacity: glowOpacity }]}>
          <Text style={styles.winnerEmoji}>{rewards[winnerIndex].icon}</Text>
          <Text style={styles.winnerText}>{rewards[winnerIndex].title}</Text>
        </Animated.View>
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
    width: 500,
    overflow: 'hidden',
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    position: 'relative',
  },
  scrollContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    zIndex: 2,
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
  },
  bottomFade: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT * 1.5,
    zIndex: 2,
    backgroundColor: 'transparent',
  },
  centerHighlight: {
    position: 'absolute',
    top: ITEM_HEIGHT * Math.floor(VISIBLE_ITEMS / 2),
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: colors.surfaceHighlight,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.accent,
    zIndex: 1,
  },
  rewardRow: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  rewardRowWinner: {
    backgroundColor: 'rgba(232, 184, 109, 0.15)',
  },
  rewardIcon: {
    fontSize: 40,
    marginRight: spacing.lg,
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
    fontSize: 36,
    marginLeft: spacing.md,
  },
  winnerBanner: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderWidth: 2,
    borderColor: colors.accent,
  },
  winnerEmoji: {
    fontSize: 48,
    marginRight: spacing.lg,
  },
  winnerText: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.accent,
  },
});
