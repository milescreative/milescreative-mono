import { type Font, FontsResponseSchema } from '../schemas/fontSchema';
import fetch from 'node-fetch';

export async function getFontDetails(fontName: string): Promise<Font | null> {
  try {
    const response = await fetch('https://api.fontsource.org/v1/fonts');
    const data = await response.json();

    // Validate the entire response array
    const fonts = FontsResponseSchema.parse(data);

    // Find the exact font by name
    const font = fonts.find(
      (f) =>
        f.family.toLowerCase() === fontName.toLowerCase() ||
        f.id.toLowerCase() === fontName.toLowerCase()
    );

    if (!font) {
      return null;
    }

    return font;
  } catch (error) {
    console.error('Error fetching font details:', error);
    return null;
  }
}
