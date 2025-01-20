import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

class FontInstallError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FontInstallError';
  }
}

export async function installFont(fontName: string): Promise<void> {
  const packageName = `@fontsource/${fontName.toLowerCase()}`;
  const nodeModulesPath = path.resolve(
    process.cwd(),
    'node_modules',
    packageName
  );

  // Check if font is already installed
  if (fs.existsSync(nodeModulesPath)) {
    console.log(`Font ${fontName} is already installed`);
    return;
  }

  try {
    // Install the font using npm
    console.log(`Installing ${packageName}...`);
    execSync(`npm install ${packageName}`, { stdio: 'inherit' });

    // TODO: Run optimization scripts here
    console.log(`Successfully installed ${fontName}`);
  } catch (error) {
    throw new FontInstallError(
      `Failed to install ${fontName}. Please make sure the font name is correct and try again.`
    );
  }
}
