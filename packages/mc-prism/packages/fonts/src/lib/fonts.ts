import axios from 'axios';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join, resolve, dirname } from 'path';
import fs from 'fs';
import path from 'path';
import { detect } from 'detect-package-manager';
import type { FontMetadata } from '../declarations';

const FONTSOURCE_API = 'https://api.fontsource.org';
const TOOLS_DIR = resolve(__dirname, '../../../tools');
const OPTIMIZER_PATH = join(TOOLS_DIR, 'dist/optimize-font');

function findUpSync(
  filename: string,
  startPath: string = process.cwd()
): string | null {
  let currentDir = startPath;
  while (true) {
    const filePath = join(currentDir, filename);
    if (existsSync(filePath)) {
      return filePath;
    }

    const parentDir = dirname(currentDir);
    if (parentDir === currentDir) {
      return null;
    }
    currentDir = parentDir;
  }
}

function getFontPackageName(fontId: string, isVariable: boolean): string {
  return isVariable
    ? `@fontsource-variable/${fontId}`
    : `@fontsource/${fontId}`;
}

async function getInstallCommand(packageName: string): Promise<string> {
  const pm = await detect();
  switch (pm) {
    case 'yarn':
      return `yarn add ${packageName}`;
    case 'pnpm':
      return `pnpm add ${packageName}`;
    case 'bun':
      return `bun add ${packageName}`;
    default:
      return `npm install ${packageName}`;
  }
}

export interface FontInfo {
  id: string;
  family: string;
  version: string;
  weights: string[];
  styles: string[];
}

export async function searchFonts(query?: string): Promise<FontInfo[]> {
  try {
    const response = await axios.get(
      `${FONTSOURCE_API}/fonts${query ? `?search=${query}` : ''}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching fonts:', error);
    return [];
  }
}

export async function installFont(
  fontId: string,
  isVariable: boolean
): Promise<void> {
  try {
    const packageName = getFontPackageName(fontId, isVariable);
    const installCmd = await getInstallCommand(packageName);
    execSync(installCmd, { stdio: 'inherit' });
    console.log(`Successfully installed ${packageName}`);
  } catch (error) {
    console.error('Error installing font:', error);
    throw error;
  }
}

export async function optimizeFont(
  fontId: string,
  isVariable: boolean
): Promise<void> {
  const packageName = getFontPackageName(fontId, isVariable);
  const parts = packageName.split('/');
  if (parts.length !== 2) {
    throw new Error(`Invalid package name format: ${packageName}`);
  }
  const scope = parts[0]!;
  const name = parts[1]!;
  const fontDir = join(process.cwd(), 'node_modules', scope, name);

  if (!existsSync(fontDir)) {
    throw new Error(`Font ${packageName} is not installed`);
  }

  if (!existsSync(OPTIMIZER_PATH)) {
    throw new Error(
      'Font optimizer not found. Please ensure the tools package is built.'
    );
  }

  try {
    execSync(`"${OPTIMIZER_PATH}" "${fontId}"`, {
      stdio: 'inherit',
      env: {
        ...process.env,
        FONT_DIR: fontDir,
        IS_VARIABLE: isVariable.toString(),
        OUTPUT_DIR: join(
          process.cwd(),
          'node_modules',
          '@mc-prism',
          'fonts',
          'optimized',
          fontId
        ),
      },
    });
    console.log(`Successfully optimized font: ${packageName}`);
  } catch (error) {
    console.error('Error optimizing font:', error);
    throw error;
  }
}

export interface FontOptions {
  weight?: string | number;
  style?: string | string[];
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional';
  preload?: boolean;
  fallback?: string[];
}

class FontNotInstalledError extends Error {
  constructor(fontName: string) {
    super(
      `Font "${fontName}" is not installed. Please install it first using the mc-fonts CLI:\n` +
        `npx mc-fonts install ${fontName}`
    );
    this.name = 'FontNotInstalledError';
  }
}

export function createFont(fontName: string, options: FontOptions = {}) {
  const packageName = `@fontsource/${fontName.toLowerCase()}`;
  const nodeModulesPath = path.resolve(
    process.cwd(),
    'node_modules',
    packageName
  );

  if (!fs.existsSync(nodeModulesPath)) {
    throw new FontNotInstalledError(fontName);
  }

  // TODO: Return font configuration object
  return {
    fontFamily: fontName,
    ...options,
  };
}
