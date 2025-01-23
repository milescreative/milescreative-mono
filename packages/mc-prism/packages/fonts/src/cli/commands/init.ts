import { existsSync, promises as fs } from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_TAILWIND_CONFIG,
  DEFAULT_TAILWIND_CSS,
  getConfig,
  rawConfigSchema,
  resolveConfigPaths,
  type Config,
} from '@/src/cli/utils/get-config';
import { getPackageManager } from '@/src/cli/utils/get-package-manager';
import { handleError } from '@/src/cli/utils/handle-error';
import { logger } from '@/src/cli/utils/logger';
import chalk from 'chalk';
import { Command } from 'commander';
import { execa } from 'execa';
import ora from 'ora';
import prompts from 'prompts';
import { z } from 'zod';

const PROJECT_DEPENDENCIES = ['@fontsource/inter', 'tailwindcss'];

const initOptionsSchema = z.object({
  cwd: z.string(),
  yes: z.boolean(),
  defaults: z.boolean(),
});

export const init = new Command()
  .name('init')
  .description('initialize your project and install dependencies')
  .option('-y, --yes', 'skip confirmation prompt.', false)
  .option('-d, --defaults,', 'use default configuration.', false)
  .option(
    '-c, --cwd <cwd>',
    'the working directory. defaults to the current directory.',
    process.cwd()
  )
  .action(async (opts) => {
    try {
      const options = initOptionsSchema.parse(opts);
      const cwd = path.resolve(options.cwd);

      // Ensure target directory exists.
      if (!existsSync(cwd)) {
        logger.error(`The path ${cwd} does not exist. Please try again.`);
        process.exit(1);
      }

      // Read config.
      const existingConfig = await getConfig(cwd);
      await promptForConfig(cwd, existingConfig, options.yes);
      await runInit(cwd);

      logger.info('');
      logger.info(
        `${chalk.green(
          'Success!'
        )} Project initialization completed. You can now add fonts using the add command.`
      );
      logger.info('');
    } catch (error) {
      handleError(error);
    }
  });

export async function promptForConfig(
  cwd: string,
  defaultConfig: Config | null = null,
  skip = false
) {
  const highlight = (text: string) => chalk.cyan(text);

  const options = await prompts([
    {
      type: 'text',
      name: 'tailwindCss',
      message: `Where is your ${highlight('global CSS')} file?`,
      initial: defaultConfig?.tailwind.css ?? DEFAULT_TAILWIND_CSS,
    },
    {
      type: 'text',
      name: 'tailwindConfig',
      message: `Where is your ${highlight('tailwind.config.js')} located?`,
      initial: defaultConfig?.tailwind.config ?? DEFAULT_TAILWIND_CONFIG,
    },
    {
      type: 'toggle',
      name: 'tailwindCssVariables',
      message: `Would you like to use ${highlight('CSS variables')} for fonts?`,
      initial: defaultConfig?.tailwind.cssVariables ?? true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'text',
      name: 'tailwindPrefix',
      message: `Are you using a custom ${highlight(
        'tailwind prefix eg. tw-'
      )}? (Leave blank if not)`,
      initial: defaultConfig?.tailwind.prefix ?? '',
    },
    {
      type: 'toggle',
      name: 'optimize',
      message: `Would you like to ${highlight('optimize')} fonts?`,
      initial: defaultConfig?.optimize ?? true,
      active: 'yes',
      inactive: 'no',
    },
    {
      type: 'toggle',
      name: 'normalize',
      message: `Would you like to ${highlight('normalize')} font weights?`,
      initial: defaultConfig?.normalize ?? true,
      active: 'yes',
      inactive: 'no',
    },
  ]);

  const config = rawConfigSchema.parse({
    tailwind: {
      config: options.tailwindConfig,
      css: options.tailwindCss,
      cssVariables: options.tailwindCssVariables,
      prefix: options.tailwindPrefix,
    },
    optimize: options.optimize,
    normalize: options.normalize,
  });

  if (!skip) {
    const { proceed } = await prompts({
      type: 'confirm',
      name: 'proceed',
      message: `Write configuration to ${highlight('fonts.json')}. Proceed?`,
      initial: true,
    });

    if (!proceed) {
      process.exit(0);
    }
  }

  // Write to file.
  logger.info('');
  const spinner = ora(`Writing fonts.json...`).start();
  const targetPath = path.resolve(cwd, 'fonts.json');
  await fs.writeFile(targetPath, JSON.stringify(config, null, 2), 'utf8');
  spinner.succeed();

  return await resolveConfigPaths(cwd, config);
}

export async function runInit(cwd: string) {
  // Install dependencies.
  const dependenciesSpinner = ora(`Installing dependencies...`).start();
  const packageManager = await getPackageManager(cwd);

  await execa(
    packageManager,
    [packageManager === 'npm' ? 'install' : 'add', ...PROJECT_DEPENDENCIES],
    {
      cwd,
    }
  );
  dependenciesSpinner.succeed();
}
