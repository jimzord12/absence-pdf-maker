import { test, expect } from '@playwright/test';

test.describe('Theme E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should load with light mode by default', async ({ page }) => {
    await page.goto('/');

    const dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('light');

    const toggleCheckbox = page.locator('label[aria-label="Toggle dark mode"] input[type="checkbox"]');
    await expect(toggleCheckbox).not.toBeChecked();

    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).not.toBe('rgb(0, 0, 0)');
  });

  test('should toggle to dark mode', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('label[aria-label="Toggle dark mode"]');
    await toggle.click();

    const dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    const toggleCheckbox = page.locator('label[aria-label="Toggle dark mode"] input[type="checkbox"]');
    await expect(toggleCheckbox).toBeChecked();

    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).not.toBe('rgb(255, 255, 255)');
  });

  test('should toggle back to light mode', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('label[aria-label="Toggle dark mode"]');
    await toggle.click();

    let dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    const toggleCheckbox = page.locator('label[aria-label="Toggle dark mode"] input[type="checkbox"]');
    await expect(toggleCheckbox).toBeChecked();

    await toggle.click();

    dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('light');
    await expect(toggleCheckbox).not.toBeChecked();
  });

  test('should fill form in dark mode', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('label[aria-label="Toggle dark mode"]');
    await toggle.click();

    const dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    await page.fill('input[placeholder="Enter your full name"]', 'John Doe');

    const fullNameField = page.locator('input[placeholder="Enter your full name"]');
    await expect(fullNameField).toBeVisible();
    await expect(fullNameField).toHaveValue('John Doe');

    const body = page.locator('body');
    const backgroundColor = await body.evaluate((el) =>
      window.getComputedStyle(el).backgroundColor
    );
    expect(backgroundColor).toBeTruthy();
  });

  test('should persist theme across page reload', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('label[aria-label="Toggle dark mode"]');
    await toggle.click();

    let dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    await page.reload();

    dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    const toggleCheckbox = page.locator('label[aria-label="Toggle dark mode"] input[type="checkbox"]');
    await expect(toggleCheckbox).toBeChecked();

    await toggle.click();

    await page.reload();

    dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('light');
    await expect(toggleCheckbox).not.toBeChecked();
  });

  test('should persist theme across browser restart', async ({ context, page }) => {
    await page.goto('/');

    const toggle = page.locator('label[aria-label="Toggle dark mode"]');
    await toggle.click();

    let dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    await page.close();
    const newPage = await context.newPage();

    await newPage.goto('/');

    dataTheme = await newPage.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    const toggleCheckbox = newPage.locator('label[aria-label="Toggle dark mode"] input[type="checkbox"]');
    await expect(toggleCheckbox).toBeChecked();

    const newToggle = newPage.locator('label[aria-label="Toggle dark mode"]');
    await newToggle.click();

    await newPage.close();
  });

  test('should support keyboard interaction for theme toggle', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('label[aria-label="Toggle dark mode"]');
    await toggle.focus();

    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    let dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('light');

    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');

    await page.keyboard.press('Space');
    await page.waitForTimeout(500);

    dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('light');

    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);

    dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');
  });

  test('should toggle theme multiple times without errors', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('label[aria-label="Toggle dark mode"]');

    for (let i = 0; i < 10; i++) {
      await toggle.click();
    }

    const dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('light');

    await toggle.click();
    expect(await page.locator('html').getAttribute('data-theme')).toBe('dark');
  });

  test('should maintain theme state during form interaction', async ({ page }) => {
    await page.goto('/');

    const toggle = page.locator('label[aria-label="Toggle dark mode"]');
    await toggle.click();

    await page.fill('input[placeholder="Enter your full name"]', 'John Doe');

    await toggle.click();

    expect(await page.locator('html').getAttribute('data-theme')).toBe('light');

    await expect(page.locator('input[placeholder="Enter your full name"]')).toHaveValue('John Doe');
  });
});
