import { create } from 'zustand';
import { Product } from '@/api/types';

interface ProductStore {
  // We don't necessarily need to store ALL products here if we use React Query / API hooks for fetching lists.
  // But for optimistic updates to work across screens, we might want a way to "cache" recent updates.
  // Or, we can just use this store to hold the *optimistic state* that overrides api data.
  // However, following the guide, we will try to maintain a list or at least update it.

  // In a real app with pagination, syncing this array with the paginated API response is tricky.
  // For now, we will use this store primarily to emit "events" or hold a small cache of updated products
  // that components can check against, OR we assume this store is populated.

  // NOTE: To make this effective without refactoring the entire ProductList to use this store for rendering,
  // we will treat this as a "Client Side Cache" for optimistic updates.
  // Components should prefer this store's data if available.

  products: Product[];
  setProducts: (products: Product[]) => void;
  optimisticUpdateStock: (productId: string, newStock: number) => void;
  rollbackStock: (productId: string, oldStock: number) => void;
}

export const useProductStore = create<ProductStore>((set) => ({
  products: [],

  setProducts: (products) => set({ products }),

  optimisticUpdateStock: (id, newStock) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, current_stock: newStock } : p,
      ),
    })),

  rollbackStock: (id, oldStock) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, current_stock: oldStock } : p,
      ),
    })),
}));
