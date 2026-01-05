/**
 * Tests for Task 035: Tailwind CSS Cleanup - globals.css
 *
 * This test file verifies that the cleanup of src/index.css was done correctly,
 * ensuring that redundant CSS removed while preserving necessary custom styles.
 *
 * Acceptance Criteria:
 * 1. Duplicate CSS variables removed (colors, spacing, typography now in Tailwind)
 * 2. Reset styles removed (Tailwind Preflight handles this)
 * 3. Custom animations (fadeInUp, pulse-dot) preserved (defined in tailwind.config.js)
 * 4. Accessibility utilities (sr-only, focus-visible) preserved
 * 5. Container utility preserved
 * 6. Reduced motion media query preserved
 * 7. File is clean and well-documented
 * 8. No unused CSS rules remain
 */

// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

describe('Task 035: Tailwind CSS Cleanup - globals.css', () => {
  let indexCssContent: string;
  let tailwindConfigContent: string;

  beforeEach(() => {
    const indexCssPath = join(projectRoot, 'src/index.css');
    const tailwindConfigPath = join(projectRoot, 'tailwind.config.js');

    indexCssContent = readFileSync(indexCssPath, 'utf-8');
    tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');
  });

  describe('File Structure and Documentation', () => {
    it('should have index.css file', () => {
      const indexCssPath = join(projectRoot, 'src/index.css');
      expect(existsSync(indexCssPath)).toBe(true);
    });

    it('should have a clean and well-documented file structure', () => {
      // Tailwind v4 uses @import instead of directives
      expect(indexCssContent).toContain('Tailwind CSS v4');
      expect(indexCssContent).toContain('Tailwind Components Layer');
      expect(indexCssContent).toContain('Tailwind Utilities Layer');

      // Should have descriptive comments for custom styles
      expect(indexCssContent).toContain('Container utility class');
      expect(indexCssContent).toContain('Accessibility: Screen reader only');
      expect(indexCssContent).toContain('Focus visible for keyboard navigation');
      expect(indexCssContent).toContain('Animation delay classes');
      expect(indexCssContent).toContain('Respect user\'s motion preferences');
    });

    it('should not be overly large (indicates cleanup was successful)', () => {
      // After cleanup, file should be significantly smaller than before
      // Before cleanup could be 200+ lines, after should be ~80-100 lines
      const lineCount = indexCssContent.split('\n').length;
      expect(lineCount).toBeLessThanOrEqual(100);
    });
  });

  describe('Tailwind v4 Import', () => {
    it('should include @import "tailwindcss" directive', () => {
      expect(indexCssContent).toContain('@import "tailwindcss"');
    });

    it('should NOT have @tailwind directives (replaced by @import)', () => {
      expect(indexCssContent).not.toContain('@tailwind base');
      expect(indexCssContent).not.toContain('@tailwind components');
      expect(indexCssContent).not.toContain('@tailwind utilities');
    });
  });

  describe('CSS Variables Removed (AC: Duplicate CSS variables removed)', () => {
    it('should NOT have CSS variables for colors', () => {
      expect(indexCssContent).not.toMatch(/--color-/);
      expect(indexCssContent).not.toMatch(/--primary-/);
      expect(indexCssContent).not.toMatch(/--secondary-/);
      expect(indexCssContent).not.toMatch(/--background-/);
      expect(indexCssContent).not.toMatch(/--surface-/);
      expect(indexCssContent).not.toMatch(/--text-/);
      expect(indexCssContent).not.toContain(':root');
    });

    it('should NOT have CSS variables for spacing', () => {
      expect(indexCssContent).not.toMatch(/--spacing-/);
      expect(indexCssContent).not.toMatch(/--space-/);
      expect(indexCssContent).not.toMatch(/--padding-/);
      expect(indexCssContent).not.toMatch(/--margin-/);
    });

    it('should NOT have CSS variables for typography', () => {
      expect(indexCssContent).not.toMatch(/--font-/);
      expect(indexCssContent).not.toMatch(/--text-/);
      expect(indexCssContent).not.toMatch(/--size-/);
      expect(indexCssContent).not.toMatch(/--line-height-/);
      expect(indexCssContent).not.toMatch(/--letter-spacing-/);
    });

    it('should NOT have CSS variables for border radius', () => {
      expect(indexCssContent).not.toMatch(/--radius-/);
    });

    it('should NOT have CSS variables for shadows', () => {
      expect(indexCssContent).not.toMatch(/--shadow-/);
    });

    it('should NOT have CSS variables for z-index', () => {
      expect(indexCssContent).not.toMatch(/--z-/);
    });
  });

  describe('Reset Styles Removed (AC: Reset styles removed - Tailwind Preflight handles this)', () => {
    it('should NOT have custom reset for box-sizing', () => {
      expect(indexCssContent).not.toMatch(/\*\s*{[^}]*box-sizing:\s*border-box/);
      expect(indexCssContent).not.toMatch(/html\s*{[^}]*box-sizing:\s*border-box/);
    });

    it('should NOT have custom html element reset', () => {
      expect(indexCssContent).not.toMatch(/html\s*{[^}]*font-size:/);
      expect(indexCssContent).not.toMatch(/html\s*{[^}]*line-height:/);
      expect(indexCssContent).not.toMatch(/html\s*{[^}]*-webkit-font-smoothing:/);
    });

    it('should NOT have custom body element reset', () => {
      expect(indexCssContent).not.toMatch(/body\s*{[^}]*margin:\s*0/);
      expect(indexCssContent).not.toMatch(/body\s*{[^}]*padding:\s*0/);
    });

    it('should NOT have custom heading resets', () => {
      expect(indexCssContent).not.toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*{[^}]*margin:/);
      expect(indexCssContent).not.toMatch(/h1\s*{[^}]*font-size:/);
    });

    it('should NOT use @layer base for custom resets', () => {
      expect(indexCssContent).not.toMatch(/@layer\s+base/);
    });

    it('should NOT have list-style reset', () => {
      expect(indexCssContent).not.toMatch(/ul,\s*ol\s*{[^}]*list-style:/);
    });

    it('should NOT have image reset', () => {
      expect(indexCssContent).not.toMatch(/img\s*{[^}]*display:\s*block/);
      expect(indexCssContent).not.toMatch(/img\s*{[^}]*max-width:/);
    });

    it('should NOT have button/anchor reset', () => {
      expect(indexCssContent).not.toMatch(/button\s*{[^}]*cursor:/);
      expect(indexCssContent).not.toMatch(/a\s*{[^}]*text-decoration:/);
    });
  });

  describe('Custom Animations Preserved (AC: Custom animations preserved)', () => {
    it('should have fadeInUp animation defined in tailwind.config.js', () => {
      expect(tailwindConfigContent).toContain("'fade-in-up'");
      expect(tailwindConfigContent).toContain('fadeInUp');
    });

    it('should have pulse-dot animation defined in tailwind.config.js', () => {
      expect(tailwindConfigContent).toContain("'pulse-dot'");
      expect(tailwindConfigContent).toContain('pulse-dot');
    });

    it('should have fadeInUp keyframes in tailwind.config.js', () => {
      expect(tailwindConfigContent).toContain('fadeInUp:');
      expect(tailwindConfigContent).toMatch(/'0%':/);
      expect(tailwindConfigContent).toMatch(/opacity:\s*'0'/);
      expect(tailwindConfigContent).toMatch(/transform:\s*'translateY\(20px\)'/);
      expect(tailwindConfigContent).toMatch(/'100%':/);
      expect(tailwindConfigContent).toMatch(/opacity:\s*'1'/);
      expect(tailwindConfigContent).toMatch(/transform:\s*'translateY\(0\)'/);
    });

    it('should have pulse-dot keyframes in tailwind.config.js', () => {
      expect(tailwindConfigContent).toContain("'pulse-dot':");
      expect(tailwindConfigContent).toMatch(/'0%,\s*80%,\s*100%':/);
      expect(tailwindConfigContent).toMatch(/transform:\s*'scale\(0\)'/);
      expect(tailwindConfigContent).toMatch(/opacity:\s*'0.5'/);
      expect(tailwindConfigContent).toMatch(/'40%':/);
      expect(tailwindConfigContent).toMatch(/transform:\s*'scale\(1\)'/);
      expect(tailwindConfigContent).toMatch(/opacity:\s*'1'/);
    });

    it('should NOT have @keyframes definitions in index.css (they are in tailwind.config.js)', () => {
      expect(indexCssContent).not.toContain('@keyframes');
    });

    it('should have animation delay utilities in index.css', () => {
      expect(indexCssContent).toContain('.animate-stagger-0');
      expect(indexCssContent).toContain('.animate-stagger-1');
      expect(indexCssContent).toContain('.animate-stagger-2');
      expect(indexCssContent).toContain('.animate-stagger-3');
      expect(indexCssContent).toContain('.animate-stagger-4');
      expect(indexCssContent).toContain('.animate-stagger-5');
      expect(indexCssContent).toContain('.animate-stagger-6');
    });

    it('should have correct animation delay values', () => {
      expect(indexCssContent).toMatch(/\.animate-stagger-0[^}]*animation-delay:\s*0ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-1[^}]*animation-delay:\s*50ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-2[^}]*animation-delay:\s*100ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-3[^}]*animation-delay:\s*150ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-4[^}]*animation-delay:\s*200ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-5[^}]*animation-delay:\s*250ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-6[^}]*animation-delay:\s*300ms/);
    });
  });

  describe('Accessibility Utilities Preserved (AC: Accessibility utilities preserved)', () => {
    it('should have .sr-only utility class', () => {
      expect(indexCssContent).toContain('.sr-only');
    });

    it('should have .sr-only with correct styles', () => {
      expect(indexCssContent).toMatch(/\.sr-only\s*{[^}]*@apply\s+absolute/);
      expect(indexCssContent).toMatch(/\.sr-only\s*{[^}]*w-1/);
      expect(indexCssContent).toMatch(/\.sr-only\s*{[^}]*h-1/);
      expect(indexCssContent).toMatch(/\.sr-only\s*{[^}]*overflow-hidden/);
      expect(indexCssContent).toMatch(/\.sr-only\s*{[^}]*whitespace-nowrap/);
      expect(indexCssContent).toMatch(/\.sr-only\s*{[^}]*border-0/);
    });

    it('should have .focus-visible utility class', () => {
      expect(indexCssContent).toContain('.focus-visible');
    });

    it('should have .focus-visible with correct outline styles', () => {
      expect(indexCssContent).toMatch(/\.focus-visible\s*{[^}]*outline:\s*2px\s+solid/);
      expect(indexCssContent).toMatch(/\.focus-visible\s*{[^}]*outline-offset:\s*2px/);
    });

    it('should have .focus\\:not-focus-visible utility', () => {
      expect(indexCssContent).toContain('.focus\\:not-focus-visible:focus:not(:focus-visible)');
    });

    it('should have .focus\\:not-focus-visible that removes outline', () => {
      expect(indexCssContent).toMatch(/\.focus\\:not-focus-visible:focus:not\(:focus-visible\)\s*{[^}]*@apply\s+outline-none/);
    });
  });

  describe('Container Utility Preserved (AC: Container utility preserved)', () => {
    it('should have .container utility class', () => {
      expect(indexCssContent).toContain('.container');
    });

    it('should have .container in @layer components', () => {
      expect(indexCssContent).toContain('@layer components');
      expect(indexCssContent).toMatch(/@layer components[^}]*\.container/);
    });

    it('should have .container with w-full and mx-auto', () => {
      expect(indexCssContent).toMatch(/\.container\s*{[^}]*@apply\s+w-full\s+mx-auto/);
    });

    it('should have responsive .container styles', () => {
      expect(indexCssContent).toContain('@media (min-width: 640px)');
      expect(indexCssContent).toContain('@media (min-width: 768px)');
      expect(indexCssContent).toContain('@media (min-width: 1024px)');
      expect(indexCssContent).toContain('@media (min-width: 1280px)');
      expect(indexCssContent).toContain('@media (min-width: 1536px)');
    });

    it('should have correct max-width values for .container', () => {
      // Check that max-w-sm is used at 640px breakpoint
      expect(indexCssContent).toContain('@media (min-width: 640px)');
      expect(indexCssContent).toContain('max-w-sm');

      // Check that max-w-md is used at 768px breakpoint
      expect(indexCssContent).toContain('@media (min-width: 768px)');
      expect(indexCssContent).toContain('max-w-md');

      // Check that max-w-lg is used at 1024px breakpoint
      expect(indexCssContent).toContain('@media (min-width: 1024px)');
      expect(indexCssContent).toContain('max-w-lg');

      // Check that max-w-xl is used at 1280px breakpoint
      expect(indexCssContent).toContain('@media (min-width: 1280px)');
      expect(indexCssContent).toContain('max-w-xl');

      // Check that max-w-2xl is used at 1536px breakpoint
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

  describe('No Unused CSS Rules (AC: No unused CSS rules remain)', () => {
    it('should NOT have unused CSS variables', () => {
      // Check for any CSS variable declarations that might have been missed
      const cssVariablePattern = /--[\w-]+:/g;
      const matches = indexCssContent.match(cssVariablePattern);
      if (matches) {
        // If any CSS variables exist, they should be minimal and only for essential things
        // After cleanup, there should be NO CSS variables in index.css
        expect(matches.length).toBe(0);
      }
    });

    it('should NOT have empty rulesets', () => {
      // Check for empty curly braces
      const emptyRulesetPattern = /\{\s*\}/g;
      const matches = indexCssContent.match(emptyRulesetPattern);
      if (matches) {
        expect(matches.length).toBe(0);
      }
    });

    it('should NOT have unused @layer declarations', () => {
      // Should only use @layer components and @layer utilities
      // @layer base should not be used as it's covered by @tailwind base
      expect(indexCssContent).not.toMatch(/@layer\s+base/);
    });

    it('should NOT have unused reset rules', () => {
      // Check for common reset patterns that should be removed
      expect(indexCssContent).not.toMatch(/\*\s*{[^}]*margin:\s*0/);
      expect(indexCssContent).not.toMatch(/\*\s*{[^}]*padding:\s*0/);
      expect(indexCssContent).not.toMatch(/html,\s*body\s*{[^}]*height:\s*100%/);
    });
  });

  describe('Tailwind Layers Used Correctly', () => {
    it('should use @layer components for component styles', () => {
      expect(indexCssContent).toContain('@layer components');
    });

    it('should use @layer utilities for utility styles', () => {
      expect(indexCssContent).toContain('@layer utilities');
    });

    it('should have .container in @layer components', () => {
      const componentsLayerMatch = indexCssContent.match(/@layer components\s*{([^}]*)}/s);
      expect(componentsLayerMatch).toBeTruthy();
      if (componentsLayerMatch) {
        expect(componentsLayerMatch[1]).toContain('.container');
      }
    });

    it('should have utilities in @layer utilities', () => {
      // Check that @layer utilities exists
      expect(indexCssContent).toContain('@layer utilities');

      // Check that utilities are defined in the file
      expect(indexCssContent).toContain('.sr-only');
      expect(indexCssContent).toContain('.focus-visible');
    });
  });

  describe('Tailwind Config Integration', () => {
    it('should have colors configured in tailwind.config.js', () => {
      expect(tailwindConfigContent).toContain('colors:');
      expect(tailwindConfigContent).toContain('primary:');
      expect(tailwindConfigContent).toContain('secondary:');
      expect(tailwindConfigContent).toContain('background:');
      expect(tailwindConfigContent).toContain('text:');
      expect(tailwindConfigContent).toContain('error:');
      expect(tailwindConfigContent).toContain('success:');
      expect(tailwindConfigContent).toContain('warning:');
      expect(tailwindConfigContent).toContain('info:');
    });

    it('should have typography configured in tailwind.config.js', () => {
      expect(tailwindConfigContent).toContain('fontFamily:');
      expect(tailwindConfigContent).toContain('fontSize:');
      expect(tailwindConfigContent).toContain('fontWeight:');
      expect(tailwindConfigContent).toContain('lineHeight:');
      expect(tailwindConfigContent).toContain('letterSpacing:');
    });

    it('should have spacing configured in tailwind.config.js', () => {
      // Spacing is in Tailwind by default, but we should verify extend is present
      expect(tailwindConfigContent).toContain('extend:');
    });

    it('should have custom animations configured in tailwind.config.js', () => {
      expect(tailwindConfigContent).toContain('animation:');
      expect(tailwindConfigContent).toContain('keyframes:');
    });
  });

  describe('Integration Verification', () => {
    it('should ensure styles work together - animations defined in config, delays in CSS', () => {
      // Animations are in tailwind.config.js
      expect(tailwindConfigContent).toMatch(/animation:\s*{[^}]*'pulse-dot'/);
      expect(tailwindConfigContent).toMatch(/animation:\s*{[^}]*'fade-in-up'/);

      // Animation delay utilities are in index.css
      expect(indexCssContent).toContain('.animate-stagger-0');
      expect(indexCssContent).toContain('.animate-stagger-6');
    });

    it('should ensure Tailwind utilities are used in custom styles', () => {
      // Should use @apply with Tailwind utilities
      expect(indexCssContent).toContain('@apply');

      // Check that Tailwind utility classes are used in @apply directives
      expect(indexCssContent).toContain('w-full');
      expect(indexCssContent).toContain('mx-auto');
      expect(indexCssContent).toContain('absolute');
    });
  });
});
