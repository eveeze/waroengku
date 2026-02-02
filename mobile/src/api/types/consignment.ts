export interface Consignor {
  id: string;
  name: string;
  phone: string;
  bank_account?: string;
  bank_name?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateConsignorRequest {
  name: string;
  phone: string;
  bank_account?: string;
  bank_name?: string;
}

export interface UpdateConsignorRequest {
  name?: string;
  phone?: string;
  bank_account?: string;
  bank_name?: string;
  is_active?: boolean;
}
