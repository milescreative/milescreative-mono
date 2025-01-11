export type AssetType = 'image' | 'font' | 'svg';

export interface AssetManifest {
  version: string;
  assets: {
    [key: string]: {
      type: AssetType;
      originalPath: string;
      optimizedPath: string;
      size: number;
      hash: string;
    };
  };
}

export interface OptimizationResult {
  success: boolean;
  error?: string;
  stats?: {
    originalSize: number;
    optimizedSize: number;
    savings: number;
  };
}
