# Database Storage for Rate Limiting

This storage adapter allows you to use your existing database for rate limiting. It's designed to work with any database supported by Kysely, while using Prisma for migrations and type generation.

## Setup

1. Add the rate limiting table to your schema:

```prisma
// schema.prisma

// Copy this model and adjust the table name if needed
model RateLimitEntry {
  id         String   @id
  count      Int
  reset      BigInt
  created_at DateTime @default(now())
  updated_at DateTime @default(now()) @updatedAt

  @@map("rate_limit_entries") // Can be prefixed as needed
  @@index([reset])
}
```

2. Generate the migration:

```bash
npx prisma generate
npx prisma migrate dev --name add_rate_limiting
```

3. Use the database storage adapter:

```typescript
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { RateLimiter } from '@milescreative/rate-limiter';
import { DatabaseStorage } from '@milescreative/rate-limiter/storage/database';
import { DB } from './types'; // Your Prisma-generated types

// Create your Kysely instance
const db = new Kysely<DB>({
  dialect: new PostgresDialect({
    pool: new Pool({
      // Your database config
    })
  })
});

// Create the rate limiter with database storage
const limiter = new RateLimiter({
  limit: 100,
  window: 60,
  storage: new DatabaseStorage({
    db,
    tablePrefix: '', // Optional prefix if you want to avoid conflicts
    createTablesIfNotExist: false, // Set to true to auto-create tables (not recommended for production)
    debug: false
  })
});

// Use the rate limiter
await limiter.checkLimit('some-key');
```

## Configuration

The database storage adapter accepts the following options:

- `db`: Your Kysely database instance
- `tablePrefix`: Optional prefix for the rate limit table (default: '')
- `createTablesIfNotExist`: Whether to automatically create tables if they don't exist (default: false)
- `debug`: Enable debug logging (default: false)

## Best Practices

1. **Migrations**: Always use Prisma migrations to create/modify the tables. The `createTablesIfNotExist` option should only be used in development.

2. **Table Prefix**: If you're worried about table name conflicts, use a prefix:
   ```prisma
   @@map("my_app_rate_limit_entries")
   ```

3. **Cleanup**: The adapter automatically cleans up expired records. You might want to add a cron job to periodically trigger cleanup:
   ```typescript
   // Run every hour
   setInterval(() => {
     limiter.storage.cleanup(Date.now());
   }, 60 * 60 * 1000);
   ```

4. **Performance**: The adapter uses optimized queries and indexes for best performance. However, if you need even better performance, consider using Redis storage instead.

## Type Safety

The adapter is fully type-safe when used with Prisma-generated types and Kysely. Make sure to:

1. Generate Prisma types after adding the rate limiting table
2. Pass your database type to Kysely: `new Kysely<DB>({...})`

This ensures full type safety across your rate limiting implementation.
