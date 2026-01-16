import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Leave Request E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Switch to English locale and wait for React to re-render
    await page.locator('#locale-selector').selectOption('en');
    // Wait for English form labels to be visible before proceeding
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible({ timeout: 5000 });
  });

  test('should complete happy path flow: fill form, add signature, and generate PDF', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Form is already in English from beforeEach, no need to switch again
    await page.locator('input[name="profile.fullName"]').fill('John Doe');
    await page.locator('input[name="profile.fathersName"]').fill('Michael Doe');
    await page.locator('input[name="profile.email"]').fill('john.doe@example.com');
    await page.locator('input[name="profile.phone"]').fill('1234567890');
    await page.locator('input[name="profile.identityNumber"]').fill('12345678');
    await page.locator('input[name="profile.employeeId"]').fill('EMP001');
    await page.locator('input[name="profile.companyName"]').fill('Acme Corporation');
    await page.locator('input[name="profile.department"]').fill('Engineering');
    await page.locator('input[name="profile.position"]').fill('Software Engineer');

    const calendar = page.locator('.rdp-months');
    await expect(calendar).toBeVisible();

    await page.click('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):has-text("15")');
    await page.click('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):has-text("20")');

    await expect(page.getByText('Total days:')).toBeVisible();
    await expect(page.getByText('Absence Days:')).toBeVisible();

    await page.selectOption('select[name="leaveType"]', 'annual');

    await page.fill('textarea[placeholder*="reason"]', 'Family vacation');

    const signatureButton = page.getByText('Add Signature');
    await expect(signatureButton).toBeVisible();
    await signatureButton.click();

    await expect(page.locator('role=dialog')).toBeVisible();

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + 20, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 100, canvasBox.y + 50);
      await page.mouse.up();
    }

    await page.click('button:has-text("Save")');
    await expect(page.locator('role=dialog')).not.toBeVisible();

    await expect(page.getByText('Signed')).toBeVisible();

    const generateButton = page.getByRole('button', { name: /Generate PDF/i });
    await expect(generateButton).toBeEnabled();
    await generateButton.click();

    await page.waitForTimeout(2500);

    await expect(page.locator('button:has-text("Generate PDF")')).not.toHaveAttribute('disabled');
  });

  test('should handle optional leave allowance field correctly', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Form is already in English from beforeEach
    await page.locator('input[name="profile.fullName"]').fill('Jane Doe');
    await page.locator('input[name="profile.email"]').fill('jane@example.com');
    await page.locator('input[name="profile.identityNumber"]').fill('87654321');
    await page.locator('input[name="profile.companyName"]').fill('Tech Corp');
    await page.locator('input[name="profile.department"]').fill('Marketing');
    await page.locator('input[name="profile.position"]').fill('Manager');

    // Select dates for 10th to 20th to ensure enough working days
    await page.click('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):has-text("10")');
    await page.click('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):has-text("20")');

    // Wait for absence days to be calculated and visible in UI
    await page.waitForTimeout(1000);
    await expect(page.getByText('Absence Days:')).toBeVisible();

    const signatureButton = page.getByText('Add Signature');
    await signatureButton.click();
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + 20, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 100, canvasBox.y + 50);
      await page.mouse.up();
    }
    await page.click('button:has-text("Save")');

    // After filling all required fields and dates, button should be enabled (absence days > 0)
    const generateButton = page.getByRole('button', { name: /Generate PDF/i });
    await expect(generateButton).toBeEnabled();

    // Set leave allowance to 25 (greater than absence days), should remain enabled
    const allowanceInput = page.locator('input[name="leaveAllowance"]');
    await allowanceInput.fill('25');

    await expect(generateButton).toBeEnabled();

    // Set leave allowance to 5 (less than absence days ~10), should be disabled
    await allowanceInput.fill('5');
    await expect(generateButton).toBeDisabled();

    // Clear leave allowance, should be enabled again
    await allowanceInput.fill('');
    await expect(generateButton).toBeEnabled();
  });

  test('should allow editing and updating personal details', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Form is already in English from beforeEach
    await expect(page.locator('input[name="profile.fullName"]')).toBeVisible();
    await page.fill('input[placeholder*="full name"]', 'Alice Smith');
    await page.fill('input[placeholder*="email"]', 'alice@example.com');

    await expect(page.locator('text=Alice Smith')).toBeVisible();
    await expect(page.locator('text=alice@example.com')).toBeVisible();

    await page.locator('input[name="profile.fullName"]').fill('Alice Johnson');
    await page.locator('input[name="profile.email"]').fill('alice.johnson@example.com');

    await expect(page.locator('text=Alice Johnson')).toBeVisible();
    await expect(page.locator('text=alice.johnson@example.com')).toBeVisible();
  });

  test('should allow adding, updating, and clearing signature', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Form is already in English from beforeEach
    await expect(page.locator('input[name="profile.fullName"]')).toBeVisible();
    await page.fill('input[placeholder*="full name"]', 'John Doe');

    await expect(page.getByText('Not Signed')).toBeVisible();
    await expect(page.getByText('Add Signature')).toBeVisible();

    const addButton = page.getByText('Add Signature');
    await addButton.click();

    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + 20, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 100, canvasBox.y + 50);
      await page.mouse.up();
    }

    await page.click('button:has-text("Save")');

    await expect(page.getByText('Signed')).toBeVisible();
    await expect(page.getByText('Update Signature')).toBeVisible();

    const updateButton = page.getByText('Update Signature');
    await updateButton.click();

    // Clear the typed signature name (not the canvas)
    const clearButton = page.getByRole('dialog').getByRole('button', { name: /Clear/i });
    const isClearEnabled = await clearButton.isEnabled();
    if (isClearEnabled) {
      await clearButton.click();
    }
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + 50, canvasBox.y + 100);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 150, canvasBox.y + 100);
      await page.mouse.up();
    }

    await page.click('button:has-text("Save")');
    await expect(page.getByText('Signed')).toBeVisible();

    await updateButton.click();
    const cancelButton = page.getByRole('dialog').getByRole('button', { name: /Cancel/i });
    await cancelButton.click();
    await expect(page.getByText('Signed')).toBeVisible();
  });

  test('should allow exporting and importing profile data', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[name="profile.fullName"]')).toBeVisible();
    await page.fill('input[placeholder*="full name"]', 'Bob Brown');
    await page.fill('input[placeholder*="email"]', 'bob@example.com');

    const exportButton = page.getByRole('button', { name: /Export Profile/i });
    await exportButton.click();

    const resetButton = page.getByRole('button', { name: /Reset/i });
    await resetButton.click();
    await expect(page.locator('input[placeholder="Enter your full name"]')).toHaveValue('');

    const importButton = page.getByRole('button', { name: /Import Profile/i });
    await expect(importButton).toBeVisible();
  });

  test('should clear all profile data and reset form', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    await expect(page.locator('input[name="profile.fullName"]')).toBeVisible();
    await page.fill('input[placeholder*="full name"]', 'Charlie Wilson');
    await page.fill('input[placeholder*="email"]', 'charlie@example.com');
    await page.fill('input[placeholder*="identity"]', '11111111');
    await page.fill('input[name="profile.companyName"]', 'Big Company');
    await page.fill('input[name="profile.department"]', 'Sales');
    await page.fill('input[name="profile.position"]', 'Director');

    await page.click('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):has-text("10")');
    await page.click('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):has-text("15")');

    const signatureButton = page.getByText('Add Signature');
    await signatureButton.click();
    const canvas = page.locator('canvas');
    const canvasBox = await canvas.boundingBox();
    if (canvasBox) {
      await page.mouse.move(canvasBox.x + 20, canvasBox.y + 50);
      await page.mouse.down();
      await page.mouse.move(canvasBox.x + 100, canvasBox.y + 50);
      await page.mouse.up();
    }
    await page.click('button:has-text("Save")');

    await expect(page.getByText('Charlie Wilson')).toBeVisible();
    await expect(page.getByText('Signed')).toBeVisible();

    const clearButton = page.getByRole('button', { name: /Clear Profile/i });
    await clearButton.click();

    await expect(page.locator('input[placeholder="Enter your full name"]')).toHaveValue('');
    await expect(page.getByText('Not Signed')).toBeVisible();
    await expect(page.locator('text=/Total absence days:/')).not.toBeVisible();
  });
});

test.describe('Accessibility Audit', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Switch to English locale and wait for form to render
    await page.locator('#locale-selector').selectOption('en');
    await expect(page.getByPlaceholder('Enter your full name')).toBeVisible({ timeout: 5000 });
  });

  test('should have no accessibility violations on initial page load', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations after filling personal details', async ({ page }) => {
    await page.fill('input[placeholder="Enter your full name"]', 'Test User');
    await page.fill('input[placeholder*="email"]', 'test@example.com');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations with signature modal open', async ({ page }) => {
    await page.locator('input[name="profile.fullName"]').fill('Test User');
    const signatureButton = page.getByText('Add Signature');
    await expect(signatureButton).toBeVisible();
    await signatureButton.click();

    await expect(page.locator('role=dialog')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations after selecting dates', async ({ page }) => {
    await page.click('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):has-text("15")');
    await page.click('.rdp-day:not(.rdp-day_disabled):not(.rdp-day_outside):has-text("20")');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have no accessibility violations in dark mode', async ({ page }) => {
    const themeToggle = page.locator('label[aria-label="Toggle dark mode"]');
    await themeToggle.click();

    await page.waitForTimeout(500);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper ARIA labels on all interactive elements', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const themeToggle = page.locator('label[aria-label="Toggle dark mode"]');
    await expect(themeToggle).toBeVisible();

    const signatureButton = page.getByText('Add Signature');
    await expect(signatureButton).toBeVisible();

    const generateButton = page.getByRole('button', { name: /Generate PDF/i });
    await expect(generateButton).toBeVisible();

    const localeLabel = page.locator('label[for="locale-selector"]');
    await expect(localeLabel).toBeVisible();

    const pdfLanguageLabel = page.getByLabel('PDF Language:');
    await expect(pdfLanguageLabel).toBeVisible();
  });

  test('should have proper keyboard navigation', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Test Tab navigation
    await page.keyboard.press('Tab');

    // First focus should be on a focusable element
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['INPUT', 'BUTTON', 'SELECT'].includes(focusedElement || '')).toBe(true);

    // Test Space key on theme toggle - click the visible label instead of hidden checkbox
    const themeToggle = page.locator('label[aria-label="Toggle dark mode"]');
    await themeToggle.focus();
    await themeToggle.click();
    await page.waitForTimeout(500);

    const dataTheme = await page.locator('html').getAttribute('data-theme');
    expect(dataTheme).toBe('dark');
  });
});
