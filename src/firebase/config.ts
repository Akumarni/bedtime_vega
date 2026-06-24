import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyD0w6AIvhgRsIH8_Rt4o8C050Bfjd9LHSU',
  authDomain: 'bedtime-checklist-2ee83.firebaseapp.com',
  databaseURL: 'https://bedtime-checklist-2ee83-default-rtdb.firebaseio.com',
  projectId: 'bedtime-checklist-2ee83',
  storageBucket: 'bedtime-checklist-2ee83.firebasestorage.app',
  messagingSenderId: '634048053287',
  appId: '1:634048053287:web:f01ff08edd2f81dbe54e02',
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const database = getDatabase(app);
export default app;
