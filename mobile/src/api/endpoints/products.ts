import apiClient, { apiCall } from '../client';
import {
  Product,
  ProductListParams,
  CreateProductRequest,
  UpdateProductRequest,
  LowStockProduct,
  PaginatedResponse,
  CreatePricingTierRequest,
  UpdatePricingTierRequest,
  PricingTier,
} from '../types';

/**
 * Products API Endpoints
 * Based on MOBILE_DEV_GUIDE.md Section 3 (11 endpoints)
 */

/**
 * Get products list with pagination and filters
 * GET /api/v1/products
 */
export async function getProducts(
  params?: ProductListParams
): Promise<PaginatedResponse<Product>> {
  const response = await apiClient.get<PaginatedResponse<Product>>('/products', {
    params,
  });
  return response.data;
}

/**
 * Create new product
 * POST /api/v1/products
 * Content-Type: multipart/form-data
 */
export async function createProduct(
  data: CreateProductRequest,
  image?: {
    uri: string;
    type: string;
    name: string;
  }
): Promise<Product> {
  const formData = new FormData();
  formData.append('data', JSON.stringify(data));

  if (image) {
    formData.append('image', {
      uri: image.uri,
      type: image.type,
      name: image.name,
    } as unknown as Blob);
  }

  const response = await apiClient.post<{ data: Product }>('/products', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
}

/**
 * Search product by barcode
 * GET /api/v1/products/search?barcode=xxx
 */
export async function searchProductByBarcode(
  barcode: string
): Promise<Product | null> {
  try {
    const product = await apiCall<Product>('get', '/products/search', undefined, {
      barcode,
    });
    return product;
  } catch {
    return null;
  }
}

/**
 * Get low stock products
 * GET /api/v1/products/low-stock
 */
export async function getLowStockProducts(): Promise<LowStockProduct[]> {
  return apiCall<LowStockProduct[]>('get', '/products/low-stock');
}

/**
 * Get single product by ID
 * GET /api/v1/products/{id}
 */
export async function getProductById(id: string): Promise<Product> {
  return apiCall<Product>('get', `/products/${id}`);
}

/**
 * Update product
 * PUT /api/v1/products/{id}
 */
export async function updateProduct(
  id: string,
  data: UpdateProductRequest,
  image?: {
    uri: string;
    type: string;
    name: string;
  }
): Promise<Product> {
  if (image) {
    // Use form-data if updating with image
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    formData.append('image', {
      uri: image.uri,
      type: image.type,
      name: image.name,
    } as unknown as Blob);

    const response = await apiClient.put<{ data: Product }>(
      `/products/${id}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  }

  // Use JSON if no image
  return apiCall<Product>('put', `/products/${id}`, data);
}

/**
 * Delete product
 * DELETE /api/v1/products/{id}
 */
export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

/**
 * Add pricing tier to product
 * POST /api/v1/products/{id}/pricing-tiers
 */
export async function addPricingTier(
  productId: string,
  data: CreatePricingTierRequest
): Promise<PricingTier> {
  return apiCall<PricingTier>('post', `/products/${productId}/pricing-tiers`, data);
}

/**
 * Update pricing tier
 * PUT /api/v1/products/{id}/pricing-tiers/{tierId}
 */
export async function updatePricingTier(
  productId: string,
  tierId: string,
  data: UpdatePricingTierRequest
): Promise<PricingTier> {
  return apiCall<PricingTier>(
    'put',
    `/products/${productId}/pricing-tiers/${tierId}`,
    data
  );
}

/**
 * Delete pricing tier
 * DELETE /api/v1/products/{id}/pricing-tiers/{tierId}
 */
export async function deletePricingTier(
  productId: string,
  tierId: string
): Promise<void> {
  await apiClient.delete(`/products/${productId}/pricing-tiers/${tierId}`);
}
