import * as fs from 'node:fs';
import * as path from 'node:path';
import { chromium } from 'playwright';

const BASELINE_DIR = path.resolve(process.cwd(), process.env.BASELINE_DIR || 'docs/baselines');
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

async function captureBaselines() {
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    console.log(`Navigating to ${APP_URL}...`);
    await page.goto(APP_URL);

    // Wait for the app to be ready
    await page.waitForSelector('section[aria-labelledby="personal-details-heading"]');

    const sections = [
      { name: 'personal-details', selector: 'section[aria-labelledby="personal-details-heading"]' },
      {
        name: 'employment-details',
        selector: 'section[aria-labelledby="employment-details-heading"]',
      },
      { name: 'leave-details', selector: 'section[aria-labelledby="leave-details-heading"]' },
    ];

    for (const section of sections) {
      console.log(`Capturing ${section.name}...`);
      const element = await page.$(section.selector);
      if (element) {
        await element.screenshot({ path: path.join(BASELINE_DIR, `${section.name}.png`) });
      } else {
        console.warn(`Warning: Could not find selector ${section.selector}`);
      }
    }

    console.log('Baselines captured successfully in docs/baselines/');
  } catch (error) {
    console.error('Error capturing baselines:', error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

captureBaselines();
