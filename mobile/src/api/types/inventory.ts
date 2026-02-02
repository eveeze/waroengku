import { LowStockProduct } from './product';

export interface RestockRequest {
  product_id: string;
  quantity: number;
  cost_per_unit: number;
  supplier?: string;
  notes?: string;
}

export interface StockAdjustmentRequest {
  product_id: string;
  quantity: number; // Negative to reduce
  reason: string;
}

export interface InventoryReport {
  total_products: number;
  total_stock_value: number;
  low_stock_count: number;
  out_of_stock_count: number;
  low_stock_products: LowStockProduct[];
}

export interface ProductMovement {
  id: string;
  product_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  previous_stock: number;
  new_stock: number;
  reference_id?: string; // Transaction ID or Restock ID
  notes?: string;
  created_at: string;
  created_by?: string;
}
