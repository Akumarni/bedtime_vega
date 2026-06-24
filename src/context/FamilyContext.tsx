import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import {
  Child,
  ChecklistItem,
  RewardItem,
  TonightProgress,
  RewardHistoryEntry,
  NavigationState,
  Screen,
} from '../types';
import {
  getLastFamilyId,
  saveLastFamilyId,
  createFamily,
  getFamilyInfo,
  subscribeToChildren,
  subscribeToChecklistItems,
  subscribeToRewards,
  subscribeToTonight,
  subscribeToHistory,
  toggleChecklistItemDone,
  startChildTimer,
  resetChildTonight,
  markChildComplete,
  addChild,
  updateChild,
  removeChild,
  addChecklistItem,
  updateChecklistItem,
  removeChecklistItem,
  addReward,
  removeReward,
  updateFamilyPin,
  seedDefaultsForChild,
  seedRewardsForChild,
} from '../firebase/database';
import { defaultChecklistItems, defaultRewards } from '../theme';


function generateFamilyId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface FamilyContextValue {
  familyId: string | null;
  familyName: string;
  familyPin: string;
  isLoading: boolean;
  isSetupComplete: boolean;

  children: Child[];
  checklistItems: Record<string, ChecklistItem[]>;
  rewards: Record<string, RewardItem[]>;
  tonight: Record<string, TonightProgress>;
  history: Record<string, RewardHistoryEntry[]>;

  nav: NavigationState;
  navigate: (screen: Screen, childId?: string | null) => void;
  goBack: () => void;

  toggleItem: (childId: string, itemId: string, done: boolean) => Promise<void>;
  startTimer: (childId: string) => Promise<void>;
  resetTonight: (childId: string) => Promise<void>;
  completeChild: (
    childId: string,
    rewardTitle: string,
    rewardIcon: string,
  ) => Promise<void>;

  addNewChild: (name: string, avatar: string) => Promise<void>;
  editChild: (childId: string, name: string, avatar: string) => Promise<void>;
  updateChildTimer: (childId: string, minutes: number) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;

  addNewChecklistItem: (childId: string, title: string, icon: string) => Promise<void>;
  editChecklistItem: (
    childId: string,
    itemId: string,
    title: string,
    icon: string,
  ) => Promise<void>;
  deleteChecklistItem: (childId: string, itemId: string) => Promise<void>;
  getChecklistForChild: (childId: string) => ChecklistItem[];

  addNewReward: (childId: string, title: string, icon: string) => Promise<void>;
  deleteReward: (childId: string, rewardId: string) => Promise<void>;
  getRewardsForChild: (childId: string) => RewardItem[];

  changePin: (pin: string) => Promise<void>;
  setupFamily: (name: string, pin: string, childNames: string[]) => Promise<void>;

  getChildProgress: (childId: string) => {
    completed: number;
    total: number;
  };
}

const FamilyContext = createContext<FamilyContextValue | null>(null);

export function useFamilyContext(): FamilyContextValue {
  const ctx = useContext(FamilyContext);
  if (!ctx) throw new Error('useFamilyContext must be inside FamilyProvider');
  return ctx;
}

export function FamilyProvider({ children: reactChildren }: { children: ReactNode }) {
  const [familyId, setFamilyId] = useState<string | null>(null);
  const [familyName, setFamilyName] = useState('');
  const [familyPin, setFamilyPin] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [checklistItems, setChecklistItems] = useState<Record<string, ChecklistItem[]>>({});
  const [rewards, setRewards] = useState<Record<string, RewardItem[]>>({});
  const [tonight, setTonight] = useState<Record<string, TonightProgress>>({});
  const [history, setHistory] = useState<Record<string, RewardHistoryEntry[]>>(
    {},
  );

  const [nav, setNav] = useState<NavigationState>({
    screen: 'home',
    childId: null,
  });

  useEffect(() => {
    (async () => {
      const storedId = await getLastFamilyId();
      if (storedId) {
        const info = await getFamilyInfo(storedId);
        if (info) {
          setFamilyId(storedId);
          setFamilyName(info.name);
          setFamilyPin(info.pin);
          setIsSetupComplete(true);
        }
      }
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!familyId) return;

    const unsubs = [
      subscribeToChildren(familyId, setChildrenList),
      subscribeToTonight(familyId, setTonight),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [familyId]);

  useEffect(() => {
    if (!familyId || childrenList.length === 0) return;

    const unsubs = childrenList.flatMap((child) => [
      subscribeToChecklistItems(familyId, child.id, (items) => {
        setChecklistItems((prev) => ({ ...prev, [child.id]: items }));
      }),
      subscribeToRewards(familyId, child.id, (childRewards) => {
        setRewards((prev) => ({ ...prev, [child.id]: childRewards }));
      }),
    ]);

    return () => unsubs.forEach((fn) => fn());
  }, [familyId, childrenList]);

  useEffect(() => {
    if (!familyId || childrenList.length === 0) return;

    const unsubs = childrenList.map((child) =>
      subscribeToHistory(familyId, child.id, (entries) => {
        setHistory((prev) => ({ ...prev, [child.id]: entries }));
      }),
    );

    return () => unsubs.forEach((fn) => fn());
  }, [familyId, childrenList]);

  const navigate = useCallback(
    (screen: Screen, childId: string | null = null) => {
      setNav({ screen, childId });
    },
    [],
  );

  const goBack = useCallback(() => {
    setNav((prev) => {
      if (prev.screen === 'checklist' || prev.screen === 'dashboard') {
        return { screen: 'home', childId: null };
      }
      if (prev.screen === 'reward') {
        return { screen: 'home', childId: null };
      }
      if (
        prev.screen === 'settings-children' ||
        prev.screen === 'settings-checklist' ||
        prev.screen === 'settings-rewards'
      ) {
        return { screen: 'settings', childId: null };
      }
      if (prev.screen === 'settings' || prev.screen === 'settings-pin') {
        return { screen: 'home', childId: null };
      }
      return { screen: 'home', childId: null };
    });
  }, []);

  const toggleItem = useCallback(
    async (childId: string, itemId: string, done: boolean) => {
      if (!familyId) return;
      await toggleChecklistItemDone(familyId, childId, itemId, done);
    },
    [familyId],
  );

  const startTimer = useCallback(
    async (childId: string) => {
      if (!familyId) return;
      await startChildTimer(familyId, childId);
    },
    [familyId],
  );

  const resetTonight = useCallback(
    async (childId: string) => {
      if (!familyId) return;
      await resetChildTonight(familyId, childId);
    },
    [familyId],
  );

  const completeChild = useCallback(
    async (childId: string, rewardTitle: string, rewardIcon: string) => {
      if (!familyId) return;
      await markChildComplete(familyId, childId, rewardTitle, rewardIcon);
    },
    [familyId],
  );

  const addNewChild = useCallback(
    async (name: string, avatar: string) => {
      if (!familyId) return;
      await addChild(familyId, { name, avatar, order: childrenList.length, timerMinutes: 15 });
    },
    [familyId, childrenList.length],
  );

  const editChild = useCallback(
    async (childId: string, name: string, avatar: string) => {
      if (!familyId) return;
      await updateChild(familyId, childId, { name, avatar });
    },
    [familyId],
  );

  const updateChildTimer = useCallback(
    async (childId: string, minutes: number) => {
      if (!familyId) return;
      await updateChild(familyId, childId, { timerMinutes: minutes });
    },
    [familyId],
  );

  const deleteChild = useCallback(
    async (childId: string) => {
      if (!familyId) return;
      await removeChild(familyId, childId);
    },
    [familyId],
  );

  const addNewChecklistItem = useCallback(
    async (childId: string, title: string, icon: string) => {
      if (!familyId) return;
      const childItems = checklistItems[childId] || [];
      await addChecklistItem(familyId, childId, {
        title,
        icon,
        order: childItems.length,
      });
    },
    [familyId, checklistItems],
  );

  const editChecklistItem = useCallback(
    async (childId: string, itemId: string, title: string, icon: string) => {
      if (!familyId) return;
      await updateChecklistItem(familyId, childId, itemId, { title, icon });
    },
    [familyId],
  );

  const deleteChecklistItem = useCallback(
    async (childId: string, itemId: string) => {
      if (!familyId) return;
      await removeChecklistItem(familyId, childId, itemId);
    },
    [familyId],
  );

  const getChecklistForChild = useCallback(
    (childId: string) => {
      return checklistItems[childId] || [];
    },
    [checklistItems],
  );

  const addNewReward = useCallback(
    async (childId: string, title: string, icon: string) => {
      if (!familyId) return;
      await addReward(familyId, childId, { title, icon });
    },
    [familyId],
  );

  const deleteReward = useCallback(
    async (childId: string, rewardId: string) => {
      if (!familyId) return;
      await removeReward(familyId, childId, rewardId);
    },
    [familyId],
  );

  const getRewardsForChild = useCallback(
    (childId: string) => {
      return rewards[childId] || [];
    },
    [rewards],
  );

  const changePin = useCallback(
    async (pin: string) => {
      if (!familyId) return;
      await updateFamilyPin(familyId, pin);
    },
    [familyId],
  );

  const setupFamily = useCallback(
    async (name: string, pin: string, childNames: string[]) => {
      const id = generateFamilyId();
      await createFamily(id, name, pin);

      const childIds: string[] = [];
      for (let i = 0; i < childNames.length; i++) {
        const avatars = ['🌙', '⭐', '🦉', '🐻'];
        const childId = await addChild(id, {
          name: childNames[i],
          avatar: avatars[i % avatars.length],
          order: i,
          timerMinutes: 15,
        });
        childIds.push(childId);
      }

      for (const childId of childIds) {
        await seedDefaultsForChild(id, childId, defaultChecklistItems);
        await seedRewardsForChild(id, childId, defaultRewards);
      }

      await saveLastFamilyId(id);
      setFamilyId(id);
      setFamilyName(name);
      setFamilyPin(pin);
      setIsSetupComplete(true);
    },
    [],
  );

  const getChildProgress = useCallback(
    (childId: string) => {
      const progress = tonight[childId];
      const childItems = checklistItems[childId] || [];
      const total = childItems.length;
      if (!progress?.items) return { completed: 0, total };
      const completed = Object.values(progress.items).filter(Boolean).length;
      return { completed, total };
    },
    [tonight, checklistItems],
  );

  return (
    <FamilyContext.Provider
      value={{
        familyId,
        familyName,
        familyPin,
        isLoading,
        isSetupComplete,
        children: childrenList,
        checklistItems,
        rewards,
        tonight,
        history,
        nav,
        navigate,
        goBack,
        toggleItem,
        startTimer,
        resetTonight,
        completeChild,
        addNewChild,
        editChild,
        updateChildTimer,
        deleteChild,
        addNewChecklistItem,
        editChecklistItem,
        deleteChecklistItem,
        getChecklistForChild,
        addNewReward,
        deleteReward,
        getRewardsForChild,
        changePin,
        setupFamily,
        getChildProgress,
      }}>
      {reactChildren}
    </FamilyContext.Provider>
  );
}
