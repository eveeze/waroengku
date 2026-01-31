/**
 * Common API Types
 * Based on MOBILE_DEV_GUIDE.md response format
 */

// Success Response
export interface ApiResponse<T> {
  success: true;
  message?: string;
  data: T;
}

// Error Response
export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

// Pagination Meta
export interface PaginationMeta {
  page: number;
  per_page: number;
  total_items: number;
  total_pages: number;
}

// Paginated Response
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

// HTTP Error Codes (from MOBILE_DEV_GUIDE.md)
export type HttpErrorCode = 
  | 400  // Bad Request - Validation error
  | 401  // Unauthorized - Redirect to login
  | 403  // Forbidden - Role tidak punya akses
  | 404  // Not Found - Item tidak ditemukan
  | 429  // Rate Limited - Retry setelah 1 detik
  | 500; // Server Error - Tampilkan "Coba lagi"

// Error Codes from Backend
export type ErrorCode = 
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'INTERNAL_ERROR';

// User Role (from MOBILE_DEV_GUIDE.md)
export type UserRole = 'admin' | 'cashier' | 'inventory';

// Payment Method
export type PaymentMethod = 'cash' | 'kasbon' | 'qris' | 'transfer';
