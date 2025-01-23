import { existsSync } from 'fs';
import path from 'path';
import type {
  McFont,
  McFontWithVariable,
  CssVariable,
  Display,
  FontMetadata,
} from '../declarations';
import { installFont, optimizeFont } from './fonts';

export class FontNotInstalledError extends Error {
  constructor(fontId: string, isVariable: boolean) {
    const packageName = isVariable
      ? `@fontsource-variable/${fontId}`
      : `@fontsource/${fontId}`;
    super(
      `Font "${packageName}" is not installed.\n` +
        `Run: npx mc-fonts install ${fontId} ${isVariable ? '--variable' : ''}\n` +
        `This will install and optimize the font for your project.`
    );
    this.name = 'FontNotInstalledError';
  }
}

type FontOptions<T extends CssVariable | undefined = undefined> = {
  weight: string | number;
  style?: string | string[];
  display?: Display;
  variable?: T;
  preload?: boolean;
  fallback?: string[];
  subsets?: string[];
};

type FontLinkProps = {
  rel: 'preload' | 'stylesheet';
  href: string;
  as?: 'style' | 'font';
  type?: string;
  crossOrigin?: 'anonymous' | '';
  key: string;
};

export function createFontWrapper<
  T extends CssVariable | undefined = undefined,
>(
  fontId: string,
  fontFunction: (
    options: FontOptions<T>
  ) => T extends CssVariable ? McFontWithVariable : McFont,
  metadata: FontMetadata
) {
  return (options: FontOptions<T>) => {
    const isVariable = metadata.variable && options.variable !== undefined;
    const packageName = isVariable
      ? `@fontsource-variable/${fontId}`
      : `@fontsource/${fontId}`;
    const nodeModulesPath = path.resolve(
      process.cwd(),
      'node_modules',
      packageName
    );

    if (!existsSync(nodeModulesPath)) {
      throw new FontNotInstalledError(fontId, isVariable);
    }

    const fontConfig = fontFunction(options);

    // Generate Google Fonts URL
    const family = encodeURIComponent(metadata.family);
    const weights = Array.isArray(options.weight)
      ? options.weight
      : [options.weight];
    const styles = Array.isArray(options.style)
      ? options.style
      : [options.style || 'normal'];
    const subsets = options.subsets || ['latin'];

    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${family}:${styles
      .map((s) => weights.map((w) => `${s},wght@${w}`).join(';'))
      .join(
        ';'
      )}&display=${options.display || 'swap'}&subset=${subsets.join(',')}`;

    const links: FontLinkProps[] = [];

    if (options.preload) {
      links.push({
        rel: 'preload',
        href: googleFontUrl,
        as: 'style',
        crossOrigin: 'anonymous',
        key: `${fontId}-preload`,
      });
    }

    links.push({
      rel: 'stylesheet',
      href: googleFontUrl,
      key: `${fontId}-stylesheet`,
    });

    return {
      ...fontConfig,
      links,
      preload: options.preload ?? false,
      display: options.display ?? 'swap',
      fallback: options.fallback ?? metadata.fallback ?? [],
    } as T extends CssVariable ? McFontWithVariable : McFont;
  };
}
