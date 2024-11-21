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
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';

interface RepairStore {
  repairs: any[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  initializeRepairs: () => Promise<void>;
  addRepair: (repair: any) => Promise<void>;
  updateRepair: (id: string, repair: any) => Promise<void>;
  deleteRepair: (id: string) => Promise<void>;
}

export const useRepairStore = create<RepairStore>((set, get) => ({
  repairs: [],
  loading: false,
  error: null,
  unsubscribe: null,

  initializeRepairs: async () => {
    set({ loading: true, error: null });
    try {
      if (get().unsubscribe) {
        get().unsubscribe();
      }

      const q = query(collection(db, 'repairs'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const repairs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp 
            ? doc.data().createdAt.toDate().toISOString()
            : doc.data().createdAt,
          updatedAt: doc.data().updatedAt instanceof Timestamp 
            ? doc.data().updatedAt.toDate().toISOString()
            : doc.data().updatedAt
        }));
        set({ repairs, loading: false });
      }, (error) => {
        set({ error: error.message, loading: false });
      });

      set({ unsubscribe });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addRepair: async (repair) => {
    set({ loading: true, error: null });
    try {
      await addDoc(collection(db, 'repairs'), {
        ...repair,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateRepair: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const repairRef = doc(db, 'repairs', id);
      await updateDoc(repairRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteRepair: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'repairs', id));
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  }
}));