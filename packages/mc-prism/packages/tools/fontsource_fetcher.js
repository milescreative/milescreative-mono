const https = require('https');

class FontSourceFetcher {
  constructor() {
    this.BASE_URL = 'https://api.fontsource.org';
  }

  getFontList() {
    return new Promise((resolve, reject) => {
      https
        .get(`${this.BASE_URL}/fontlist`, (response) => {
          let data = '';

          response.on('data', (chunk) => {
            data += chunk;
          });

          response.on('end', () => {
            if (response.statusCode === 200) {
              resolve(JSON.parse(data));
            } else {
              reject(
                new Error(`Failed to fetch font list: ${response.statusCode}`)
              );
            }
          });
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }
}

// Only run this if the file is run directly
if (require.main === module) {
  (async () => {
    const fetcher = new FontSourceFetcher();
    try {
      const fonts = await fetcher.getFontList();
      console.log('API Response Structure:');
      console.log(typeof fonts);
      console.log('\nFirst few entries:');
      Object.entries(fonts)
        .slice(0, 3)
        .forEach(([key, value]) => {
          console.log(`\nKey: ${key}`);
          console.log(`Value: ${value}`);
        });
    } catch (error) {
      console.error(error.message);
    }
  })();
}
