export interface TransactionItem {
  product_id: string;
  quantity: number;
  discount_amount?: number;
  notes?: string;
  // Response fields
  product_name?: string;
  unit?: string;
  unit_price?: number;
  total_amount?: number;
  subtotal?: number; // Backend sends this for per-item total
  tier_name?: string;
}

export interface Transaction {
  id: string;
  invoice_number: string;
  customer_id?: string;
  customer?: {
    id: string;
    name: string;
  };
  // customer_name removed favor of customer object
  items: TransactionItem[];
  subtotal: number; // Added based on doc
  total_amount: number; // This is the FINAL amount after tax/discount
  discount_amount: number;
  tax_amount: number;
  // final_amount removed as doc uses total_amount
  payment_method: 'cash' | 'kasbon' | 'transfer' | 'qris';
  amount_paid: number;
  change_amount: number;
  status: 'pending' | 'completed' | 'cancelled' | 'refunded';
  notes?: string;
  cashier_name?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  items: {
    product_id: string;
    quantity: number;
    discount_amount?: number;
    notes?: string;
  }[];
  customer_id?: string;
  discount_amount?: number;
  tax_amount?: number;
  payment_method: 'cash' | 'kasbon' | 'transfer' | 'qris';
  amount_paid: number;
  notes?: string;
}

export interface CalculateCartRequest {
  items: {
    product_id: string;
    quantity: number;
  }[];
}

export interface CartCalculationResult {
  items: (TransactionItem & {
    is_available: boolean;
    available_qty: number;
  })[];
  subtotal: number;
  total_discount?: number;
}

export interface TransactionListParams {
  page?: number;
  per_page?: number;
  search?: string;
  customer_id?: string;
  status?: string;
  payment_method?: string;
  date_from?: string;
  date_to?: string;
}
