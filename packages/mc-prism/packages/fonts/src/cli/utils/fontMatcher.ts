import fuzzysort from 'fuzzysort';
import fetch from 'node-fetch';

interface FontMatch {
  id: string;
  confidence: number;
}

interface FontResponse {
  id: string;
  [key: string]: unknown;
}

export class FontMatcher {
  private fonts: string[] | null;

  constructor() {
    this.fonts = null;
  }

  async init() {
    try {
      const response = await fetch('https://api.fontsource.org/v1/fonts');
      const data = (await response.json()) as FontResponse[];
      this.fonts = data.map((font) => font.id);
    } catch (error) {
      console.error('Error fetching fonts:', error);
      throw error;
    }
  }

  findFontCandidates(query: string): FontMatch[] {
    if (!this.fonts) {
      throw new Error('Font matcher not initialized. Call init() first.');
    }

    const matches = fuzzysort.go(query, this.fonts);

    return matches.map((match) => ({
      id: match.target,
      confidence: Math.round(match.score * 100),
    }));
  }
}

export async function findFonts(query: string): Promise<FontMatch[]> {
  const matcher = new FontMatcher();
  await matcher.init();
  return matcher.findFontCandidates(query);
}
