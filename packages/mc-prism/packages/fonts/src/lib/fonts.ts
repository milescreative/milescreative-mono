import axios from 'axios';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

const FONTSOURCE_API = 'https://api.fontsource.org';

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

export async function installFont(fontName: string): Promise<void> {
  try {
    // Use pnpm to install the font
    execSync(`pnpm add @fontsource/${fontName}`, { stdio: 'inherit' });
    console.log(`Successfully installed @fontsource/${fontName}`);
  } catch (error) {
    console.error('Error installing font:', error);
    throw error;
  }
}

export async function optimizeFont(fontName: string): Promise<void> {
  const fontDir = join(process.cwd(), 'node_modules', '@fontsource', fontName);

  if (!existsSync(fontDir)) {
    throw new Error(`Font ${fontName} is not installed`);
  }

  try {
    // Here we'll integrate your existing font-optimizer script
    // This is a placeholder - we'll need to implement the actual optimization logic
    console.log(`Optimizing font: ${fontName}`);
    // TODO: Implement font optimization using your existing script
  } catch (error) {
    console.error('Error optimizing font:', error);
    throw error;
  }
}
