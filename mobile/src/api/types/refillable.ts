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

export interface CreateRefillableContainerRequest {
  product_id: string;
  container_type: string;
  empty_count: number;
  full_count: number;
  notes?: string;
}

export interface RefillableMovement {
  id: string;
  refillable_id: string;
  actor_name: string;
  empty_change: number;
  full_change: number;
  notes?: string;
  created_at: string;
}
