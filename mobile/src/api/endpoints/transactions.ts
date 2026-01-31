import apiClient, { apiCall } from '../client';
import {
  Transaction,
  CreateTransactionRequest,
  CalculateCartRequest,
  CartCalculationResult,
  TransactionListParams,
  PaginatedResponse,
} from '../types';

/**
 * Transaction API Endpoints
 * See MOBILE_DEV_GUIDE.md Section 6
 */

/**
 * Get transactions list
 * GET /api/v1/transactions
 */
export async function getTransactions(
  params?: TransactionListParams,
): Promise<PaginatedResponse<Transaction>> {
  const response = await apiClient.get<PaginatedResponse<Transaction>>(
    '/transactions',
    {
      params,
    },
  );
  return response.data;
}

/**
 * Get transaction details
 * GET /api/v1/transactions/:id
 */
export async function getTransaction(id: string): Promise<Transaction> {
  return apiCall<Transaction>('get', `/transactions/${id}`);
}

/**
 * Create new transaction (Checkout)
 * POST /api/v1/transactions
 */
export async function createTransaction(
  data: CreateTransactionRequest,
): Promise<Transaction> {
  return apiCall<Transaction>('post', '/transactions', data);
}

/**
 * Calculate cart totals and check stock
 * POST /api/v1/transactions/calculate
 */
export async function calculateCart(
  data: CalculateCartRequest,
): Promise<CartCalculationResult> {
  return apiCall<CartCalculationResult>(
    'post',
    '/transactions/calculate',
    data,
  );
}

/**
 * Cancel transaction
 * POST /api/v1/transactions/:id/cancel
 */
export async function cancelTransaction(id: string): Promise<void> {
  await apiClient.post(`/transactions/${id}/cancel`);
}
