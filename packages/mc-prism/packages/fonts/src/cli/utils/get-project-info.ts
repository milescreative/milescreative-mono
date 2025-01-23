import { existsSync } from 'node:fs';
import path from 'node:path';
import { Config } from '@/src/cli/utils/get-config';
import fg from 'fast-glob';
import fs, { pathExists } from 'fs-extra';
import { loadConfig } from 'tsconfig-paths';
import findUp from 'find-up';
import { z } from 'zod';

// TODO: Add support for more frameworks.
// We'll start with Next.js for now.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const PROJECT_TYPES = [
  'next-app',
  'next-app-src',
  'next-pages',
  'next-pages-src',
] as const;

type ProjectType = (typeof PROJECT_TYPES)[number];

const PROJECT_SHARED_IGNORE = [
  '**/node_modules/**',
  '.next',
  'public',
  'dist',
  'build',
];

const packageSchema = z.object({
  name: z.string(),
  dependencies: z.record(z.string()).optional(),
  devDependencies: z.record(z.string()).optional(),
});

export async function getProjectInfo() {
  const info = {
    tsconfig: null,
    srcDir: false,
    appDir: false,
    srcComponentsUiDir: false,
    componentsUiDir: false,
  };

  try {
    const tsconfig = await getTsConfig();

    return {
      tsconfig,
      srcDir: existsSync(path.resolve('./src')),
      appDir:
        existsSync(path.resolve('./app')) ||
        existsSync(path.resolve('./src/app')),
      srcComponentsUiDir: existsSync(path.resolve('./src/components/ui')),
      componentsUiDir: existsSync(path.resolve('./components/ui')),
    };
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return info;
  }
}

export async function getTsConfig() {
  try {
    const tsconfigPath = path.join('tsconfig.json');
    const tsconfig = await fs.readJSON(tsconfigPath);

    if (!tsconfig) {
      throw new Error('tsconfig.json is missing');
    }

    return tsconfig;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null;
  }
}

export async function getProjectConfig(cwd: string): Promise<Config | null> {
  try {
    const packageJsonPath = await findUp('package.json', { cwd });
    const tailwindConfigPath = await findUp(
      ['tailwind.config.js', 'tailwind.config.ts'],
      { cwd }
    );

    if (!packageJsonPath || !tailwindConfigPath) {
      return null;
    }

    // Use dynamic import instead of require
    const packageJson = await import(packageJsonPath);
    packageSchema.parse(packageJson);

    const config: Config = {
      tailwind: {
        config: path.relative(cwd, tailwindConfigPath),
        css: 'app/globals.css',
        cssVariables: true,
      },
      optimize: true,
      normalize: true,
      resolvedPaths: {
        tailwindConfig: tailwindConfigPath,
        tailwindCss: path.join(cwd, 'app/globals.css'),
      },
    };

    return config;
  } catch {
    return null;
  }
}

export async function getProjectType(cwd: string): Promise<ProjectType | null> {
  const files = await fg.glob('**/*', {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  const isNextProject = files.find((file) => file.startsWith('next.config.'));
  if (!isNextProject) {
    return null;
  }

  const isUsingSrcDir = await fs.pathExists(path.resolve(cwd, 'src'));
  const isUsingAppDir = await fs.pathExists(
    path.resolve(cwd, `${isUsingSrcDir ? 'src/' : ''}app`)
  );

  if (isUsingAppDir) {
    return isUsingSrcDir ? 'next-app-src' : 'next-app';
  }

  return isUsingSrcDir ? 'next-pages-src' : 'next-pages';
}

export async function getTailwindCssFile(cwd: string) {
  const files = await fg.glob(['**/*.css', '**/*.scss'], {
    cwd,
    deep: 3,
    ignore: PROJECT_SHARED_IGNORE,
  });

  if (!files.length) {
    return null;
  }

  for (const file of files) {
    const contents = await fs.readFile(path.resolve(cwd, file), 'utf8');
    // Assume that if the file contains `@tailwind base` it's the main css file.
    if (contents.includes('@tailwind base')) {
      return file;
    }
  }

  return null;
}

export async function getTsConfigAliasPrefix(cwd: string) {
  const tsConfig = await loadConfig(cwd);

  if (tsConfig?.resultType === 'failed' || !tsConfig?.paths) {
    return null;
  }

  // This assume that the first alias is the prefix.
  for (const [alias, paths] of Object.entries(tsConfig.paths)) {
    if (paths.includes('./*') || paths.includes('./src/*')) {
      return alias.at(0);
    }
  }

  return null;
}

export async function isTypeScriptProject(cwd: string) {
  // Check if cwd has a tsconfig.json file.
  return pathExists(path.resolve(cwd, 'tsconfig.json'));
}

export function preFlight(cwd: string) {
  const packageJsonPath = path.join(cwd, 'package.json');
  if (!existsSync(packageJsonPath)) {
    throw new Error(
      'Could not find a package.json. Please run this command in a Node.js project.'
    );
  }
}
