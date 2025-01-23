/**
 * This file is auto-generated. Do not edit manually.
 */

export type CssVariable = `--${string}`;

export type Display = 'auto' | 'block' | 'swap' | 'fallback' | 'optional';

export type FontMetadata = {
  readonly id: string;
  readonly family: string;
  readonly category: string;
  readonly license: string;
  readonly type: 'google' | 'other';
  readonly variable: boolean;
  readonly lastModified: string;
  readonly weights: number[];
  readonly styles: string[];
  readonly subsets: string[];
  readonly defSubset: string;
  readonly fallback?: string[];
};

export type McFontBase = {
  className: string;
  style: {
    fontFamily: string;
    fontWeight?: number;
    fontStyle?: string;
  };
};

export type McFont = McFontBase & FontMetadata;

export type McFontWithVariable = McFont & {
  variable: string;
};

// Font Declarations

export const Abeezee = <
  T extends CssVariable | undefined = undefined,
>(options: {
  weight: '400';
  style?: 'italic' | 'normal' | Array<'italic' | 'normal'>;
  display?: Display;
  variable?: T;
  preload?: boolean;
  fallback?: string[];
  subsets?: Array<'latin' | 'latin-ext'>;
}): T extends undefined
  ? McFont
  : McFontWithVariable & {
      readonly id: 'abeezee';
      readonly family: 'ABeeZee';
      readonly category: 'sans-serif';
      readonly license: 'OFL-1.1';
      readonly type: 'google';
      readonly variable: false;
      readonly lastModified: '2024-09-04';
      readonly weights: [400];
      readonly styles: ['italic', 'normal'];
      readonly subsets: ['latin', 'latin-ext'];
      readonly defSubset: 'latin';
    };
