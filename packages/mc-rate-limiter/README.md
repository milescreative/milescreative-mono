# Miles Creative Rate Limiter

A flexible rate limiting package with support for memory, Redis, and database storage.

## Database Storage

To use database storage, you'll need to create a table with the following schema:

```sql
CREATE TABLE rate_limit_entries (
  id VARCHAR(255) PRIMARY KEY,
  count INTEGER NOT NULL,
  reset BIGINT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Index for cleanup performance
CREATE INDEX rate_limit_entries_reset_idx ON rate_limit_entries(reset);
```

You can customize the table name and column names when configuring the storage:

```typescript
import { createRateLimiter } from '@milescreative/rate-limiter';

const rateLimiter = createRateLimiter({
  limit: 100,
  window: 60,
  storage: {
    connectionString: process.env.DATABASE_URL,
    // Optional: customize table name
    tableName: 'my_rate_limits',
    // Optional: map to your existing columns
    columns: {
      id: 'key',
      count: 'requests',
      reset: 'expires_at'
    }
  }
});
```

## Usage

```typescript
// In your API route
import { createRateLimiter } from '@milescreative/rate-limiter';

const rateLimiter = createRateLimiter({
  limit: 100, // max requests
  window: 60, // in seconds
  storage: {
    // Choose your storage type:

    // Memory storage (development only)
    memory: true,

    // Redis storage
    client: redisClient,

    // Database storage
    connectionString: process.env.DATABASE_URL
  }
});

// Use in your API route
export async function GET(request: Request) {
  const result = await rateLimiter(request);

  if (!result.isAllowed) {
    return result.getResponse(); // Returns 429 with retry info
  }

  // Continue with your API logic...
}
```

## Configuration

### Rate Limiter Options

| Option | Type | Description | Default |
|--------|------|-------------|---------|
| limit | number | Maximum requests allowed in window | Required |
| window | number | Time window in seconds | Required |
| storage | object | Storage configuration | Required |
| onError | function | Custom error response handler | Built-in 429 |
| debug | boolean | Enable debug logging | false |

### Storage Options

#### Memory Storage
```typescript
{
  memory: true
}
```

#### Redis Storage
```typescript
{
  client: Redis // Upstash Redis client
}
```

#### Database Storage
```typescript
{
  connectionString: string,
  tableName?: string, // defaults to 'rate_limit_entries'
  columns?: {
    id?: string,    // defaults to 'id'
    count?: string, // defaults to 'count'
    reset?: string  // defaults to 'reset'
  }
}
```

## Installation

```bash
npm install @milescreative/mc-rate-limiter
# or
yarn add @milescreative/mc-rate-limiter
# or
pnpm add @milescreative/mc-rate-limiter
```

## Basic Usage

```typescript
import { RateLimiter } from '@milescreative/mc-rate-limiter';

const limiter = new RateLimiter({
  limit: 100,    // Maximum number of requests
  window: 3600   // Time window in seconds (1 hour)
});

// Check if request is allowed
const isAllowed = await limiter.isAllowed('user-key');
```

## License

MIT
