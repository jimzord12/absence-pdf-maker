// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const projectRoot = process.cwd();

describe('Global Styles', () => {
  let globalsCssContent: string;
  let mainTsxContent: string;

  beforeEach(() => {
    const globalsCssPath = join(projectRoot, 'src/shared/styles/globals.css');
    const mainTsxPath = join(projectRoot, 'src/main.tsx');

    globalsCssContent = readFileSync(globalsCssPath, 'utf-8');
    mainTsxContent = readFileSync(mainTsxPath, 'utf-8');
  });

  describe('File Existence and Import', () => {
    it('should have globals.css file', () => {
      const globalsCssPath = join(projectRoot, 'src/shared/styles/globals.css');
      expect(existsSync(globalsCssPath)).toBe(true);
    });

    it('should have globals.css imported in main.tsx', () => {
      expect(mainTsxContent).toContain("./shared/styles/globals.css");
      expect(mainTsxContent).toMatch(/import\s+['"].*globals\.css['"]/);
    });
  });

  describe('Color Variables', () => {
    it('should define primary color variables', () => {
      expect(globalsCssContent).toContain('--color-primary:');
      expect(globalsCssContent).toContain('--color-primary-hover:');
      expect(globalsCssContent).toContain('--color-primary-light:');
    });

    it('should define secondary color variables', () => {
      expect(globalsCssContent).toContain('--color-secondary:');
      expect(globalsCssContent).toContain('--color-secondary-hover:');
      expect(globalsCssContent).toContain('--color-secondary-light:');
    });

    it('should define background color variables', () => {
      expect(globalsCssContent).toContain('--color-background:');
      expect(globalsCssContent).toContain('--color-background-alt:');
      expect(globalsCssContent).toContain('--color-surface:');
      expect(globalsCssContent).toContain('--color-surface-hover:');
    });

    it('should define text color variables', () => {
      expect(globalsCssContent).toContain('--color-text-primary:');
      expect(globalsCssContent).toContain('--color-text-secondary:');
      expect(globalsCssContent).toContain('--color-text-muted:');
      expect(globalsCssContent).toContain('--color-text-inverse:');
    });

    it('should define semantic color variables (error, success, warning, info)', () => {
      expect(globalsCssContent).toContain('--color-error:');
      expect(globalsCssContent).toContain('--color-error-bg:');
      expect(globalsCssContent).toContain('--color-success:');
      expect(globalsCssContent).toContain('--color-success-bg:');
      expect(globalsCssContent).toContain('--color-warning:');
      expect(globalsCssContent).toContain('--color-warning-bg:');
      expect(globalsCssContent).toContain('--color-info:');
      expect(globalsCssContent).toContain('--color-info-bg:');
    });

    it('should define border color variables', () => {
      expect(globalsCssContent).toContain('--color-border:');
      expect(globalsCssContent).toContain('--color-border-light:');
      expect(globalsCssContent).toContain('--color-border-dark:');
    });

    it('should define focus ring variable', () => {
      expect(globalsCssContent).toContain('--color-focus-ring:');
    });
  });

  describe('Spacing Scale Variables', () => {
    it('should define base spacing variables', () => {
      expect(globalsCssContent).toContain('--spacing-0:');
      expect(globalsCssContent).toContain('--spacing-px:');
    });

    it('should define small spacing variables (0.5, 1, 2, 3)', () => {
      expect(globalsCssContent).toContain('--spacing-0-5:');
      expect(globalsCssContent).toContain('--spacing-1:');
      expect(globalsCssContent).toContain('--spacing-2:');
      expect(globalsCssContent).toContain('--spacing-3:');
    });

    it('should define medium spacing variables (4, 6, 8, 10)', () => {
      expect(globalsCssContent).toContain('--spacing-4:');
      expect(globalsCssContent).toContain('--spacing-6:');
      expect(globalsCssContent).toContain('--spacing-8:');
      expect(globalsCssContent).toContain('--spacing-10:');
    });

    it('should define large spacing variables (16, 24, 32, 48, 64)', () => {
      expect(globalsCssContent).toContain('--spacing-16:');
      expect(globalsCssContent).toContain('--spacing-24:');
      expect(globalsCssContent).toContain('--spacing-32:');
      expect(globalsCssContent).toContain('--spacing-48:');
      expect(globalsCssContent).toContain('--spacing-64:');
    });
  });

  describe('Typography Variables', () => {
    it('should define font family variables', () => {
      expect(globalsCssContent).toContain('--font-family-sans:');
      expect(globalsCssContent).toContain('--font-family-mono:');
    });

    it('should define font size variables (xs through 6xl)', () => {
      expect(globalsCssContent).toContain('--font-size-xs:');
      expect(globalsCssContent).toContain('--font-size-sm:');
      expect(globalsCssContent).toContain('--font-size-md:');
      expect(globalsCssContent).toContain('--font-size-lg:');
      expect(globalsCssContent).toContain('--font-size-xl:');
      expect(globalsCssContent).toContain('--font-size-2xl:');
      expect(globalsCssContent).toContain('--font-size-3xl:');
      expect(globalsCssContent).toContain('--font-size-4xl:');
      expect(globalsCssContent).toContain('--font-size-5xl:');
      expect(globalsCssContent).toContain('--font-size-6xl:');
    });

    it('should define font weight variables', () => {
      expect(globalsCssContent).toContain('--font-weight-thin:');
      expect(globalsCssContent).toContain('--font-weight-normal:');
      expect(globalsCssContent).toContain('--font-weight-medium:');
      expect(globalsCssContent).toContain('--font-weight-semibold:');
      expect(globalsCssContent).toContain('--font-weight-bold:');
    });

    it('should define line height variables', () => {
      expect(globalsCssContent).toContain('--line-height-none:');
      expect(globalsCssContent).toContain('--line-height-tight:');
      expect(globalsCssContent).toContain('--line-height-normal:');
      expect(globalsCssContent).toContain('--line-height-relaxed:');
      expect(globalsCssContent).toContain('--line-height-loose:');
    });

    it('should define letter spacing variables', () => {
      expect(globalsCssContent).toContain('--letter-spacing-tighter:');
      expect(globalsCssContent).toContain('--letter-spacing-normal:');
      expect(globalsCssContent).toContain('--letter-spacing-wider:');
      expect(globalsCssContent).toContain('--letter-spacing-widest:');
    });
  });

  describe('Border Radius Variables', () => {
    it('should define border radius variables', () => {
      expect(globalsCssContent).toContain('--radius-none:');
      expect(globalsCssContent).toContain('--radius-sm:');
      expect(globalsCssContent).toContain('--radius-md:');
      expect(globalsCssContent).toContain('--radius-lg:');
      expect(globalsCssContent).toContain('--radius-xl:');
      expect(globalsCssContent).toContain('--radius-2xl:');
      expect(globalsCssContent).toContain('--radius-3xl:');
      expect(globalsCssContent).toContain('--radius-full:');
    });
  });

  describe('Shadow Variables', () => {
    it('should define shadow variables (xs through 2xl)', () => {
      expect(globalsCssContent).toContain('--shadow-xs:');
      expect(globalsCssContent).toContain('--shadow-sm:');
      expect(globalsCssContent).toContain('--shadow-md:');
      expect(globalsCssContent).toContain('--shadow-lg:');
      expect(globalsCssContent).toContain('--shadow-xl:');
      expect(globalsCssContent).toContain('--shadow-2xl:');
    });

    it('should define inner shadow', () => {
      expect(globalsCssContent).toContain('--shadow-inner:');
    });
  });

  describe('Z-index Variables', () => {
    it('should define base z-index variables', () => {
      expect(globalsCssContent).toContain('--z-0:');
      expect(globalsCssContent).toContain('--z-10:');
      expect(globalsCssContent).toContain('--z-20:');
      expect(globalsCssContent).toContain('--z-30:');
      expect(globalsCssContent).toContain('--z-40:');
      expect(globalsCssContent).toContain('--z-50:');
    });

    it('should define semantic z-index variables', () => {
      expect(globalsCssContent).toContain('--z-dropdown:');
      expect(globalsCssContent).toContain('--z-sticky:');
      expect(globalsCssContent).toContain('--z-fixed:');
      expect(globalsCssContent).toContain('--z-modal:');
      expect(globalsCssContent).toContain('--z-tooltip:');
    });
  });

  describe('Transition Variables', () => {
    it('should define transition duration variables', () => {
      expect(globalsCssContent).toContain('--transition-fast:');
      expect(globalsCssContent).toContain('--transition-normal:');
      expect(globalsCssContent).toContain('--transition-slow:');
    });
  });

  describe('Breakpoint Variables', () => {
    it('should define responsive breakpoint variables', () => {
      expect(globalsCssContent).toContain('--breakpoint-xs:');
      expect(globalsCssContent).toContain('--breakpoint-sm:');
      expect(globalsCssContent).toContain('--breakpoint-md:');
      expect(globalsCssContent).toContain('--breakpoint-lg:');
      expect(globalsCssContent).toContain('--breakpoint-xl:');
      expect(globalsCssContent).toContain('--breakpoint-2xl:');
    });
  });

  describe('Container Variables', () => {
    it('should define container width variables', () => {
      expect(globalsCssContent).toContain('--container-sm:');
      expect(globalsCssContent).toContain('--container-md:');
      expect(globalsCssContent).toContain('--container-lg:');
      expect(globalsCssContent).toContain('--container-xl:');
      expect(globalsCssContent).toContain('--container-2xl:');
    });
  });

  describe('Reset/Normalize Styles', () => {
    it('should apply box-sizing border-box to all elements', () => {
      expect(globalsCssContent).toContain('box-sizing: border-box');
    });

    it('should reset html element styles', () => {
      expect(globalsCssContent).toContain('html');
      expect(globalsCssContent).toContain('font-size: 16px');
      expect(globalsCssContent).toContain('-webkit-font-smoothing: antialiased');
    });

    it('should reset body element styles', () => {
      expect(globalsCssContent).toMatch(/body\s*{[^}]*margin:\s*0[^}]*}/);
      expect(globalsCssContent).toMatch(/body\s*{[^}]*padding:\s*0[^}]*}/);
    });

    it('should reset heading styles', () => {
      expect(globalsCssContent).toMatch(/h1,[^}]*h2,[^}]*h3,[^}]*h4,[^}]*h5,[^}]*h6/);
      expect(globalsCssContent).toMatch(/h[1-6]\s*{[^}]*margin:\s*0/);
    });

    it('should reset paragraph styles', () => {
      expect(globalsCssContent).toMatch(/p\s*{[^}]*margin:\s*0/);
    });

    it('should reset list styles', () => {
      expect(globalsCssContent).toMatch(/ul,\s*ol\s*{[^}]*list-style:\s*none/);
    });

    it('should reset link styles', () => {
      expect(globalsCssContent).toMatch(/a\s*{[^}]*text-decoration:\s*none/);
    });

    it('should reset button styles', () => {
      expect(globalsCssContent).toMatch(/button\s*{[^}]*background:\s*none[^}]*border:\s*none/);
    });

    it('should reset form element styles', () => {
      expect(globalsCssContent).toMatch(/input,[^}]*textarea,[^}]*select/);
    });
  });

  describe('Root Container', () => {
    it('should define styles for #root', () => {
      expect(globalsCssContent).toMatch(/#root\s*{[^}]*width:\s*100%/);
      expect(globalsCssContent).toMatch(/#root\s*{[^}]*min-height:\s*100vh/);
    });
  });

  describe('Responsive Media Queries', () => {
    it('should include media queries for small breakpoint', () => {
      expect(globalsCssContent).toContain('@media (min-width: 640px)');
    });

    it('should include media queries for medium breakpoint', () => {
      expect(globalsCssContent).toContain('@media (min-width: 768px)');
    });

    it('should include media queries for large breakpoint', () => {
      expect(globalsCssContent).toContain('@media (min-width: 1024px)');
    });

    it('should include media queries for xl breakpoint', () => {
      expect(globalsCssContent).toContain('@media (min-width: 1280px)');
    });

    it('should include media queries for 2xl breakpoint', () => {
      expect(globalsCssContent).toContain('@media (min-width: 1536px)');
    });
  });

  describe('Utility Classes', () => {
    it('should define .container utility class', () => {
      expect(globalsCssContent).toContain('.container');
      expect(globalsCssContent).toMatch(/\.container\s*{[^}]*width:\s*100%/);
    });

    it('should define responsive .container styles', () => {
      const containerMatches = globalsCssContent.match(/@media[^}]*\.container/g);
      expect(containerMatches).toBeTruthy();
      if (containerMatches) {
        expect(containerMatches.length).toBeGreaterThanOrEqual(4);
      }
    });

    it('should define .sr-only utility class for accessibility', () => {
      expect(globalsCssContent).toContain('.sr-only');
      expect(globalsCssContent).toMatch(/\.sr-only\s*{[^}]*position:\s*absolute/);
    });
  });

  describe('Focus Styles', () => {
    it('should define :focus-visible styles', () => {
      expect(globalsCssContent).toContain(':focus-visible');
    });

    it('should define :focus:not(:focus-visible) to remove mouse focus outline', () => {
      expect(globalsCssContent).toContain(':focus:not(:focus-visible)');
      expect(globalsCssContent).toMatch(/:focus:not\(:focus-visible\)\s*{[^}]*outline:\s*none/);
    });
  });

  describe('Custom Animations', () => {
    it('should define pulse-dot keyframe animation for spinner', () => {
      expect(globalsCssContent).toContain('@keyframes pulse-dot');
      expect(globalsCssContent).toMatch(/@keyframes pulse-dot\s*{[^}]*transform:\s*scale/);
      expect(globalsCssContent).toMatch(/@keyframes pulse-dot\s*{[^}]*opacity:/);
    });

    it('should define fadeInUp keyframe animation for form entry', () => {
      expect(globalsCssContent).toContain('@keyframes fadeInUp');
      expect(globalsCssContent).toMatch(/@keyframes fadeInUp\s*{[^}]*opacity:\s*0/);
      expect(globalsCssContent).toMatch(/@keyframes fadeInUp\s*{[^}]*transform:\s*translateY/);
    });

    it('should define animate-fade-in-up utility class', () => {
      expect(globalsCssContent).toContain('.animate-fade-in-up');
      expect(globalsCssContent).toMatch(/\.animate-fade-in-up\s*{[^}]*animation:\s*fadeInUp/);
      expect(globalsCssContent).toMatch(/\.animate-fade-in-up\s*{[^}]*300ms/);
    });

    it('should define stagger animation classes', () => {
      expect(globalsCssContent).toContain('.animate-stagger-1');
      expect(globalsCssContent).toContain('.animate-stagger-2');
      expect(globalsCssContent).toContain('.animate-stagger-3');
      expect(globalsCssContent).toContain('.animate-stagger-4');
      expect(globalsCssContent).toContain('.animate-stagger-5');
      expect(globalsCssContent).toContain('.animate-stagger-6');
    });

    it('should have correct animation delays for stagger classes', () => {
      expect(globalsCssContent).toMatch(/\.animate-stagger-1\s*{[^}]*animation-delay:\s*50ms/);
      expect(globalsCssContent).toMatch(/\.animate-stagger-2\s*{[^}]*animation-delay:\s*100ms/);
      expect(globalsCssContent).toMatch(/\.animate-stagger-3\s*{[^}]*animation-delay:\s*150ms/);
      expect(globalsCssContent).toMatch(/\.animate-stagger-4\s*{[^}]*animation-delay:\s*200ms/);
      expect(globalsCssContent).toMatch(/\.animate-stagger-5\s*{[^}]*animation-delay:\s*250ms/);
      expect(globalsCssContent).toMatch(/\.animate-stagger-6\s*{[^}]*animation-delay:\s*300ms/);
    });

    it('should use ease-out timing for fadeInUp animation', () => {
      expect(globalsCssContent).toMatch(/\.animate-fade-in-up\s*{[^}]*ease-out/);
    });

    it('should use forwards fill mode for fadeInUp animation', () => {
      expect(globalsCssContent).toMatch(/\.animate-fade-in-up\s*{[^}]*forwards/);
    });
  });

  describe('CSS Variable Format', () => {
    it('should use kebab-case naming convention for variables', () => {
      const variablePattern = /--[\w-]+:/g;
      const variables = globalsCssContent.match(variablePattern);
      expect(variables).toBeTruthy();
      if (variables) {
        expect(variables.length).toBeGreaterThan(50);

        // All variables should follow kebab-case (lowercase with hyphens)
        variables.forEach(variable => {
          expect(variable).toMatch(/^--[a-z][a-z0-9-]*:/);
        });
      }
    });

    it('should define variables inside :root selector', () => {
      expect(globalsCssContent).toContain(':root {');
      expect(globalsCssContent).toMatch(/:root\s*{[^}]*--color-primary:/);
    });
  });

  describe('Design Token Consistency', () => {
    it('should follow utility-first naming conventions (like Tailwind CSS)', () => {
      // Check for spacing scale naming convention
      expect(globalsCssContent).toMatch(/--spacing-\d+:/);
      expect(globalsCssContent).toMatch(/--spacing-\d+-\d+:/);

      // Check for font size naming convention
      expect(globalsCssContent).toMatch(/--font-size-(xs|sm|md|lg|xl|2xl|3xl|4xl|5xl|6xl):/);

      // Check for font weight naming convention
      expect(globalsCssContent).toMatch(/--font-weight-(thin|normal|medium|bold):/);
    });

    it('should have consistent value formats for color variables', () => {
      // Primary colors should use hex format
      expect(globalsCssContent).toMatch(/--color-primary:\s*#[0-9a-fA-F]{6}/);
      expect(globalsCssContent).toMatch(/--color-secondary:\s*#[0-9a-fA-F]{6}/);
      expect(globalsCssContent).toMatch(/--color-error:\s*#[0-9a-fA-F]{6}/);
    });

    it('should have consistent value formats for spacing variables', () => {
      // Check that spacing variables use rem or px
      expect(globalsCssContent).toMatch(/--spacing-\d+:\s*(\d+\.?\d*rem|\d+px)/);
    });
  });
});
