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

interface CustomerStore {
  customers: any[];
  loading: boolean;
  error: string | null;
  unsubscribe: (() => void) | null;
  initializeCustomers: () => Promise<void>;
  addCustomer: (customer: any) => Promise<void>;
  updateCustomer: (id: string, customer: any) => Promise<void>;
  deleteCustomer: (id: string) => Promise<void>;
  checkEmailExists: (email: string) => Promise<boolean>;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  unsubscribe: null,

  initializeCustomers: async () => {
    set({ loading: true, error: null });
    try {
      if (get().unsubscribe) {
        get().unsubscribe();
      }

      const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const customers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt instanceof Timestamp 
            ? doc.data().createdAt.toDate().toISOString()
            : doc.data().createdAt,
          updatedAt: doc.data().updatedAt instanceof Timestamp 
            ? doc.data().updatedAt.toDate().toISOString()
            : doc.data().updatedAt
        }));
        set({ customers, loading: false });
      }, (error) => {
        set({ error: error.message, loading: false });
      });

      set({ unsubscribe });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  addCustomer: async (customer) => {
    set({ loading: true, error: null });
    try {
      await addDoc(collection(db, 'customers'), {
        ...customer,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateCustomer: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const customerRef = doc(db, 'customers', id);
      await updateDoc(customerRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteCustomer: async (id) => {
    set({ loading: true, error: null });
    try {
      await deleteDoc(doc(db, 'customers', id));
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  checkEmailExists: async (email: string) => {
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return false;
      }

      const q = query(collection(db, 'customers'), orderBy('email'));
      const snapshot = await getDocs(q);
      return snapshot.docs.some(doc => doc.data().email === email);
    } catch (error) {
      console.error('Email check error:', error);
      return false;
    }
  }
}));