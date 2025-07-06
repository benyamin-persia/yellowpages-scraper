const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

// Function to launch browser with proper configuration
async function launchBrowser() {
  return await puppeteer.launch({
    headless: true, // Headless for speed
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--window-size=1280,800',
    ],
    defaultViewport: {
      width: 1280,
      height: 800,
    },
  });
}

// Function to block images, stylesheets, and fonts
async function blockResources(page) {
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if ([
      'image',
      'stylesheet',
      'font',
    ].includes(req.resourceType())) {
      req.abort();
    } else {
      req.continue();
    }
  });
}

// Function to setup page with proper headers and user agent
async function setupPage(page) {
  await blockResources(page);
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  );
  await page.setExtraHTTPHeaders({
    'accept-language': 'en-US,en;q=0.9',
  });
}

module.exports = {
  launchBrowser,
  blockResources,
  setupPage
}; 