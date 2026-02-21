import { z } from 'zod';

/**
 * Validation Schemas using Zod
 */

// Login form validation
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register user validation (Admin)
export const registerUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi').min(2, 'Nama minimal 2 karakter'),
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(6, 'Password minimal 6 karakter'),
  role: z.enum(['cashier', 'inventory'], {
    required_error: 'Role wajib dipilih',
  }),
});

export type RegisterUserFormData = z.infer<typeof registerUserSchema>;

// Product validation
export const productSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama produk wajib diisi')
    .min(2, 'Nama produk minimal 2 karakter'),
  barcode: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  category_id: z.string().optional(),
  consignor_id: z.string().optional().nullable(),
  unit: z.string().default('pcs'),
  base_price: z
    .number({ required_error: 'Harga jual wajib diisi' })
    .min(0, 'Harga tidak boleh negatif'),
  cost_price: z
    .number({ required_error: 'Harga modal wajib diisi' })
    .min(0, 'Harga modal tidak boleh negatif'),
  is_stock_active: z.boolean().default(true),
  current_stock: z.number().min(0).default(0),
  min_stock_alert: z.number().min(0).default(10),
  max_stock: z.number().min(0).optional(),
  is_refillable: z.boolean().default(false),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Pricing tier validation
export const pricingTierSchema = z.object({
  name: z.string().min(1, 'Nama tier wajib diisi'),
  min_quantity: z
    .number({ required_error: 'Qty minimum wajib diisi' })
    .min(1, 'Qty minimum harus lebih dari 0'),
  max_quantity: z.number().optional(),
  price: z
    .number({ required_error: 'Harga wajib diisi' })
    .min(0, 'Harga tidak boleh negatif'),
});

export type PricingTierFormData = z.infer<typeof pricingTierSchema>;

// Category validation
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nama kategori wajib diisi')
    .min(2, 'Nama kategori minimal 2 karakter'),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Customer validation
export const customerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama pelanggan wajib diisi')
    .min(2, 'Nama minimal 2 karakter'),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  credit_limit: z.number().min(0).default(0),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Kasbon payment validation
export const kasbonPaymentSchema = z.object({
  amount: z
    .number({ required_error: 'Jumlah pembayaran wajib diisi' })
    .min(1, 'Jumlah harus lebih dari 0'),
  notes: z.string().optional(),
});

export type KasbonPaymentFormData = z.infer<typeof kasbonPaymentSchema>;
