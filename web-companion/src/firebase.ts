import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  remove,
  update,
  onValue,
  off,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const database = getDatabase(app);

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

export interface HistoryEntry {
  id: string;
  date: string;
  rewardTitle: string;
  rewardIcon: string;
  timestamp: number;
}

export async function verifyFamily(
  familyId: string,
  pin: string,
): Promise<{ valid: boolean; name: string }> {
  const snapshot = await get(ref(database, `families/${familyId}/info`));
  if (!snapshot.exists()) return { valid: false, name: '' };
  const info = snapshot.val();
  return { valid: info.pin === pin, name: info.name };
}

export function subscribe<T>(
  path: string,
  callback: (data: T | null) => void,
): () => void {
  const dbRef = ref(database, path);
  const handler = onValue(dbRef, (snap) => callback(snap.val()));
  return () => off(dbRef, 'value', handler);
}

export async function addItem(path: string, data: Record<string, unknown>): Promise<string> {
  const newRef = push(ref(database, path));
  await set(newRef, { ...data, id: newRef.key });
  return newRef.key!;
}

export async function updateItem(path: string, data: Record<string, unknown>): Promise<void> {
  await update(ref(database, path), data);
}

export async function removeItem(path: string): Promise<void> {
  await remove(ref(database, path));
}
