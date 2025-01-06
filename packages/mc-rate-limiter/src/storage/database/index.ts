import { Kysely, sql } from 'kysely';
import { Storage, RateLimitRecord } from '../types';
import { NeonHTTPDialect } from 'kysely-neon';
import ws from 'ws';
import { neonConfig } from '@neondatabase/serverless';
import { RateLimiterError } from '../../errors';
import { logger, type Logger } from '../../utils/logger';
import { RateLimiterOptions } from '../../types';
import { DatabaseStorageOptions } from '../types';
import { ColumnTypes, ColumnSpec } from './types';

const defaultColumnTypes: ColumnTypes = {
  id: 'varchar',
  count: 'integer',
  reset: 'integer',
  createdAt: 'timestamp',
  updatedAt: 'timestamp',
};

export class DatabaseStorage implements Storage {
  private db: Kysely<any>;
  private tableName: string;
  private columns: Required<NonNullable<DatabaseStorageOptions['columns']>>;
  private logger: Logger;
  private isInitialized = false;
  private columnTypes: NonNullable<ColumnTypes> = defaultColumnTypes;

  constructor(full_options: RateLimiterOptions<'pg-database'>) {
    if (!full_options.storage?.options) {
      throw RateLimiterError.InvalidConfiguration(
        'Database options are required'
      );
    }
    const options = full_options.storage.options;
    console.log('Debug enabled:', full_options.debug); // Add at constructor
    if (!options.connectionString) {
      throw RateLimiterError.DatabaseUrlNotFound();
    }

    this.db = new Kysely({
      dialect: new NeonHTTPDialect({
        connectionString: options.connectionString,
      }),
    });

    if ('NEXT_RUNTIME' in process.env === false) {
      neonConfig.webSocketConstructor = ws;
    }

    // Always ensure table name has schema
    const tableName = options.tableName || 'rate_limit_entries';
    this.tableName = tableName.includes('.')
      ? tableName
      : `public.${tableName}`;

    this.columns = {
      id: options.columns?.id || 'id',
      count: options.columns?.count || 'count',
      reset: options.columns?.reset || 'reset',
      createdAt: options.columns?.createdAt || 'created_at',
      updatedAt: options.columns?.updatedAt || 'updated_at',
    };

    this.logger = logger({
      enableDebug: full_options.debug,
      prefix: 'mc-rate-limiter:db',
    });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check if table exists and validate column types
      const result = await this.db
        .selectFrom('information_schema.columns')
        .select(['column_name', 'udt_name', 'character_maximum_length'])
        .where('table_schema', '=', 'public')
        .where('table_name', '=', this.tableName.replace('public.', ''))
        .execute();

      this.logger.debug(`Checking table schema for ${this.tableName}`);

      if (!result.length) {
        // Extract schema and table name
        const [schema = 'public', table = this.tableName] =
          this.tableName.split('.');

        this.isInitialized = false;

        throw RateLimiterError.SchemaNotFound(schema, table, this.columns);
      }

      const cleanColumnType = (type: string) => {
        return (type.split('(')[0] || type).trim().toLowerCase();
      };

      // Create a temporary map
      const typeMap = new Map(
        result.map((col) => [
          col.column_name as string,
          cleanColumnType(col.udt_name as string),
        ])
      );

      // Move debug logging here, before type validation
      this.logger.debug(
        `Type map: ${JSON.stringify(Object.fromEntries(typeMap), null, 2)}`
      );

      const requiredColumns: ColumnSpec[] = [
        {
          name: this.columns.id,
          type: 'character varying',
          displayType: 'VARCHAR(255)',
          allowableTypes: ['varchar', 'text', 'uuid'],
        },
        {
          name: this.columns.count,
          type: 'integer',
          displayType: 'INTEGER',
          allowableTypes: ['int2', 'int4', 'int8'],
        },
        {
          name: this.columns.reset,
          type: 'integer',
          displayType: 'INTEGER',
          allowableTypes: ['int4', 'int8'],
        },
        {
          name: this.columns.createdAt,
          type: 'timestamp',
          displayType: 'TIMESTAMP',
          allowableTypes: ['timestamp', 'timestamptz', 'varchar', 'text'],
        },
        {
          name: this.columns.updatedAt,
          type: 'timestamp',
          displayType: 'TIMESTAMP',
          allowableTypes: ['timestamp', 'timestamptz', 'varchar', 'text'],
        },
      ];

      for (const col of requiredColumns) {
        const actualType = typeMap.get(col.name);
        if (!actualType) {
          throw RateLimiterError.InvalidSchema(
            `Missing required column: "${col.name}". Please add it with type ${col.displayType}`
          );
        }
        if (!col.allowableTypes.includes(cleanColumnType(actualType))) {
          this.isInitialized = false;
          throw RateLimiterError.InvalidSchema(
            `Invalid type for column "${col.name}": expected ${col.displayType}, got ${actualType}`
          );
        }
        this.columnTypes[col.name as keyof ColumnTypes] = actualType;
      }

      this.isInitialized = true;
    } catch (error: any) {
      // Log the actual error for debugging
      this.isInitialized = false;

      if (error instanceof RateLimiterError) {
        throw error;
      }

      throw RateLimiterError.DatabaseConnectionError(
        'Failed to verify database schema. Please ensure you have proper permissions. Error: ' +
          error.message
      );
    }
  }

  async get(key: string): Promise<RateLimitRecord | null> {
    await this.initialize();

    try {
      const now = Math.floor(Date.now() / 1000); // Convert to seconds
      const query = this.db
        .selectFrom(this.tableName)
        .select([this.columns.count, this.columns.reset])
        .where(this.columns.id, '=', key)
        .where(this.columns.reset, '>', now);

      this.logger.debug(`Executing query: ${query.compile().sql}`);

      const record = await query.executeTakeFirst();

      if (!record) {
        this.logger.debug(`No active record found for ${key}`);
        return null;
      }

      return {
        count: record[this.columns.count],
        reset: Number(record[this.columns.reset]) * 1000, // Convert back to milliseconds
      };
    } catch (error: any) {
      this.logger.error('Query error details:', {
        error: error.message,
        code: error.code,
        table: this.tableName,
        columns: this.columns,
      });
      throw RateLimiterError.DatabaseConnectionError(
        'Failed to get rate limit record. Please check your database connection.'
      );
    }
  }

  async set(key: string, record: RateLimitRecord): Promise<void> {
    await this.initialize();

    try {
      const now = new Date();
      const resetSeconds = Math.floor(record.reset / 1000); // Convert to seconds

      await this.db
        .insertInto(this.tableName)
        .values({
          [this.columns.id]: key,
          [this.columns.count]: record.count,
          [this.columns.reset]: resetSeconds,
          [this.columns.createdAt]: ['timestamp', 'timestamptz'].includes(
            this.columnTypes.createdAt
          )
            ? now
            : now.toISOString(),
          [this.columns.updatedAt]: ['timestamp', 'timestamptz'].includes(
            this.columnTypes.updatedAt
          )
            ? now
            : now.toISOString(),
        })
        .onConflict((oc) =>
          oc.column(this.columns.id).doUpdateSet({
            [this.columns.count]: record.count,
            [this.columns.reset]: resetSeconds,
            [this.columns.updatedAt]: ['timestamp', 'timestamptz'].includes(
              this.columnTypes.updatedAt
            )
              ? now
              : now.toISOString(),
          })
        )
        .execute();
    } catch (error) {
      throw RateLimiterError.DatabaseConnectionError(
        `Failed to update rate limit record. Error: ${error}`
      );
    }
  }

  async delete(key: string): Promise<void> {
    await this.initialize();

    try {
      await this.db
        .deleteFrom(this.tableName)
        .where(this.columns.id, '=', key)
        .execute();
    } catch (error) {
      throw RateLimiterError.DatabaseConnectionError(
        `Failed to delete rate limit record. Error: ${error}`
      );
    }
  }

  async cleanup(now: number): Promise<void> {
    await this.initialize();

    try {
      const nowSeconds = Math.floor(now / 1000); // Convert to seconds
      await this.db
        .deleteFrom(this.tableName)
        .where(this.columns.reset, '<=', nowSeconds)
        .execute();
    } catch (error) {
      throw RateLimiterError.DatabaseConnectionError(
        `Failed to cleanup expired records. Error: ${error}`
      );
    }
  }

  destroy(): void {
    // No persistent connection to close
  }
}
