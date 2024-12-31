# @milescreative/mc-rate-limiter

A flexible rate limiting package for Node.js applications.

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
