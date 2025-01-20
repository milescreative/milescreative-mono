#!/usr/bin/env node

import { Command } from 'commander';
import { installFont } from '../lib/installer';

const program = new Command();

program
  .name('mc-fonts')
  .description('CLI to install and optimize fonts for mc-prism')
  .version('0.1.0');

program
  .command('install')
  .description('Install and optimize a font')
  .argument('<font>', 'font name to install (e.g. "Roboto")')
  .action(async (font: string) => {
    try {
      await installFont(font);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to install font:', error.message);
      } else {
        console.error('Failed to install font:', String(error));
      }
      process.exit(1);
    }
  });

program.parse();
