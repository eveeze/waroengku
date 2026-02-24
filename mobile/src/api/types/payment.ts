// ── QRIS Core API Types ──────────────────────────────────

export interface QrisChargeRequest {
  transaction_id: string;
}

export interface QrisChargeResponse {
  payment_id: string;
  order_id: string;
  qr_code_url: string;
  expiry_time: string; // e.g. "2026-02-25 04:30:00"
}

export type QrisStatusValue =
  | 'pending'
  | 'settlement'
  | 'capture'
  | 'expire'
  | 'cancel'
  | 'deny';

export interface QrisPaymentStatus {
  payment_id: string;
  transaction_id: string;
  order_id: string;
  status: QrisStatusValue;
  payment_type: string;
  gross_amount: number;
  qr_code_url?: string;
  paid_at?: string;
}

// ── Legacy / Shared ──────────────────────────────────────

export interface ManualVerifyRequest {
  notes?: string;
}

/** Generic payment status returned by GET /payments/transaction/{id} */
export interface PaymentStatus {
  transaction_id: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  status_message: string;
  payment_type: string;
}
