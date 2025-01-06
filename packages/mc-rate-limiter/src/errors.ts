import { ColumnTypes } from './storage/database/types';
import { logger } from './utils/logger';

export class RateLimiterError extends Error {
  code: string;

  constructor(message: string, code: string) {
    super(message);
    this.code = code;
    this.name = 'RateLimiterError';
    logger().error(`${code}: ${message}`);
  }

  static DatabaseUrlNotFound(): RateLimiterError {
    return new RateLimiterError(
      'Database URL is required. Please set the DATABASE_URL environment variable.',
      'DATABASE_URL_NOT_FOUND'
    );
  }

  static SchemaNotFound(
    schema: string,
    table: string,
    columns: ColumnTypes
  ): RateLimiterError {
    return new RateLimiterError(
      `Rate limiter requires a database table. Run these SQL commands: CREATE TABLE ${schema}.${table} (${columns.id} VARCHAR(255) PRIMARY KEY, ${columns.count} INTEGER NOT NULL, ${columns.reset} INTEGER NOT NULL, ${columns.createdAt} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, ${columns.updatedAt} TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP); CREATE INDEX ${table}_reset_idx ON ${schema}.${table}(${columns.reset});`,
      'SCHEMA_NOT_FOUND'
    );
  }

  static InvalidSchema(message: string): RateLimiterError {
    return new RateLimiterError(message, 'INVALID_SCHEMA');
  }

  static InvalidConfiguration(message: string): RateLimiterError {
    return new RateLimiterError(message, 'INVALID_CONFIGURATION');
  }

  static DatabaseConnectionError(error: string | Error): RateLimiterError {
    const message = typeof error === 'string' ? error : error.message;
    return new RateLimiterError(
      `Database error: ${message}`,
      'DATABASE_CONNECTION_ERROR'
    );
  }
}
