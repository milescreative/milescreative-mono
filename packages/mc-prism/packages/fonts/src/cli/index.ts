#!/usr/bin/env node

import { Command } from 'commander';
import { searchFonts, installFont, optimizeFont } from '../lib/fonts';

interface InstallOptions {
  optimize?: boolean;
}

const program = new Command();

program
  .name('mc-fonts')
  .description('Font management and optimization CLI')
  .version('0.0.1');

program
  .command('search')
  .description('Search available fonts from Fontsource')
  .argument('[query]', 'Search query')
  .action(async (query: string | undefined) => {
    const results = await searchFonts(query);
    console.table(results);
  });

program
  .command('install')
  .description('Install a font from Fontsource')
  .argument('<font>', 'Font name to install')
  .option('-o, --optimize', 'Optimize the font after installation')
  .action(async (font: string, options: InstallOptions) => {
    await installFont(font);
    if (options.optimize) {
      await optimizeFont(font);
    }
  });

program
  .command('optimize')
  .description('Optimize an installed font')
  .argument('<font>', 'Font name to optimize')
  .action(async (font: string) => {
    await optimizeFont(font);
  });

program.parse();
