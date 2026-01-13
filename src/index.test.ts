/**
 * Tests for Task 081: Tailwind CSS v3 to v4 Migration
 *
 * This test file verifies that the Tailwind CSS v3 to v4 migration was done correctly,
 * ensuring that the configuration was moved from JavaScript to CSS-first approach.
 *
 * Acceptance Criteria:
 * 1. tailwind.config.js content migrated to @theme block in src/index.css
 * 2. All custom colors (primary, secondary, error, success, warning, info, holiday, border) preserved
 * 3. All custom fonts, sizes, shadows, animations preserved
 * 4. Custom utilities (.sr-only, .focus-visible, .animate-stagger-*) migrated to @utility directive
 * 5. All @tailwind directives replaced with @import "tailwindcss"
 * 6. PostCSS configuration file removed
 * 7. CSS compiles without errors
 * 8. Existing UI components still render correctly
 */

// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

describe('Task 081: Tailwind CSS v3 to v4 Migration', () => {
  let indexCssContent: string;

  beforeEach(() => {
    const indexCssPath = join(projectRoot, 'src/index.css');
    indexCssContent = readFileSync(indexCssPath, 'utf-8');
  });

  describe('File Structure and Documentation', () => {
    it('should have index.css file', () => {
      const indexCssPath = join(projectRoot, 'src/index.css');
      expect(existsSync(indexCssPath)).toBe(true);
    });

    it('should have @import "tailwindcss" directive', () => {
      expect(indexCssContent).toContain('@import "tailwindcss"');
    });

    it('should have Tailwind v4 @theme block', () => {
      expect(indexCssContent).toContain('@theme');
    });

    it('should NOT have @tailwind directives', () => {
      expect(indexCssContent).not.toContain('@tailwind base');
      expect(indexCssContent).not.toContain('@tailwind components');
      expect(indexCssContent).not.toContain('@tailwind utilities');
    });

    it('should have @layer components for custom components', () => {
      expect(indexCssContent).toContain('@layer components');
    });

    it('should have @layer utilities for custom utilities', () => {
      expect(indexCssContent).toContain('@layer utilities');
    });

    it('should have descriptive comments', () => {
      expect(indexCssContent).toContain('Color Palette');
      expect(indexCssContent).toContain('Font Families');
      expect(indexCssContent).toContain('Animations');
      expect(indexCssContent).toContain('Keyframes');
    });
  });

  describe('PostCSS Config Removed (AC: PostCSS configuration file removed)', () => {
    it('should NOT have postcss.config.js file', () => {
      const postcssConfigPath = join(projectRoot, 'postcss.config.js');
      expect(existsSync(postcssConfigPath)).toBe(false);
    });

    it('should NOT have tailwind.config.js file', () => {
      const tailwindConfigPath = join(projectRoot, 'tailwind.config.js');
      expect(existsSync(tailwindConfigPath)).toBe(false);
    });
  });

  describe('Custom Colors Preserved (AC: All custom colors preserved)', () => {
    it('should have primary color in @theme block', () => {
      expect(indexCssContent).toContain('--color-primary: #0f172a');
      expect(indexCssContent).toContain('--color-primary-hover: #1e293b');
      expect(indexCssContent).toContain('--color-primary-light: #334155');
    });

    it('should have secondary color in @theme block', () => {
      expect(indexCssContent).toContain('--color-secondary: #64748b');
      expect(indexCssContent).toContain('--color-secondary-hover: #475569');
    });

    it('should have background color in @theme block', () => {
      expect(indexCssContent).toContain('--color-background: #ffffff');
      expect(indexCssContent).toContain('--color-background-alt: #f8fafc');
    });

    it('should have surface color in @theme block', () => {
      expect(indexCssContent).toContain('--color-surface: #ffffff');
      expect(indexCssContent).toContain('--color-surface-hover: #f1f5f9');
    });

    it('should have text colors in @theme block', () => {
      expect(indexCssContent).toContain('--color-text-primary: #0f172a');
      expect(indexCssContent).toContain('--color-text-secondary: #64748b');
      expect(indexCssContent).toContain('--color-text-muted: #94a3b8');
      expect(indexCssContent).toContain('--color-text-inverse: #ffffff');
    });

    it('should have error color in @theme block', () => {
      expect(indexCssContent).toContain('--color-error: #dc2626');
      expect(indexCssContent).toContain('--color-error-bg: #fef2f2');
      expect(indexCssContent).toContain('--color-error-hover: #b91c1c');
    });

    it('should have success color in @theme block', () => {
      expect(indexCssContent).toContain('--color-success: #16a34a');
      expect(indexCssContent).toContain('--color-success-bg: #f0fdf4');
      expect(indexCssContent).toContain('--color-success-hover: #15803d');
    });

    it('should have warning color in @theme block', () => {
      expect(indexCssContent).toContain('--color-warning: #b45309');
      expect(indexCssContent).toContain('--color-warning-bg: #fef3c7');
      expect(indexCssContent).toContain('--color-warning-hover: #92400e');
    });

    it('should have info color in @theme block', () => {
      expect(indexCssContent).toContain('--color-info: #2563eb');
      expect(indexCssContent).toContain('--color-info-bg: #eff6ff');
      expect(indexCssContent).toContain('--color-info-hover: #1d4ed8');
    });

    it('should have holiday color in @theme block', () => {
      expect(indexCssContent).toContain('--color-holiday-bg: #fee2e2');
      expect(indexCssContent).toContain('--color-holiday-text: #b91c1c');
    });

    it('should have border color in @theme block', () => {
      expect(indexCssContent).toContain('--color-border: #e2e8f0');
      expect(indexCssContent).toContain('--color-border-light: #f1f5f9');
      expect(indexCssContent).toContain('--color-border-dark: #cbd5e1');
    });
  });

  describe('Custom Typography Preserved (AC: Fonts, sizes, line-height, letter-spacing preserved)', () => {
    it('should have font families in @theme block', () => {
      expect(indexCssContent).toContain('--font-family-sans:');
      expect(indexCssContent).toContain('--font-family-mono:');
    });

    it('should have font sizes in @theme block', () => {
      expect(indexCssContent).toContain('--font-size-xs: 0.75rem');
      expect(indexCssContent).toContain('--font-size-md: 1rem');
      expect(indexCssContent).toContain('--font-size-2xl: 1.5rem');
    });

    it('should have line heights in @theme block', () => {
      expect(indexCssContent).toContain('--line-height-none: 1');
      expect(indexCssContent).toContain('--line-height-normal: 1.5');
      expect(indexCssContent).toContain('--line-height-loose: 2');
    });

    it('should have letter spacing in @theme block', () => {
      expect(indexCssContent).toContain('--letter-spacing-tight: -0.025em');
      expect(indexCssContent).toContain('--letter-spacing-wide: 0.025em');
    });
  });

  describe('Custom Spacing and Borders Preserved (AC: Border radius preserved)', () => {
    it('should have border radius in @theme block', () => {
      expect(indexCssContent).toContain('--radius-sm: 0.125rem');
      expect(indexCssContent).toContain('--radius-md: 0.25rem');
      expect(indexCssContent).toContain('--radius-full: 9999px');
    });
  });

  describe('Custom Shadows Preserved (AC: Shadows preserved)', () => {
    it('should have box shadows in @theme block', () => {
      expect(indexCssContent).toContain('--shadow-xs:');
      expect(indexCssContent).toContain('--shadow-md:');
      expect(indexCssContent).toContain('--shadow-xl:');
      expect(indexCssContent).toContain('--shadow-2xl:');
    });
  });

  describe('Custom Animations Preserved (AC: Animations preserved)', () => {
    it('should have animations in @theme block', () => {
      expect(indexCssContent).toContain('--animate-pulse-dot: pulse-dot 1.5s ease-in-out infinite');
      expect(indexCssContent).toContain('--animate-fade-in-up: fadeInUp 300ms ease-out forwards');
    });

    it('should have keyframes in @theme block', () => {
      expect(indexCssContent).toContain('@keyframes pulse-dot');
      expect(indexCssContent).toContain('@keyframes fadeInUp');
    });

    it('should have pulse-dot keyframes defined correctly', () => {
      expect(indexCssContent).toMatch(/'0%,\s*80%,\s*100%':/);
      expect(indexCssContent).toMatch(/transform:\s*'scale\(0\)'/);
      expect(indexCssContent).toMatch(/opacity:\s*'0.5'/);
      expect(indexCssContent).toMatch(/'40%':/);
      expect(indexCssContent).toMatch(/transform:\s*'scale\(1\)'/);
      expect(indexCssContent).toMatch(/opacity:\s*'1'/);
    });

    it('should have fadeInUp keyframes defined correctly', () => {
      expect(indexCssContent).toMatch(/'0%':/);
      expect(indexCssContent).toMatch(/opacity:\s*'0'/);
      expect(indexCssContent).toMatch(/transform:\s*'translateY\(20px\)'/);
      expect(indexCssContent).toMatch(/'100%':/);
      expect(indexCssContent).toMatch(/opacity:\s*'1'/);
      expect(indexCssContent).toMatch(/transform:\s*'translateY\(0\)'/);
    });
  });

  describe('Custom Utilities Migrated (AC: Custom utilities migrated to @utility directive)', () => {
    it('should have .sr-only utility with @utility directive', () => {
      expect(indexCssContent).toContain('@utility sr-only');
      expect(indexCssContent).toMatch(/@utility sr-only[\s\S]*position:\s*absolute/);
      expect(indexCssContent).toMatch(/@utility sr-only[\s\S]*width:\s*1px/);
      expect(indexCssContent).toMatch(/@utility sr-only[\s\S]*height:\s*1px/);
      expect(indexCssContent).toMatch(/@utility sr-only[\s\S]*overflow:\s*hidden/);
      expect(indexCssContent).toMatch(/@utility sr-only[\s\S]*white-space:\s*nowrap/);
      expect(indexCssContent).toMatch(/@utility sr-only[\s\S]*border:\s*0/);
      expect(indexCssContent).toMatch(/@utility sr-only[\s\S]*clip:\s*rect\(0,\s*0,\s*0,\s*0\)/);
    });

    it('should have .focus-visible-custom utility with @utility directive', () => {
      expect(indexCssContent).toContain('@utility focus-visible-custom');
      expect(indexCssContent).toMatch(/@utility focus-visible-custom[\s\S]*outline:\s*2px\s+solid/);
      expect(indexCssContent).toMatch(/@utility focus-visible-custom[\s\S]*outline-offset:\s*2px/);
    });

    it('should have .focus\\:not-focus-visible utility in @layer utilities', () => {
      expect(indexCssContent).toContain('.focus\\:not-focus-visible:focus:not(:focus-visible)');
      expect(indexCssContent).toMatch(/\.focus\\:not-focus-visible:focus:not\(:focus-visible\)\s*\{[\s\S\s]*outline:\s*none/);
    });

    it('should have .animate-stagger-0 through .animate-stagger-6 utilities', () => {
      expect(indexCssContent).toContain('@utility animate-stagger-0');
      expect(indexCssContent).toContain('@utility animate-stagger-1');
      expect(indexCssContent).toContain('@utility animate-stagger-2');
      expect(indexCssContent).toContain('@utility animate-stagger-3');
      expect(indexCssContent).toContain('@utility animate-stagger-4');
      expect(indexCssContent).toContain('@utility animate-stagger-5');
      expect(indexCssContent).toContain('@utility animate-stagger-6');
    });

    it('should have correct animation delay values', () => {
      expect(indexCssContent).toMatch(/@utility animate-stagger-0[^}]+animation-delay:\s*0ms/);
      expect(indexCssContent).toMatch(/@utility animate-stagger-1[^}]+animation-delay:\s*50ms/);
      expect(indexCssContent).toMatch(/@utility animate-stagger-2[^}]+animation-delay:\s*100ms/);
      expect(indexCssContent).toMatch(/@utility animate-stagger-3[^}]+animation-delay:\s*150ms/);
      expect(indexCssContent).toMatch(/@utility animate-stagger-4[^}]+animation-delay:\s*200ms/);
      expect(indexCssContent).toMatch(/@utility animate-stagger-5[^}]+animation-delay:\s*250ms/);
      expect(indexCssContent).toMatch(/@utility animate-stagger-6[^}]+animation-delay:\s*300ms/);
    });
  });

  describe('Container Utility Preserved (AC: Container utility preserved)', () => {
    it('should have .container utility class', () => {
      expect(indexCssContent).toContain('.container');
      expect(indexCssContent).toMatch(/\.container\s*{[^}]*@apply\s+w-full\s+mx-auto/);
    });

    it('should have .container in @layer components', () => {
      expect(indexCssContent).toContain('@layer components');
      expect(indexCssContent).toMatch(/@layer components[^}]*\.container/);
    });

    it('should have responsive .container styles', () => {
      expect(indexCssContent).toContain('@media (min-width: 640px)');
      expect(indexCssContent).toContain('@media (min-width: 768px)');
      expect(indexCssContent).toContain('@media (min-width: 1024px)');
      expect(indexCssContent).toContain('@media (min-width: 1280px)');
      expect(indexCssContent).toContain('@media (min-width: 1536px)');
    });

    it('should have correct max-width values for .container', () => {
      expect(indexCssContent).toContain('@media (min-width: 640px)');
      expect(indexCssContent).toContain('max-w-sm');
      expect(indexCssContent).toContain('@media (min-width: 768px)');
      expect(indexCssContent).toContain('max-w-md');
      expect(indexCssContent).toContain('@media (min-width: 1024px)');
      expect(indexCssContent).toContain('max-w-lg');
      expect(indexCssContent).toContain('@media (min-width: 1280px)');
      expect(indexCssContent).toContain('max-w-xl');
      expect(indexCssContent).toContain('@media (min-width: 1536px)');
      expect(indexCssContent).toContain('max-w-2xl');
    });
  });

  describe('Reduced Motion Media Query Preserved (AC: Reduced motion media query preserved)', () => {
    it('should have @media (prefers-reduced-motion: reduce) query', () => {
      expect(indexCssContent).toContain('@media (prefers-reduced-motion: reduce)');
    });

    it('should have reduced motion styles for animations', () => {
      expect(indexCssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(indexCssContent).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
      expect(indexCssContent).toMatch(/animation-iteration-count:\s*1\s*!important/);
    });

    it('should have reduced motion styles for transitions', () => {
      expect(indexCssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(indexCssContent).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
    });

    it('should apply reduced motion to all elements and pseudo-elements', () => {
      expect(indexCssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(indexCssContent).toContain('*,');
      expect(indexCssContent).toContain('*::before,');
      expect(indexCssContent).toContain('*::after');
    });
  });

  describe('File is Well-Organized (AC: File is clean and well-organized)', () => {
    it('should not be overly large (indicates cleanup was successful)', () => {
      const lineCount = indexCssContent.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(250);
    });

    it('should have Tailwind v4 import at the top', () => {
      const lines = indexCssContent.split('\n');
      expect(lines[0]).toContain('@import "tailwindcss"');
    });

    it('should have @theme block after import', () => {
      const importIndex = indexCssContent.indexOf('@import "tailwindcss"');
      const themeIndex = indexCssContent.indexOf('@theme');
      expect(themeIndex).toBeGreaterThan(importIndex);
    });

    it('should have @layer components after @theme', () => {
      const themeIndex = indexCssContent.indexOf('@theme');
      const componentsIndex = indexCssContent.indexOf('@layer components');
      expect(componentsIndex).toBeGreaterThan(themeIndex);
    });

    it('should have @layer utilities after components', () => {
      const componentsIndex = indexCssContent.indexOf('@layer components');
      const utilitiesIndex = indexCssContent.indexOf('@layer utilities');
      expect(utilitiesIndex).toBeGreaterThan(componentsIndex);
    });
  });

  describe('CSS Compiles Without Errors (AC: CSS compiles without errors)', () => {
    it('should have valid CSS syntax', () => {
      // Check that @theme block is properly formatted
      expect(indexCssContent).toContain('@theme {');
      expect(indexCssContent).toMatch(/--color-[\w-]+:\s*#[0-9a-f]{6}/);
      expect(indexCssContent).toMatch(/--font-size-[\w-]+:\s*[\d.]+rem/);
      expect(indexCssContent).toMatch(/--shadow-[\w-]+:\s*[\d\s\w-]+.*rgba?\(/);
    });

    it('should have valid @utility definitions', () => {
      expect(indexCssContent).toMatch(/@utility\s+[\w-]+\s*{/);
      expect(indexCssContent).toMatch(/@utility\s+animate-stagger-[\d]\s*{/);
    });

    it('should have valid @layer definitions', () => {
      expect(indexCssContent).toMatch(/@layer\s+components\s*{/);
      expect(indexCssContent).toMatch(/@layer\s+utilities\s*{/);
    });
  });
});
