import path from 'node:path';
import { cosmiconfig } from 'cosmiconfig';
import { loadConfig } from 'tsconfig-paths';
import { z } from 'zod';

export const DEFAULT_STYLE = 'default';
export const DEFAULT_COMPONENTS = '@/components';
export const DEFAULT_UTILS = '@/lib/utils';
export const DEFAULT_TAILWIND_CSS = 'app/globals.css';
export const DEFAULT_TAILWIND_CONFIG = 'tailwind.config.js';
export const DEFAULT_TAILWIND_BASE_COLOR = 'slate';

// TODO: Figure out if we want to support all cosmiconfig formats.
// A simple components.json file would be nice.
const explorer = cosmiconfig('fonts', {
  searchPlaces: ['fonts.json'],
});

export const rawConfigSchema = z
  .object({
    $schema: z.string().optional(),
    tailwind: z.object({
      config: z.string(),
      css: z.string(),
      cssVariables: z.boolean().default(true),
      prefix: z.string().default('').optional(),
    }),
    optimize: z.boolean().default(true),
    normalize: z.boolean().default(true),
  })
  .strict();

export type RawConfig = z.infer<typeof rawConfigSchema>;

export const configSchema = rawConfigSchema.extend({
  resolvedPaths: z.object({
    tailwindConfig: z.string(),
    tailwindCss: z.string(),
  }),
});

export type Config = z.infer<typeof configSchema>;

export async function getConfig(cwd: string) {
  const config = await getRawConfig(cwd);

  if (!config) {
    return null;
  }

  return await resolveConfigPaths(cwd, config);
}

export async function resolveConfigPaths(cwd: string, config: RawConfig) {
  // Read tsconfig.json.
  const tsConfig = await loadConfig(cwd);

  if (tsConfig.resultType === 'failed') {
    throw new Error(
      `Failed to load configuration. ${tsConfig.message ?? ''}`.trim()
    );
  }

  return configSchema.parse({
    ...config,
    resolvedPaths: {
      tailwindConfig: path.resolve(cwd, config.tailwind.config),
      tailwindCss: path.resolve(cwd, config.tailwind.css),
    },
  });
}

export async function getRawConfig(cwd: string): Promise<RawConfig | null> {
  try {
    const configResult = await explorer.search(cwd);

    if (!configResult) {
      return null;
    }

    return rawConfigSchema.parse(configResult.config);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    throw new Error(`Invalid configuration found in ${cwd}/fonts.json.`);
  }
}
