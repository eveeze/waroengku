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
}
