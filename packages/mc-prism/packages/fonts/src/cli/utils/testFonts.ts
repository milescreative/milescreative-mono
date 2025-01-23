import { findFonts } from './fontMatcher';
import { getFontDetails } from './getFontDetails';

async function testFontSearch(query: string) {
  try {
    // First, find matching fonts
    const matches = await findFonts(query);
    console.log('\nFont matches:', matches);

    // If we found matches, get details for the first match
    const topMatch = matches[0];
    if (topMatch) {
      console.log('\nGetting details for top match:', topMatch.id);

      const details = await getFontDetails(topMatch.id);
      if (details) {
        console.log('\nFont details:');
        console.log('- Family:', details.family);
        console.log('- Category:', details.category);
        console.log('- Weights:', details.weights);
        console.log('- Styles:', details.styles);
        console.log('- Subsets:', details.subsets);
        console.log('- Variable:', details.variable);
      } else {
        console.log('No details found for', topMatch.id);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test with a font name from command line argument, or default to 'inter'
const query = process.argv[2] || 'inter';
testFontSearch(query);
