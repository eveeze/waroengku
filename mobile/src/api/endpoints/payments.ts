import apiClient, { apiCall } from '../client';
import {
  QrisChargeRequest,
  QrisChargeResponse,
  QrisPaymentStatus,
  ManualVerifyRequest,
  PaymentStatus,
} from '../types';

/**
 * Payments API Endpoints
 * See docs/payments/README.md
 */

/**
 * Generate QRIS QR Code (Midtrans Core API)
 * POST /api/v1/payments/qris/charge
 */
export async function chargeQris(
  data: QrisChargeRequest,
): Promise<QrisChargeResponse> {
  return apiCall<QrisChargeResponse>('post', '/payments/qris/charge', data);
}

/**
 * Get QRIS Payment Status (for polling)
 * GET /api/v1/payments/{payment_id}/status
 */
export async function getQrisPaymentStatus(
  paymentId: string,
): Promise<QrisPaymentStatus> {
  return apiCall<QrisPaymentStatus>('get', `/payments/status/${paymentId}`);
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
