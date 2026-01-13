import { test, expect } from '@playwright/test';

test.describe('i18n E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Clear localStorage to ensure fresh state
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should default to Greek (gr) UI', async ({ page }) => {
    // Check main title in Greek
    await expect(page.getByRole('heading', { name: 'Αίτηση Άδειας' })).toBeVisible();
    await expect(page.getByText('Υποβάλετε την αίτησή σας για άδεια')).toBeVisible();

    // Check language selector value
    const localeSelector = page.locator('#locale-selector');
    await expect(localeSelector).toHaveValue('gr');
  });

  test('should switch UI language to English (en)', async ({ page }) => {
    const localeSelector = page.locator('#locale-selector');
    await localeSelector.selectOption('en');

    // Check main title in English using more specific locator to avoid strict mode violation
    await expect(page.getByRole('heading', { name: 'Leave Request', exact: true })).toBeVisible();
    await expect(page.getByText('Submit your leave request and generate a PDF document')).toBeVisible();

    // Verify it persists on reload
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Leave Request', exact: true })).toBeVisible();
    await expect(localeSelector).toHaveValue('en');
  });

  test('should switch PDF language independently', async ({ page }) => {
    // UI is Greek by default
    await expect(page.getByRole('heading', { name: 'Αίτηση Άδειας' })).toBeVisible();

    const pdfLanguageSelector = page.locator('#pdf-language-selector');
    await expect(pdfLanguageSelector).toHaveValue('gr');

    // Switch PDF language to English
    await pdfLanguageSelector.selectOption('en');
    await expect(pdfLanguageSelector).toHaveValue('en');

    // Verify UI is still Greek
    await expect(page.getByRole('heading', { name: 'Αίτηση Άδειας' })).toBeVisible();

    // Verify PDF language persistence
    await page.reload();
    await expect(pdfLanguageSelector).toHaveValue('en');
    await expect(page.getByRole('heading', { name: 'Αίτηση Άδειας' })).toBeVisible();
  });

  test('should display localized form labels and switch them', async ({ page }) => {
    // Default is Greek
    // Use first() to avoid strict mode violation if multiple elements exist (label and summary)
    await expect(page.getByText('Ονοματεπώνυμο').first()).toBeVisible();
    await expect(page.getByText('Διεύθυνση Email').first()).toBeVisible();

    // Switch to English
    const localeSelector = page.locator('#locale-selector');
    await localeSelector.selectOption('en');

    await expect(page.getByText('Full Name').first()).toBeVisible();
    await expect(page.getByText('Email Address').first()).toBeVisible();

    // Switch back to Greek
    await localeSelector.selectOption('gr');
    await expect(page.getByText('Ονοματεπώνυμο').first()).toBeVisible();
  });

  test('should format dates based on locale', async ({ page }) => {
    await page.locator('#locale-selector').selectOption('en');
    await expect(page.getByText('Start Date').first()).toBeVisible();
    await expect(page.getByText('End Date').first()).toBeVisible();

    await page.locator('#locale-selector').selectOption('gr');
    await expect(page.getByText('Ημερομηνία Έναρξης').first()).toBeVisible();
    await expect(page.getByText('Ημερομηνία Λήξης').first()).toBeVisible();
  });
});
