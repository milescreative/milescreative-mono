export interface RateLimitTable {
  id: string;
  count: number;
  reset: number;
  created_at: Date;
  updated_at: Date;
}

export interface ColumnTypes {
  id: string;
  count: string;
  reset: string;
  createdAt: string;
  updatedAt: string;
}

// Validate column types
export interface ColumnSpec {
  name: string;
  type: string;
  displayType: string;
  allowableTypes: string[];
}
