import { create } from 'zustand';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface RepairType {
  id: string;
  name: string;
  color: string;
  pricePolyester: number;
  priceEpoxy: number;
  category: 'dings' | 'fins' | 'options';
}

interface RepairTypesStore {
  repairTypes: RepairType[];
  loading: boolean;
  error: string | null;
  fetchRepairTypes: () => Promise<void>;
}

export const useRepairTypesStore = create<RepairTypesStore>((set) => ({
  repairTypes: [],
  loading: false,
  error: null,
  fetchRepairTypes: async () => {
    set({ loading: true, error: null });
    try {
      const querySnapshot = await getDocs(collection(db, 'repairTypes'));
      const repairTypes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as RepairType[];
      set({ repairTypes, loading: false });
    } catch (error) {
      set({ error: (error as Error).message, loading: false });
    }
  }
}));