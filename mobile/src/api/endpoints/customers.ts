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
  params?: CustomerListParams
): Promise<PaginatedResponse<Customer>> {
  const response = await apiClient.get<PaginatedResponse<Customer>>('/customers', {
    params,
  });
  return response.data;
}

/**
 * Create new customer
 * POST /api/v1/customers
 */
export async function createCustomer(
  data: CreateCustomerRequest
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
  data: UpdateCustomerRequest
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
