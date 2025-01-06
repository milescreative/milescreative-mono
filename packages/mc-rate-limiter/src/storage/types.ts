/**
 * Record for tracking rate limit state
 */
export interface RateLimitRecord {
  /**
   * Number of requests made in the current window
   */
  count: number;

  /**
   * Timestamp when the current window resets
   */
  reset: number;
}

/**
 * Storage interface for rate limit records
 */
export interface Storage {
  /**
   * Get a rate limit record by key
   */
  get(key: string): Promise<RateLimitRecord | null>;

  /**
   * Set a rate limit record
   */
  set(key: string, record: RateLimitRecord): Promise<void>;

  /**
   * Delete a rate limit record
   */
  delete(key: string): Promise<void>;

  /**
   * Clean up expired records
   */
  cleanup(now: number): Promise<void>;

  /**
   * Clean up resources (optional)
   */
  destroy?(): void;
}

export interface DatabaseStorageOptions {
  /**
   * Database connection string
   */
  connectionString: string;
  /**
   * Table name for rate limit records
   * @default 'rate_limit_entries'
   */
  tableName?: string;
  /**
   * Column name mappings
   */
  columns?: {
    /**
     * Primary key column name
     * @default 'id'
     */
    id?: string;
    /**
     * Request count column name
     * @default 'count'
     */
    count?: string;
    /**
     * Reset timestamp column name
     * @default 'reset'
     */
    reset?: string;
    /**
     * Created at timestamp column name
     * @default 'created_at'
     */
    createdAt?: string;
    /**
     * Updated at timestamp column name
     * @default 'updated_at'
     */
    updatedAt?: string;
  };
  /**
   * Enable debug logging
   * @default false
   */
  debug?: boolean;
}
