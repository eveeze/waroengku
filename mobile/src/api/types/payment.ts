export interface SnapTokenRequest {
  transaction_id?: string;
  order_id: string; // Used as transaction_id
  gross_amount: number;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  item_details?: {
    id: string;
    price: number;
    quantity: number;
    name: string;
  }[];
}

export interface SnapTokenResponse {
  token: string;
  redirect_url: string;
  order_id: string;
}

export interface ManualVerifyRequest {
  notes?: string;
}

export interface PaymentStatus {
  transaction_id: string;
  transaction_status: string;
  fraud_status?: string;
  status_code: string;
  status_message: string;
  payment_type: string;
}
