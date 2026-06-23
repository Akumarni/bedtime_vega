import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  createFamily,
  getFamilyInfo,
  subscribeToChildren,
  subscribeToChecklistItems,
  subscribeToRewards,
  subscribeToTonight,
  subscribeToHistory,
  toggleChecklistItemDone,
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
  seedDefaults,
} from '../firebase/database';
import { defaultChecklistItems, defaultRewards } from '../theme';

const FAMILY_ID_KEY = '@bedtime_family_id';

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
  isLoading: boolean;
  isSetupComplete: boolean;

  children: Child[];
  checklistItems: ChecklistItem[];
  rewards: RewardItem[];
  tonight: Record<string, TonightProgress>;
  history: Record<string, RewardHistoryEntry[]>;

  nav: NavigationState;
  navigate: (screen: Screen, childId?: string | null) => void;
  goBack: () => void;

  toggleItem: (childId: string, itemId: string, done: boolean) => Promise<void>;
  completeChild: (
    childId: string,
    rewardTitle: string,
    rewardIcon: string,
  ) => Promise<void>;

  addNewChild: (name: string, avatar: string) => Promise<void>;
  editChild: (childId: string, name: string, avatar: string) => Promise<void>;
  deleteChild: (childId: string) => Promise<void>;

  addNewChecklistItem: (title: string, icon: string) => Promise<void>;
  editChecklistItem: (
    itemId: string,
    title: string,
    icon: string,
  ) => Promise<void>;
  deleteChecklistItem: (itemId: string) => Promise<void>;

  addNewReward: (title: string, icon: string) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;

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
  const [isLoading, setIsLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
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
      const storedId = await AsyncStorage.getItem(FAMILY_ID_KEY);
      if (storedId) {
        const info = await getFamilyInfo(storedId);
        if (info) {
          setFamilyId(storedId);
          setFamilyName(info.name);
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
      subscribeToChecklistItems(familyId, setChecklistItems),
      subscribeToRewards(familyId, setRewards),
      subscribeToTonight(familyId, setTonight),
    ];

    return () => unsubs.forEach((fn) => fn());
  }, [familyId]);

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
      if (prev.screen === 'settings') {
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
      await addChild(familyId, { name, avatar, order: childrenList.length });
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

  const deleteChild = useCallback(
    async (childId: string) => {
      if (!familyId) return;
      await removeChild(familyId, childId);
    },
    [familyId],
  );

  const addNewChecklistItem = useCallback(
    async (title: string, icon: string) => {
      if (!familyId) return;
      await addChecklistItem(familyId, {
        title,
        icon,
        order: checklistItems.length,
      });
    },
    [familyId, checklistItems.length],
  );

  const editChecklistItem = useCallback(
    async (itemId: string, title: string, icon: string) => {
      if (!familyId) return;
      await updateChecklistItem(familyId, itemId, { title, icon });
    },
    [familyId],
  );

  const deleteChecklistItem = useCallback(
    async (itemId: string) => {
      if (!familyId) return;
      await removeChecklistItem(familyId, itemId);
    },
    [familyId],
  );

  const addNewReward = useCallback(
    async (title: string, icon: string) => {
      if (!familyId) return;
      await addReward(familyId, { title, icon });
    },
    [familyId],
  );

  const deleteReward = useCallback(
    async (rewardId: string) => {
      if (!familyId) return;
      await removeReward(familyId, rewardId);
    },
    [familyId],
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

      for (let i = 0; i < childNames.length; i++) {
        const avatars = ['🌙', '⭐', '🦉', '🐻'];
        await addChild(id, {
          name: childNames[i],
          avatar: avatars[i % avatars.length],
          order: i,
        });
      }

      await seedDefaults(id, defaultChecklistItems, defaultRewards);

      await AsyncStorage.setItem(FAMILY_ID_KEY, id);
      setFamilyId(id);
      setFamilyName(name);
      setIsSetupComplete(true);
    },
    [],
  );

  const getChildProgress = useCallback(
    (childId: string) => {
      const progress = tonight[childId];
      const total = checklistItems.length;
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
        completeChild,
        addNewChild,
        editChild,
        deleteChild,
        addNewChecklistItem,
        editChecklistItem,
        deleteChecklistItem,
        addNewReward,
        deleteReward,
        changePin,
        setupFamily,
        getChildProgress,
      }}>
      {reactChildren}
    </FamilyContext.Provider>
  );
}
