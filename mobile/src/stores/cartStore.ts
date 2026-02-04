import { create } from 'zustand';
import { Product, Customer, CartCalculationResult } from '@/api/types';
import { calculateCart } from '@/api/endpoints';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  // Computed from server
  serverPrice?: number;
  tierName?: string;
  subtotal?: number;
}

interface CartState {
  items: CartItem[];
  customer: Customer | null;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  setItems: (items: CartItem[]) => void;
  clearCart: () => void;

  // Computed getters (helper)
  getTotal: () => number;
  getItemCount: () => number;

  // Server Validation
  validationResult: CartCalculationResult | null;
  isValidating: boolean;
  validateCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  customer: null,
  validationResult: null,
  isValidating: false,

  addItem: (product, quantity = 1) => {
    set((state) => {
      const existingItem = state.items.find((i) => i.product.id === product.id);

      if (existingItem) {
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i,
          ),
          validationResult: null, // Invalidate previous calculation
        };
      }

      return {
        items: [...state.items, { product, quantity }],
        validationResult: null,
      };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
      validationResult: null,
    }));
  },

  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId);
      return;
    }

    set((state) => ({
      items: state.items.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i,
      ),
      validationResult: null,
    }));
  },

  setCustomer: (customer) => set({ customer }),

  clearCart: () => set({ items: [], customer: null, validationResult: null }),

  setItems: (items) => set({ items, validationResult: null }),

  getTotal: () => {
    const { items, validationResult } = get();
    // If we have server calculation, use it (handles tiers/discounts)
    if (validationResult) {
      return validationResult.subtotal;
    }
    // Fallback to local calculation with Pricing Tiers
    return items.reduce((sum, item) => {
      let price = item.product.base_price;
      const quantity = item.quantity;

      // Check for pricing tiers
      if (item.product.pricing_tiers && item.product.pricing_tiers.length > 0) {
        const applicableTier = item.product.pricing_tiers.find(
          (tier) =>
            quantity >= tier.min_quantity &&
            (!tier.max_quantity || quantity <= tier.max_quantity),
        );
        if (applicableTier) {
          price = applicableTier.price;
        }
      }

      return sum + price * quantity;
    }, 0);
  },

  getItemCount: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  validateCart: async () => {
    const { items } = get();
    if (items.length === 0) return;

    set({ isValidating: true });
    try {
      const result = await calculateCart({
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
      });

      set({ validationResult: result, isValidating: false });

      // Update items with server details
      set((state) => ({
        items: state.items.map((item) => {
          const serverItem = result.items.find(
            (si) => si.product_id === item.product.id,
          );
          if (serverItem) {
            return {
              ...item,
              serverPrice: serverItem.unit_price,
              tierName: serverItem.tier_name,
              subtotal: serverItem.total_amount,
            };
          }
          return item;
        }),
      }));
    } catch {
      set({ isValidating: false });
    }
  },
}));
