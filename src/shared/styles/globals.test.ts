// @vitest-environment node
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { beforeEach, describe, expect, it } from 'vitest';

const projectRoot = process.cwd();

describe('Tailwind CSS Integration', () => {
  let indexCssContent: string;
  let mainTsxContent: string;

  beforeEach(() => {
    const indexCssPath = join(projectRoot, 'src/index.css');
    const mainTsxPath = join(projectRoot, 'src/main.tsx');

    indexCssContent = readFileSync(indexCssPath, 'utf-8');
    mainTsxContent = readFileSync(mainTsxPath, 'utf-8');
  });

  describe('File Existence and Import', () => {
    it('should have index.css file', () => {
      const indexCssPath = join(projectRoot, 'src/index.css');
      expect(existsSync(indexCssPath)).toBe(true);
    });

    it('should have index.css imported in main.tsx', () => {
      expect(mainTsxContent).toContain('./index.css');
      expect(mainTsxContent).toMatch(/import\s+['"].*index\.css['"]/);
    });

    it('should NOT have globals.css imported in main.tsx', () => {
      expect(mainTsxContent).not.toContain('./shared/styles/globals.css');
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

  describe('Tailwind Layers', () => {
    // After task 035, @layer base is not used as reset styles are in Tailwind Preflight
    it('should define @layer components for component styles', () => {
      expect(indexCssContent).toContain('@layer components');
    });

    it('should define @layer utilities for utility styles', () => {
      expect(indexCssContent).toContain('@layer utilities');
    });

    it('should NOT use @layer base (reset styles handled by Tailwind Preflight)', () => {
      expect(indexCssContent).not.toMatch(/@layer\s+base/);
    });
  });

  describe('Reset/Normalize Styles (After Task 035)', () => {
    // After task 035 cleanup, reset styles are now in Tailwind Preflight
    it('should NOT have custom box-sizing reset (handled by Tailwind Preflight)', () => {
      expect(indexCssContent).not.toMatch(/\*\s*{[^}]*box-sizing:\s*border-box/);
      expect(indexCssContent).not.toMatch(/html\s*{[^}]*box-sizing:\s*border-box/);
    });

    it('should NOT have custom html element reset (handled by Tailwind Preflight)', () => {
      expect(indexCssContent).not.toMatch(/html\s*{[^}]*font-size:/);
      expect(indexCssContent).not.toMatch(/html\s*{[^}]*line-height:/);
      expect(indexCssContent).not.toMatch(/html\s*{[^}]*-webkit-font-smoothing:/);
    });

    it('should NOT have custom body element reset (handled by Tailwind Preflight)', () => {
      expect(indexCssContent).not.toMatch(/body\s*{[^}]*margin:\s*0/);
      expect(indexCssContent).not.toMatch(/body\s*{[^}]*padding:\s*0/);
    });

    it('should NOT have custom heading resets (handled by Tailwind Preflight)', () => {
      expect(indexCssContent).not.toMatch(/h1,\s*h2,\s*h3,\s*h4,\s*h5,\s*h6\s*{[^}]*margin:/);
      expect(indexCssContent).not.toMatch(/h1\s*{[^}]*font-size:/);
    });
  });

  describe('Utility Classes', () => {
    it('should define .container utility class', () => {
      expect(indexCssContent).toContain('.container');
      expect(indexCssContent).toMatch(/\.container\s*{[^}]*w-full/);
    });

    it('should define responsive .container styles with media queries', () => {
      expect(indexCssContent).toContain('@media (min-width: 640px)');
      expect(indexCssContent).toContain('@media (min-width: 768px)');
      expect(indexCssContent).toContain('@media (min-width: 1024px)');
      expect(indexCssContent).toContain('@media (min-width: 1280px)');
      expect(indexCssContent).toContain('@media (min-width: 1536px)');
    });

    it('should define .sr-only utility class for accessibility', () => {
      expect(indexCssContent).toContain('.sr-only');
      expect(indexCssContent).toMatch(/\.sr-only\s*{[^}]*position:\s*absolute/);
    });
  });

  describe('Focus Styles', () => {
    it('should define .focus-visible styles', () => {
      expect(indexCssContent).toContain('.focus-visible');
    });

    it('should define .focus:not-focus-visible utility', () => {
      expect(indexCssContent).toContain('.focus\\:not-focus-visible:focus:not(:focus-visible)');
    });
  });

  describe('Custom Animations', () => {
    it('should define .animate-stagger-0 through .animate-stagger-6 utility classes', () => {
      expect(indexCssContent).toContain('.animate-stagger-0');
      expect(indexCssContent).toContain('.animate-stagger-1');
      expect(indexCssContent).toContain('.animate-stagger-2');
      expect(indexCssContent).toContain('.animate-stagger-3');
      expect(indexCssContent).toContain('.animate-stagger-4');
      expect(indexCssContent).toContain('.animate-stagger-5');
      expect(indexCssContent).toContain('.animate-stagger-6');
    });

    it('should have correct animation delays for stagger classes', () => {
      expect(indexCssContent).toMatch(/\.animate-stagger-1\s*{[^}]*animation-delay:\s*50ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-2\s*{[^}]*animation-delay:\s*100ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-3\s*{[^}]*animation-delay:\s*150ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-4\s*{[^}]*animation-delay:\s*200ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-5\s*{[^}]*animation-delay:\s*250ms/);
      expect(indexCssContent).toMatch(/\.animate-stagger-6\s*{[^}]*animation-delay:\s*300ms/);
    });

    it('should respect user motion preferences for accessibility', () => {
      expect(indexCssContent).toContain('@media (prefers-reduced-motion: reduce)');
      expect(indexCssContent).toContain('animation-duration: 0.01ms !important');
      expect(indexCssContent).toContain('transition-duration: 0.01ms !important');
    });
  });

  describe('Tailwind Utility Classes', () => {
    it('should use Tailwind utility classes for styling', () => {
      expect(indexCssContent).toContain('@apply');
      // After task 035, these utilities are still present in custom CSS
      expect(indexCssContent).toContain('mx-auto');
      expect(indexCssContent).toContain('w-full');
      expect(indexCssContent).toContain('absolute');
    });
  });

  describe('No Duplicate CSS', () => {
    it('should not have duplicate Tailwind v4 imports', () => {
      const importMatches = indexCssContent.match(/@import "tailwindcss"/g);

      expect(importMatches).toBeTruthy();
      if (importMatches) expect(importMatches.length).toBe(1);
    });

    it('should use Tailwind utility classes via @apply', () => {
      expect(indexCssContent).toContain('@apply');
      expect(indexCssContent).toContain('w-full');
      expect(indexCssContent).toContain('mx-auto');
      expect(indexCssContent).toContain('absolute');
    });
  });
});

