/**
 * Customer Types
 * Based on MOBILE_DEV_GUIDE.md Section 4
 */

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  credit_limit: number;
  current_balance: number;  // Current debt
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CustomerListParams {
  page?: number;
  per_page?: number;
  search?: string;
  has_debt?: boolean;
}

export interface CreateCustomerRequest {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
  credit_limit?: number;
}

export interface UpdateCustomerRequest {
  name?: string;
  phone?: string;
  address?: string;
  notes?: string;
  credit_limit?: number;
  is_active?: boolean;
}

// Customer with debt info
export interface CustomerWithDebt extends Customer {
  total_debt: number;
  last_transaction_date?: string;
}
