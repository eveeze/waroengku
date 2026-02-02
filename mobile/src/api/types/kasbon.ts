/**
 * Kasbon (Debt) Types
 * Based on MOBILE_DEV_GUIDE.md Section 5
 */

export interface KasbonEntry {
  id: string;
  customer_id: string;
  transaction_id?: string;
  type: 'debt' | 'payment';
  amount: number;
  notes?: string;
  created_by: string;
  created_at: string;
}

export interface KasbonSummary {
  customer_id: string;
  customer_name: string;
  total_debt: number;
  total_payment: number;
  current_balance: number;
  credit_limit: number;
  remaining_credit: number;
}

export interface KasbonListParams {
  page?: number;
  per_page?: number;
  type?: 'debt' | 'payment';
}

export interface RecordPaymentRequest {
  amount: number;
  notes?: string;
  created_by?: string;
  payment_method?: 'cash' | 'transfer';
}

// Alias for consistency with customers module
export type PayKasbonRequest = RecordPaymentRequest;

export interface KasbonHistory {
  id: string;
  transaction_id: string;
  amount: number;
  type: 'debt' | 'payment';
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
  created_by_name: string;
}
