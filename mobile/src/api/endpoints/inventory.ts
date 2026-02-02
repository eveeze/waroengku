import apiClient, { apiCall } from '../client';
import {
  RestockRequest,
  StockAdjustmentRequest,
  InventoryReport,
  ProductMovement,
} from '../types';
import { LowStockProduct } from '../types/product';

/**
 * Inventory API Endpoints
 * See docs/inventory/README.md
 */

/**
 * Restock Product
 * POST /api/v1/inventory/restock
 */
export async function restockProduct(data: RestockRequest): Promise<void> {
  await apiClient.post('/inventory/restock', data);
}

/**
 * Adjust Stock (Opname)
 * POST /api/v1/inventory/adjust
 */
export async function adjustStock(data: StockAdjustmentRequest): Promise<void> {
  await apiClient.post('/inventory/adjust', data);
}

/**
 * Get Low Stock Products
 * GET /api/v1/inventory/low-stock
 */
export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  return apiCall<LowStockProduct[]>('get', '/inventory/low-stock');
}

/**
 * Get Inventory Report
 * GET /api/v1/inventory/report
 */
export async function getInventoryReport(): Promise<InventoryReport> {
  return apiCall<InventoryReport>('get', '/inventory/report');
}

/**
 * Get Restock List PDF
 * GET /api/v1/inventory/restock-list/pdf
 */
export async function getRestockListPdf(): Promise<Blob> {
  const response = await apiClient.get('/inventory/restock-list/pdf', {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Get Product Movements
 * GET /api/v1/inventory/{id}/movements
 */
export async function getProductMovements(
  productId: string,
): Promise<ProductMovement[]> {
  return apiCall<ProductMovement[]>('get', `/inventory/${productId}/movements`);
}
