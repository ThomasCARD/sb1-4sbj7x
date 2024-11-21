import { create } from 'zustand';
import { 
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface SettingsStore {
  settings: any[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  initializeSettings: () => Promise<void>;
  addSetting: (setting: any) => Promise<void>;
  updateSetting: (id: string, setting: any) => Promise<void>;
  deleteSetting: (id: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: [],
  loading: false,
  error: null,
  unsubscribe: null,

  initializeSettings: async () => {
    set({ loading: true, error: null });
    try {
      if (get().unsubscribe) {
        get().unsubscribe();
      }

      const q = query(collection(db, 'settings'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const settings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        set({ settings, loading: false });
      }, (error) => {
        set({ error: error.message, loading: false });
      });

      set({ unsubscribe });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addSetting: async (setting) => {
    set({ loading: true, error: null });
    try {
      await addDoc(collection(db, 'settings'), {
        ...setting,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateSetting: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const settingRef = doc(db, 'settings', id);
      await updateDoc(settingRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteSetting: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'settings', id));
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));