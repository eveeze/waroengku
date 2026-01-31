import apiClient, { apiCall } from '../client';
import {
  KasbonEntry,
  KasbonSummary,
  KasbonListParams,
  RecordPaymentRequest,
  PaginatedResponse,
} from '../types';

/**
 * Kasbon API Endpoints
 * Based on MOBILE_DEV_GUIDE.md Section 5 (4 endpoints)
 */

/**
 * Get kasbon history for a customer
 * GET /api/v1/kasbon/customers/{id}
 */
export async function getKasbonHistory(
  customerId: string,
  params?: KasbonListParams
): Promise<PaginatedResponse<KasbonEntry>> {
  const response = await apiClient.get<PaginatedResponse<KasbonEntry>>(
    `/kasbon/customers/${customerId}`,
    { params }
  );
  return response.data;
}

/**
 * Get kasbon summary for a customer
 * GET /api/v1/kasbon/customers/{id}/summary
 */
export async function getKasbonSummary(customerId: string): Promise<KasbonSummary> {
  return apiCall<KasbonSummary>('get', `/kasbon/customers/${customerId}/summary`);
}

/**
 * Download billing PDF
 * GET /api/v1/kasbon/customers/{id}/billing/pdf
 * Returns PDF file URL
 */
export async function downloadBillingPdf(customerId: string): Promise<Blob> {
  const response = await apiClient.get(
    `/kasbon/customers/${customerId}/billing/pdf`,
    { responseType: 'blob' }
  );
  return response.data;
}

/**
 * Record a kasbon payment
 * POST /api/v1/kasbon/customers/{id}/payments
 */
export async function recordKasbonPayment(
  customerId: string,
  data: RecordPaymentRequest
): Promise<KasbonEntry> {
  return apiCall<KasbonEntry>('post', `/kasbon/customers/${customerId}/payments`, data);
}
