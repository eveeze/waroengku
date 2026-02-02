export interface RefillableContainer {
  id: string;
  product_id: string;
  container_type: string;
  empty_count: number;
  full_count: number;
}

export interface AdjustRefillableRequest {
  container_id: string;
  empty_change: number; // Positive to add, negative to reduce
  full_change: number; // Positive to add, negative to reduce
  notes?: string;
}
