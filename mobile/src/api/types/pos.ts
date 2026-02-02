export interface HeldCartItem {
  product_id: string;
  quantity: number;
}

export interface HoldCartRequest {
  customer_id?: string;
  held_by: string;
  items: HeldCartItem[];
}

export interface HeldCart {
  id: string;
  customer_id?: string;
  held_by: string;
  items: HeldCartItem[];
  held_at: string; // ISO Date string
}

export interface RefundItem {
  transaction_item_id: string;
  quantity: number;
  restock: boolean;
}

export interface CreateRefundRequest {
  transaction_id: string;
  refund_method: 'cash' | 'transfer' | 'other';
  reason: string;
  requested_by?: string;
  items: RefundItem[];
}

export interface Refund {
  id: string;
  transaction_id: string;
  amount: number;
  reason: string;
  status: string;
  created_at: string;
}
