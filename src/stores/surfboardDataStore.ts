import { create } from 'zustand';
import { useCustomerStore } from './customerStore';
import { surfboardBrands, surfboardModels } from '../data/surfboardData';

interface SurfboardDataStore {
  getBrands: () => string[];
  getModels: (brand: string) => string[];
}

export const useSurfboardDataStore = create<SurfboardDataStore>(() => ({
  getBrands: () => {
    const { customers } = useCustomerStore.getState();
    const brandsFromCustomers = new Set<string>();
    
    // Get brands from existing customers
    customers.forEach(customer => {
      customer.surfboards.forEach(board => {
        if (board.brand) {
          brandsFromCustomers.add(board.brand);
        }
      });
    });
    
    // Combine with predefined brands
    const allBrands = new Set([...brandsFromCustomers, ...surfboardBrands]);
    return Array.from(allBrands).sort();
  },

  getModels: (brand: string) => {
    const { customers } = useCustomerStore.getState();
    const modelsFromCustomers = new Set<string>();
    
    // Get models from existing customers for the selected brand
    customers.forEach(customer => {
      customer.surfboards.forEach(board => {
        if (board.brand === brand && board.model) {
          modelsFromCustomers.add(board.model);
        }
      });
    });
    
    // Combine with predefined models for the brand
    const predefinedModels = surfboardModels[brand] || [];
    const allModels = new Set([...modelsFromCustomers, ...predefinedModels]);
    return Array.from(allModels).sort();
  }
}));