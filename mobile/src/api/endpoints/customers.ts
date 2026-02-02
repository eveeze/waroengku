import apiClient, { apiCall } from '../client';
import {
  Customer,
  CustomerListParams,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  CustomerWithDebt,
  PaginatedResponse,
} from '../types';

/**
 * Customers API Endpoints
 * Based on MOBILE_DEV_GUIDE.md Section 4 (6 endpoints)
 */

/**
 * Get customers list with pagination
 * GET /api/v1/customers
 */
export async function getCustomers(
  params?: CustomerListParams,
): Promise<PaginatedResponse<Customer>> {
  const response = await apiClient.get<PaginatedResponse<Customer>>(
    '/customers',
    {
      params,
    },
  );
  return response.data;
}

/**
 * Create new customer
 * POST /api/v1/customers
 */
export async function createCustomer(
  data: CreateCustomerRequest,
): Promise<Customer> {
  return apiCall<Customer>('post', '/customers', data);
}

/**
 * Get customers with outstanding debt
 * GET /api/v1/customers/with-debt
 */
export async function getCustomersWithDebt(): Promise<CustomerWithDebt[]> {
  return apiCall<CustomerWithDebt[]>('get', '/customers/with-debt');
}

/**
 * Get single customer by ID
 * GET /api/v1/customers/{id}
 */
export async function getCustomerById(id: string): Promise<Customer> {
  return apiCall<Customer>('get', `/customers/${id}`);
}

/**
 * Update customer
 * PUT /api/v1/customers/{id}
 */
export async function updateCustomer(
  id: string,
  data: UpdateCustomerRequest,
): Promise<Customer> {
  return apiCall<Customer>('put', `/customers/${id}`, data);
}

/**
 * Delete customer (Admin only)
 * DELETE /api/v1/customers/{id}
 */
export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}

/**
 * Get Kasbon History (Endpoints 7)
 * GET /api/v1/kasbon/customers/{id}
 */
export async function getKasbonHistory(
  id: string,
): Promise<import('../types').KasbonHistory[]> {
  return apiCall<import('../types').KasbonHistory[]>(
    'get',
    `/kasbon/customers/${id}`,
  );
}

/**
 * Get Kasbon Summary (Endpoints 8)
 * GET /api/v1/kasbon/customers/{id}/summary
 */
export async function getKasbonSummary(
  id: string,
): Promise<import('../types').KasbonSummary> {
  return apiCall<import('../types').KasbonSummary>(
    'get',
    `/kasbon/customers/${id}/summary`,
  );
}

/**
 * Download Billing PDF (Endpoints 9)
 * GET /api/v1/kasbon/customers/{id}/billing/pdf
 */
export async function getBillingPdf(id: string): Promise<Blob> {
  const response = await apiClient.get(`/kasbon/customers/${id}/billing/pdf`, {
    responseType: 'blob',
  });
  return response.data;
}

/**
 * Record Payment for Kasbon (Endpoints 10)
 * POST /api/v1/kasbon/customers/{id}/payments
 */
export async function recordKasbonPayment(
  id: string,
  data: import('../types').PayKasbonRequest,
): Promise<void> {
  await apiClient.post(`/kasbon/customers/${id}/payments`, data);
}
