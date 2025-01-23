#!/usr/bin/env node
import { add } from '@/src/cli/commands/add';
import { diff } from '@/src/cli/commands/diff';
import { init } from '@/src/cli/commands/init';
import { Command } from 'commander';

import { DEPRECATED_MESSAGE } from './deprecated';
import { getPackageInfo } from './utils/get-package-info';

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

async function main() {
  const packageInfo = await getPackageInfo();

  const program = new Command()
    .name('@mc-prism/fonts')
    .description('add components and dependencies to your project')
    .addHelpText('after', DEPRECATED_MESSAGE)
    .version(
      packageInfo.version || '1.0.0',
      '-v, --version',
      'display the version number'
    );

  program.addCommand(init).addCommand(add).addCommand(diff);

  program.parse();
}

main();
