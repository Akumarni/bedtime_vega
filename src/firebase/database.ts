import {
  ref,
  set,
  get,
  push,
  remove,
  update,
  onValue,
  off,
  DatabaseReference,
} from 'firebase/database';
import { database } from './config';
import {
  Child,
  ChecklistItem,
  RewardItem,
  TonightProgress,
  RewardHistoryEntry,
  FamilyData,
} from '../types';

function familyRef(familyId: string, path: string): DatabaseReference {
  return ref(database, `families/${familyId}/${path}`);
}

function getTodayKey(): string {
  const now = new Date();
  const hour = now.getHours();
  // Treat before 4 AM as "yesterday" so late-night usage stays on the same day
  if (hour < 4) {
    now.setDate(now.getDate() - 1);
  }
  return now.toISOString().split('T')[0];
}

// --- Family Setup ---

export async function createFamily(
  familyId: string,
  name: string,
  pin: string,
): Promise<void> {
  await set(familyRef(familyId, 'info'), { name, pin });
}

export async function getFamilyInfo(
  familyId: string,
): Promise<{ name: string; pin: string } | null> {
  const snapshot = await get(familyRef(familyId, 'info'));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function updateFamilyPin(
  familyId: string,
  pin: string,
): Promise<void> {
  await update(familyRef(familyId, 'info'), { pin });
}

// --- Children ---

export async function addChild(
  familyId: string,
  child: Omit<Child, 'id'>,
): Promise<string> {
  const newRef = push(familyRef(familyId, 'children'));
  const id = newRef.key!;
  await set(newRef, { ...child, id });
  return id;
}

export async function updateChild(
  familyId: string,
  childId: string,
  updates: Partial<Child>,
): Promise<void> {
  await update(familyRef(familyId, `children/${childId}`), updates);
}

export async function removeChild(
  familyId: string,
  childId: string,
): Promise<void> {
  await remove(familyRef(familyId, `children/${childId}`));
}

export function subscribeToChildren(
  familyId: string,
  callback: (children: Child[]) => void,
): () => void {
  const dbRef = familyRef(familyId, 'children');
  const handler = onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const children: Child[] = Object.values(data);
    children.sort((a, b) => a.order - b.order);
    callback(children);
  });
  return () => off(dbRef, 'value', handler);
}

// --- Checklist Items ---

export async function addChecklistItem(
  familyId: string,
  item: Omit<ChecklistItem, 'id'>,
): Promise<string> {
  const newRef = push(familyRef(familyId, 'checklistItems'));
  const id = newRef.key!;
  await set(newRef, { ...item, id });
  return id;
}

export async function updateChecklistItem(
  familyId: string,
  itemId: string,
  updates: Partial<ChecklistItem>,
): Promise<void> {
  await update(familyRef(familyId, `checklistItems/${itemId}`), updates);
}

export async function removeChecklistItem(
  familyId: string,
  itemId: string,
): Promise<void> {
  await remove(familyRef(familyId, `checklistItems/${itemId}`));
}

export function subscribeToChecklistItems(
  familyId: string,
  callback: (items: ChecklistItem[]) => void,
): () => void {
  const dbRef = familyRef(familyId, 'checklistItems');
  const handler = onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const items: ChecklistItem[] = Object.values(data);
    items.sort((a, b) => a.order - b.order);
    callback(items);
  });
  return () => off(dbRef, 'value', handler);
}

// --- Rewards ---

export async function addReward(
  familyId: string,
  reward: Omit<RewardItem, 'id'>,
): Promise<string> {
  const newRef = push(familyRef(familyId, 'rewards'));
  const id = newRef.key!;
  await set(newRef, { ...reward, id });
  return id;
}

export async function removeReward(
  familyId: string,
  rewardId: string,
): Promise<void> {
  await remove(familyRef(familyId, `rewards/${rewardId}`));
}

export function subscribeToRewards(
  familyId: string,
  callback: (rewards: RewardItem[]) => void,
): () => void {
  const dbRef = familyRef(familyId, 'rewards');
  const handler = onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const rewards: RewardItem[] = Object.values(data);
    callback(rewards);
  });
  return () => off(dbRef, 'value', handler);
}

// --- Tonight's Progress ---

export async function toggleChecklistItemDone(
  familyId: string,
  childId: string,
  itemId: string,
  done: boolean,
): Promise<void> {
  const dateKey = getTodayKey();
  await set(
    ref(database, `tonight/${familyId}/${dateKey}/${childId}/items/${itemId}`),
    done,
  );
}

export async function markChildComplete(
  familyId: string,
  childId: string,
  rewardTitle: string,
  rewardIcon: string,
): Promise<void> {
  const dateKey = getTodayKey();
  const basePath = `tonight/${familyId}/${dateKey}/${childId}`;
  await update(ref(database, basePath), {
    allComplete: true,
    rewardWon: rewardTitle,
    rewardIcon,
    completedAt: Date.now(),
  });

  const historyRef = push(
    ref(database, `history/${familyId}/${childId}`),
  );
  await set(historyRef, {
    id: historyRef.key,
    date: dateKey,
    rewardTitle,
    rewardIcon,
    timestamp: Date.now(),
  });
}

export function subscribeToTonight(
  familyId: string,
  callback: (data: Record<string, TonightProgress>) => void,
): () => void {
  const dateKey = getTodayKey();
  const dbRef = ref(database, `tonight/${familyId}/${dateKey}`);
  const handler = onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    callback(data || {});
  });
  return () => off(dbRef, 'value', handler);
}

// --- Reward History ---

export function subscribeToHistory(
  familyId: string,
  childId: string,
  callback: (entries: RewardHistoryEntry[]) => void,
): () => void {
  const dbRef = ref(database, `history/${familyId}/${childId}`);
  const handler = onValue(dbRef, (snapshot) => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const entries: RewardHistoryEntry[] = Object.values(data);
    entries.sort((a, b) => b.timestamp - a.timestamp);
    callback(entries);
  });
  return () => off(dbRef, 'value', handler);
}

export async function getChildHistory(
  familyId: string,
  childId: string,
): Promise<RewardHistoryEntry[]> {
  const snapshot = await get(ref(database, `history/${familyId}/${childId}`));
  if (!snapshot.exists()) return [];
  const data = snapshot.val();
  const entries: RewardHistoryEntry[] = Object.values(data);
  entries.sort((a, b) => b.timestamp - a.timestamp);
  return entries;
}

// --- Seed defaults on first setup ---

export async function seedDefaults(
  familyId: string,
  checklistItems: { title: string; icon: string }[],
  rewards: { title: string; icon: string }[],
): Promise<void> {
  for (let i = 0; i < checklistItems.length; i++) {
    await addChecklistItem(familyId, { ...checklistItems[i], order: i });
  }
  for (const reward of rewards) {
    await addReward(familyId, reward);
  }
}
