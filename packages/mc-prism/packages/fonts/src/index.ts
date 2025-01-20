import * as declarations from './declarations';
import { createFontWrapper } from './lib/wrapper';
export { installFont, optimizeFont, searchFonts } from './lib/fonts';
export type { FontInfo, FontOptions } from './lib/fonts';
export * from './declarations';

// Create wrapped versions of all font functions
Object.entries(declarations).forEach(([key, value]) => {
  if (typeof value === 'function') {
    const wrappedFont = createFontWrapper(
      key.toLowerCase().replace(/_/g, '-'),
      value
    );
    // @ts-ignore - Dynamic export
    exports[key] = wrappedFont;
  }
});
