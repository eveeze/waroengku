export interface CashFlowCategory {
  id: string;
  name: string;
  type: 'income' | 'expense';
  description?: string;
}

export interface CashFlowEntry {
  id: string;
  category_id: string;
  category_name?: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  created_by: string;
  created_at: string;
}

export interface DrawerSession {
  id: string;
  opening_balance: number;
  closing_balance?: number;
  actual_balance?: number; // Calculated from cashflows
  opened_by: string;
  opened_at: string;
  closed_by?: string;
  closed_at?: string;
  status: 'open' | 'closed';
  notes?: string;
}

export interface OpenDrawerRequest {
  opening_balance: number;
  opened_by: string;
  notes?: string;
}

export interface CloseDrawerRequest {
  session_id: string;
  closing_balance: number;
  closed_by: string;
}

export interface RecordCashFlowRequest {
  category_id: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  created_by: string;
}

export interface GetCashFlowsParams {
  page?: number;
  per_page?: number;
  session_id?: string;
  category_id?: string;
  type?: 'income' | 'expense';
  date_from?: string;
}
