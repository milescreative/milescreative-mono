# @milescreative/mc-auth

A flexible authentication library for Next.js applications with support for multiple providers and session management.

## Features

- 🔒 Secure session management
- 🌐 Multiple auth provider support
- ⚡️ Built for Next.js
- 🎯 TypeScript-first
- 🛡️ CSRF protection
- 🔄 Automatic token refresh

## Installation

```bash
pnpm add @milescreative/mc-auth
```

## Quick Start

```typescript
import { createAuth } from '@milescreative/mc-auth';

const auth = createAuth({
  providers: ['github', 'google'],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  }
});

// Use in your Next.js route handlers
export const GET = auth.handleAuth();
```

## Configuration

```typescript
interface AuthConfig {
  providers: Provider[];
  session: SessionConfig;
  callbacks?: AuthCallbacks;
  pages?: AuthPages;
}
```

## Usage with Next.js

```typescript
// app/api/auth/[...auth]/route.ts
import { createAuth } from '@milescreative/mc-auth';

const auth = createAuth({
  providers: ['github'],
  session: { strategy: 'jwt' }
});

export const { GET, POST } = auth.createRouteHandlers();
```

## License

MIT
