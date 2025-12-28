// @vitest-environment node
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

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
      expect(mainTsxContent).toContain("./index.css");
      expect(mainTsxContent).toMatch(/import\s+['"].*index\.css['"]/);
    });

    it('should NOT have globals.css imported in main.tsx', () => {
      expect(mainTsxContent).not.toContain("./shared/styles/globals.css");
    });
  });

  describe('Tailwind Directives', () => {
    it('should include @tailwind base directive', () => {
      expect(indexCssContent).toContain('@tailwind base');
    });

    it('should include @tailwind components directive', () => {
      expect(indexCssContent).toContain('@tailwind components');
    });

    it('should include @tailwind utilities directive', () => {
      expect(indexCssContent).toContain('@tailwind utilities');
    });
  });

  describe('Tailwind Layers', () => {
    it('should define @layer base for base styles', () => {
      expect(indexCssContent).toContain('@layer base');
    });

    it('should define @layer components for component styles', () => {
      expect(indexCssContent).toContain('@layer components');
    });

    it('should define @layer utilities for utility styles', () => {
      expect(indexCssContent).toContain('@layer utilities');
    });
  });

  describe('Reset/Normalize Styles', () => {
    it('should apply box-sizing border-box to all elements', () => {
      expect(indexCssContent).toContain('box-sizing: border-box');
    });

    it('should reset html element styles', () => {
      expect(indexCssContent).toContain('html');
      expect(indexCssContent).toContain('font-size: 16px');
      expect(indexCssContent).toContain('-webkit-font-smoothing: antialiased');
    });

    it('should reset body element styles', () => {
      expect(indexCssContent).toMatch(/body\s*{[^}]*min-h-100vh/);
    });

    it('should reset heading styles', () => {
      expect(indexCssContent).toMatch(/h1,[^}]*h2,[^}]*h3,[^}]*h4,[^}]*h5,[^}]*h6/);
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
      expect(indexCssContent).toMatch(/\.sr-only\s*{[^}]*@apply\s+absolute/);
    });
  });

  describe('Focus Styles', () => {
    it('should define .focus-visible styles', () => {
      expect(indexCssContent).toContain('.focus-visible');
    });

    it('should define .focus\:not-focus-visible utility', () => {
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
      expect(indexCssContent).toContain('mx-auto');
      expect(indexCssContent).toContain('m-0');
    });
  });

  describe('No Duplicate CSS', () => {
    it('should not have duplicate Tailwind directives', () => {
      const baseMatches = indexCssContent.match(/@tailwind base/g);
      const componentsMatches = indexCssContent.match(/@tailwind components/g);
      const utilitiesMatches = indexCssContent.match(/@tailwind utilities/g);

      expect(baseMatches).toBeTruthy();
      if (baseMatches) expect(baseMatches.length).toBe(1);

      expect(componentsMatches).toBeTruthy();
      if (componentsMatches) expect(componentsMatches.length).toBe(1);

      expect(utilitiesMatches).toBeTruthy();
      if (utilitiesMatches) expect(utilitiesMatches.length).toBe(1);
    });
  });
});
