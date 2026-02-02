import apiClient, { apiCall } from '../client';
import {
  SnapTokenRequest,
  SnapTokenResponse,
  ManualVerifyRequest,
  PaymentStatus,
} from '../types';

/**
 * Payments API Endpoints
 * See docs/payments/README.md
 */

/**
 * Generate Snap Token for Midtrans
 * POST /api/v1/payments/snap
 */
export async function generateSnapToken(
  data: SnapTokenRequest,
): Promise<SnapTokenResponse> {
  const response = await apiClient.post('/payments/snap', data);
  return response.data.data;
}

/**
 * Manual Verify Payment (Admin only)
 * POST /api/v1/payments/{id}/manual-verify
 */
export async function manualVerifyPayment(
  id: string,
  data: ManualVerifyRequest,
): Promise<void> {
  await apiClient.post(`/payments/${id}/manual-verify`, data);
}

/**
 * Get Payment Status by Transaction ID
 * GET /api/v1/payments/transaction/{id}
 */
export async function getPaymentByTransaction(
  id: string,
): Promise<PaymentStatus> {
  return apiCall<PaymentStatus>('get', `/payments/transaction/${id}`);
}
