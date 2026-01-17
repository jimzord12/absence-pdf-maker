import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { readFile, access, constants } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Tests for GitHub Pages deployment configuration.
 *
 * These tests verify that the Vite build system is correctly configured
 * for deployment to GitHub Pages at https://jimzord12.github.io/absence-pdf-maker/
 */

const distDir = join(process.cwd(), 'dist');
const indexPath = join(distDir, 'index.html');
const manifestPath = join(distDir, 'manifest.webmanifest');
const BASE_PATH = '/absence-pdf-maker/';

describe('GitHub Pages Vite Configuration', () => {
  beforeAll(async () => {
    if (!existsSync(distDir)) {
      const { exec } = await import('child_process');
      await new Promise<void>((resolve, reject) => {
        exec('npm run build', (error) => {
          if (error) reject(error);
          else resolve();
        });
      });
    }
  });

  afterAll(async () => {
    // Keep dist for preview testing
  });

  describe('Build Output', () => {
    it('should have dist directory', () => {
      expect(existsSync(distDir)).toBe(true);
    });

    it('should have index.html in dist', async () => {
      await expect(access(indexPath, constants.R_OK)).resolves.toBeUndefined();
    });

    it('should have manifest.webmanifest in dist', async () => {
      await expect(access(manifestPath, constants.R_OK)).resolves.toBeUndefined();
    });
  });

  describe('Index HTML Asset Paths', () => {
    let indexHtmlContent: string;

    beforeAll(async () => {
      indexHtmlContent = await readFile(indexPath, 'utf-8');
    });

    it('should have script src prefixed with base path', () => {
      const scriptMatches = indexHtmlContent.matchAll(/<script[^>]*src="([^"]*)"/g);
      for (const match of scriptMatches) {
        const src = match[1];
        expect(src).toMatch(/^\/absence-pdf-maker\//);
      }
    });

    it('should have link href prefixed with base path for CSS', () => {
      const linkMatches = indexHtmlContent.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]*)"/g);
      for (const match of linkMatches) {
        const href = match[1];
        expect(href).toMatch(/^\/absence-pdf-maker\//);
      }
    });

    it('should have correct canonical URL', () => {
      const canonicalMatch = indexHtmlContent.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/);
      if (canonicalMatch) {
        const href = canonicalMatch[1];
        expect(href).toMatch(/^\/absence-pdf-maker/);
      }
    });

    it('should not have absolute paths without base prefix', () => {
      // Regex ensures no paths starting with / but not /absence-pdf-maker/
      const absolutePathPattern = /(?:src|href)="\/(?!absence-pdf-maker\/)/g;
      const matches = indexHtmlContent.match(absolutePathPattern);
      expect(matches).toBeNull();
    });
  });

  describe('PWA Manifest Configuration', () => {
    let manifestContent: string;
    let manifestJson: any;

    beforeAll(async () => {
      manifestContent = await readFile(manifestPath, 'utf-8');
      manifestJson = JSON.parse(manifestContent);
    });

    it('should have correct scope', () => {
      expect(manifestJson.scope).toBe(BASE_PATH);
    });

    it('should have correct start_url', () => {
      expect(manifestJson.start_url).toBe(BASE_PATH);
    });

    it('should have correct icon paths', () => {
      expect(manifestJson.icons).toBeDefined();
      expect(Array.isArray(manifestJson.icons)).toBe(true);
      expect(manifestJson.icons.length).toBeGreaterThan(0);

      for (const icon of manifestJson.icons) {
        expect(icon.src).toMatch(/^\/absence-pdf-maker\//);
      }
    });

    it('should have correct PWA metadata', () => {
      expect(manifestJson.name).toBe('Leave Request PDF Maker');
      expect(manifestJson.short_name).toBe('Leave PDF');
      expect(manifestJson.display).toBe('standalone');
      expect(manifestJson.orientation).toBe('portrait');
    });

    it('should have valid JSON structure', () => {
      expect(() => JSON.parse(manifestContent)).not.toThrow();
    });
  });

  describe('Service Worker Configuration', () => {
    let swJsPath: string;
    let swJsContent: string;

    beforeAll(async () => {
      // Service worker file is named with hash (e.g., sw.1234.js)
      const { readdir } = await import('fs/promises');
      const files = await readdir(distDir);
      const swFile = files.find((f) => f.startsWith('sw.') && f.endsWith('.js'));

      if (swFile) {
        swJsPath = join(distDir, swFile);
        swJsContent = await readFile(swJsPath, 'utf-8');
      }
    });

    it('should have service worker file', () => {
      expect(swJsPath).toBeDefined();
    });

    it('should include base path in cached assets', () => {
      if (swJsContent) {
        expect(swJsContent).toMatch(/\/absence-pdf-maker\//);
      }
    });
  });
});
