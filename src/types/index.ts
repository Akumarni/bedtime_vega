export interface Child {
  id: string;
  name: string;
  avatar: string;
  order: number;
  timerMinutes: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  icon: string;
  order: number;
}

export interface RewardItem {
  id: string;
  title: string;
  icon: string;
}

export interface TonightProgress {
  items: Record<string, boolean>;
  allComplete: boolean;
  rewardWon: string | null;
  rewardIcon: string | null;
  completedAt: number | null;
  timerStartedAt: number | null;
}

export interface RewardHistoryEntry {
  id: string;
  date: string;
  rewardTitle: string;
  rewardIcon: string;
  timestamp: number;
}

export interface FamilyData {
  id: string;
  name: string;
  pin: string;
  children: Child[];
  checklistItems: Record<string, ChecklistItem[]>;
  rewards: RewardItem[];
}

export interface TonightData {
  [childId: string]: TonightProgress;
}

export type Screen =
  | 'home'
  | 'checklist'
  | 'reward'
  | 'dashboard'
  | 'settings-pin'
  | 'settings'
  | 'settings-children'
  | 'settings-checklist'
  | 'settings-rewards';

export interface NavigationState {
  screen: Screen;
  childId: string | null;
}
