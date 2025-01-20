import { existsSync } from 'fs';
import path from 'path';
import type {
  Font,
  FontWithVariable,
  CssVariable,
  Display,
} from '../declarations';
import { installFont, optimizeFont } from './fonts';

export class FontNotInstalledError extends Error {
  constructor(fontName: string) {
    super(
      `Font "${fontName}" is not installed.\n` +
        `Run: npx mc-fonts install ${fontName}\n` +
        `This will install and optimize the font for your project.`
    );
    this.name = 'FontNotInstalledError';
  }
}

export function createFontWrapper<
  T extends CssVariable | undefined = undefined,
>(
  fontId: string,
  fontFunction: (options: any) => T extends undefined ? Font : FontWithVariable
) {
  return (options: {
    weight: string | number;
    style?: string | string[];
    display?: Display;
    variable?: T;
    preload?: boolean;
    fallback?: string[];
    subsets?: string[];
  }) => {
    const packageName = `@fontsource/${fontId}`;
    const nodeModulesPath = path.resolve(
      process.cwd(),
      'node_modules',
      packageName
    );

    if (!existsSync(nodeModulesPath)) {
      throw new FontNotInstalledError(fontId);
    }

    return fontFunction(options);
  };
}
