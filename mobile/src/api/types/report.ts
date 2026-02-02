/**
 * Report Types
 * Based on MOBILE_DEV_GUIDE.md Dashboard & Reports
 */

// Dashboard summary data
export interface DashboardData {
  today: {
    date: string;
    total_sales: number;
    total_transactions: number;
    estimated_profit: number;
  };
  total_outstanding_kasbon: number;
  low_stock_count: number;
  out_of_stock_count: number;
}

// Legacy dashboard (for backwards compatibility)
export interface LegacyDashboardData {
  today_sales: number;
  today_transactions: number;
  today_profit: number;
  outstanding_kasbon: number;
  low_stock_count: number;
}

// Daily report query params
export interface DailyReportParams {
  date?: string; // YYYY-MM-DD format
}

// Daily report response
export interface DailyReportData {
  date: string;
  total_sales: number;
  total_transactions: number;
  estimated_profit: number;
}

// Modern Daily report with top products
export interface DailyReportDetailData {
  summary: SalesSummary;
  top_products: TopSellingProduct[];
  hourly_sales: HourlySales[];
}

// Sales summary
export interface SalesSummary {
  date: string;
  total_sales: number;
  total_transactions: number;
  total_profit: number;
  average_transaction: number;
}

// Top selling product
export interface TopSellingProduct {
  product_id: string;
  product_name: string;
  total_quantity: number;
  total_sales: number;
}

// Hourly sales data
export interface HourlySales {
  hour: number;
  sales: number;
  transactions: number;
}

// Kasbon Report
export interface KasbonReportData {
  total_outstanding: number;
  total_customers: number;
  customers_with_debt: number;
  summaries: KasbonCustomerSummary[];
}

export interface KasbonCustomerSummary {
  customer_id: string;
  customer_name: string;
  phone?: string;
  total_debt: number;
  last_transaction_date: string;
}

// Inventory Report
export interface InventoryReportData {
  total_products: number;
  total_stock_value: number;
  low_stock_products: LowStockItem[];
  out_of_stock_products: OutOfStockItem[];
  stock_by_category: StockByCategory[];
}

export interface LowStockItem {
  id: string;
  name: string;
  current_stock: number;
  min_stock_alert: number;
  unit: string;
}

export interface OutOfStockItem {
  id: string;
  name: string;
  unit: string;
  last_sale_date?: string;
}

export interface StockByCategory {
  category_id: string;
  category_name: string;
  product_count: number;
  total_stock_value: number;
}

// Report date range params
export interface ReportDateRangeParams {
  start_date: string;
  end_date: string;
}

// Sales trend data
export interface SalesTrendData {
  date: string;
  sales: number;
  profit: number;
  transactions: number;
}
