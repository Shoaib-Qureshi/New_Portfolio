import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { env } from 'node:process';
import { chromium } from 'playwright';

const url = process.env.URL || 'http://127.0.0.1:3000';
const viewports = [
  { name: 'desktop', width: 1440, height: 950 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'mobile', width: 390, height: 844 },
];

const chromiumPath = join(
  env.LOCALAPPDATA || '',
  'ms-playwright',
  'chromium-1223',
  'chrome-win64',
  'chrome.exe',
);
const executablePath = env.PLAYWRIGHT_CHROME_PATH || (existsSync(chromiumPath) ? chromiumPath : undefined);

const browser = await chromium.launch({
  executablePath,
  headless: true,
});
const results = [];

for (const viewport of viewports) {
  const page = await browser.newPage({ viewport });
  const consoleErrors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(2800);

  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    const body = document.body;
    const overflowing = [...document.querySelectorAll('*')]
      .filter((el) => {
        if (el.closest('[data-visual-ignore="true"]')) return false;
        const rect = el.getBoundingClientRect();
        return rect.width > 0 && (rect.left < -2 || rect.right > window.innerWidth + 2);
      })
      .slice(0, 8)
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        className: typeof el.className === 'string' ? el.className.slice(0, 90) : '',
        rect: el.getBoundingClientRect().toJSON(),
      }));
    return {
      title: document.title,
      width: window.innerWidth,
      height: window.innerHeight,
      scrollWidth: Math.max(doc.scrollWidth, body.scrollWidth),
      scrollHeight: Math.max(doc.scrollHeight, body.scrollHeight),
      overflowing,
      navVisible: Boolean(document.querySelector('nav')),
      heroTextVisible: Boolean([...document.querySelectorAll('h1')].find((el) => el.textContent?.includes('Shoaib'))),
    };
  });

  await page.screenshot({ path: `visual-${viewport.name}.png`, fullPage: false });
  results.push({ viewport, consoleErrors, metrics });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
