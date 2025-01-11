export interface PrismConfig {
  outDir: string;
  cache: boolean;
  development: boolean;
  optimization: {
    level: 'fast' | 'balanced' | 'max';
  };
}

export const defaultConfig: PrismConfig = {
  outDir: './prism-assets',
  cache: true,
  development: process.env.NODE_ENV !== 'production',
  optimization: {
    level: 'balanced',
  },
};

export class PrismError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrismError';
  }
}

export * from './types';
