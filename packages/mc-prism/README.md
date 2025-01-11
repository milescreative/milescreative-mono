# mc-prism

Framework-agnostic asset optimization and management toolkit. Built with Zig, Go, and TypeScript.

## Features

- 🎨 Font optimization and loading
- 🖼️ Image processing and optimization
- 📐 SVG optimization and utilities
- ⚡ High-performance native code
- 🔧 Framework agnostic
- 📦 Simple API

## Quick Start

```bash
pnpm add @mc-prism/core @mc-prism/react
```

```typescript
import { Image } from '@mc-prism/react'
import '@mc-prism/css/fonts.css'

// Use optimized images
<Image
  src="/images/hero.jpg"
  sizes="(max-width: 768px) 100vw, 50vw"
/>

// Use optimized fonts
<text className="font-optimized-inter">
  Hello World
</text>
```

## Packages

- `@mc-prism/core` - Core utilities and types
- `@mc-prism/machine` - Native optimization engines
- `@mc-prism/react` - React components
- `@mc-prism/css` - CSS utilities and presets
- `@mc-prism/cli` - Command line tools

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

## License

MIT
