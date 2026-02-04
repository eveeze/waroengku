export interface OpnameSession {
  id: string;
  session_number: string;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  created_by: string;
  created_at: string;
  completed_at?: string;
}

export interface CreateSessionRequest {
  notes?: string;
  created_by: string;
}

export interface RecordCountRequest {
  product_id: string;
  physical_stock: number;
  notes?: string;
  counted_by: string;
}

export interface OpnameVarianceItem {
  product_name: string;
  system_stock: number;
  physical_stock: number;
  variance: number;
  variance_value: number;
}

export interface VarianceReport {
  total_variance: number;
  total_loss_value: number;
  items: OpnameVarianceItem[];
}

export interface FinalizeSessionRequest {
  apply_adjustments: boolean;
  completed_by: string;
}

export interface ShoppingListItem {
  product_id: string;
  product_name: string;
  current_stock: number;
  min_stock: number;
  restock_quantity: number;
}

export interface NearExpiryItem {
  product_id: string;
  product_name: string;
  batch_number: string;
  expiry_date: string;
  days_remaining: number;
}

export interface GetOpnameSessionsParams {
  page?: number;
  per_page?: number;
  status?: 'draft' | 'in_progress' | 'completed' | 'cancelled';
}

export interface GetNearExpiryParams {
  days?: number;
}
