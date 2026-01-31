/**
 * Product Types
 * Updated with all fields from MOBILE_DEV_GUIDE.md
 */

// Pricing Tier for wholesale pricing
export interface PricingTier {
  id: string;
  product_id: string;
  name: string;
  min_quantity: number;
  max_quantity?: number;
  price: number;
  created_at: string;
  updated_at: string;
}

// Create pricing tier request
export interface CreatePricingTierRequest {
  name: string;
  min_quantity: number;
  max_quantity?: number;
  price: number;
}

// Update pricing tier request
export interface UpdatePricingTierRequest extends Partial<CreatePricingTierRequest> {}

// Full Product interface
export interface Product {
  id: string;
  name: string;
  barcode?: string;
  sku?: string;
  description?: string;
  category_id?: string;
  category_name?: string;
  unit: string;
  base_price: number;
  cost_price: number;
  is_stock_active: boolean;
  current_stock: number;
  min_stock_alert: number;
  max_stock?: number;
  is_refillable: boolean;
  is_active: boolean;
  image_url?: string;
  pricing_tiers?: PricingTier[];
  created_at: string;
  updated_at: string;
}

// Product list query params
export interface ProductListParams {
  page?: number;
  per_page?: number;
  search?: string;
  category_id?: string;
  barcode?: string;
  sort_by?: 'name' | 'base_price' | 'created_at';
  sort_order?: 'asc' | 'desc';
  low_stock?: boolean;
}

// Create product request (JSON for form-data)
export interface CreateProductRequest {
  name: string;
  barcode?: string;
  sku?: string;
  description?: string;
  category_id?: string;
  unit?: string;
  base_price: number;
  cost_price: number;
  is_stock_active?: boolean;
  current_stock?: number;
  min_stock_alert?: number;
  max_stock?: number;
  is_refillable?: boolean;
  pricing_tiers?: CreatePricingTierRequest[];
}

// Update product request
export interface UpdateProductRequest {
  name?: string;
  barcode?: string;
  sku?: string;
  description?: string;
  category_id?: string;
  unit?: string;
  base_price?: number;
  cost_price?: number;
  is_stock_active?: boolean;
  min_stock_alert?: number;
  max_stock?: number;
  is_refillable?: boolean;
  is_active?: boolean;
}

// Low stock product (with additional info)
export interface LowStockProduct extends Product {
  suggested_restock: number;
}
