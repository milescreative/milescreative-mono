// import * as declarations from './declarations';
// import { createFontWrapper } from './lib/wrapper';
// export { installFont, optimizeFont, searchFonts } from './lib/fonts';
// export type { FontInfo, FontOptions } from './lib/fonts';
// export * from './declarations';

// Create wrapped versions of all font functions
// Object.entries(declarations).forEach(([key, value]) => {
//   if (typeof value === 'function') {
//     const fontId = key.toLowerCase().replace(/_/g, '-');
//     // @ts-ignore - Dynamic font function call
//     const metadata = value({ weight: '400' });
//     // @ts-ignore - Dynamic export
//     exports[key] = createFontWrapper(fontId, value, metadata);
//   }
// });

// const test = declarations.Roboto({ weight: '400', variable: '--font-roboto' });
// console.log(test.variable);

import './arial.css';

export const Arial = <T extends string | undefined = undefined>(options: {
  variable?: T;
}): {
  readonly id: 'arial';
  readonly family: 'Arial';
  readonly variable: T extends string ? T : undefined;
  readonly className: string;
} => {
  const variableName = options.variable || '--font-arial';
  const className = variableName.replace('--', 'font-');

  return {
    id: 'arial',
    family: 'Arial',
    variable: variableName as T extends string ? T : undefined,
    className,
  };
};
