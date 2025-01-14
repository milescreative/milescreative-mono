const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the HTML file
  await page.goto(`file://${__dirname}/font-sample.html`);

  // Set viewport size for rendering
  await page.setViewport({
    width: 1200, // Adjust based on your layout
    height: 800,
  });

  // Capture a screenshot of the rendered page
  await page.screenshot({
    path: 'font-sample.png',
    fullPage: true, // Capture the full page
  });

  console.log('Screenshot saved as font-sample.png');
  await browser.close();
})();
