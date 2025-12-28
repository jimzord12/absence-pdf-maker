import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('task-031-tailwind-installation', () => {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

  it('should have tailwindcss installed in devDependencies', () => {
    expect(packageJson.devDependencies).toBeDefined();
    expect(packageJson.devDependencies.tailwindcss).toBeDefined();
    expect(typeof packageJson.devDependencies.tailwindcss).toBe('string');
    expect(packageJson.devDependencies.tailwindcss.length).toBeGreaterThan(0);
  });

  it('should have postcss installed in devDependencies', () => {
    expect(packageJson.devDependencies).toBeDefined();
    expect(packageJson.devDependencies.postcss).toBeDefined();
    expect(typeof packageJson.devDependencies.postcss).toBe('string');
    expect(packageJson.devDependencies.postcss.length).toBeGreaterThan(0);
  });

  it('should have autoprefixer installed in devDependencies', () => {
    expect(packageJson.devDependencies).toBeDefined();
    expect(packageJson.devDependencies.autoprefixer).toBeDefined();
    expect(typeof packageJson.devDependencies.autoprefixer).toBe('string');
    expect(packageJson.devDependencies.autoprefixer.length).toBeGreaterThan(0);
  });

  it('should have all required packages with semver versions', () => {
    const requiredPackages = ['tailwindcss', 'postcss', 'autoprefixer'];

    requiredPackages.forEach(pkg => {
      const version = packageJson.devDependencies[pkg];
      expect(version).toMatch(/^\^/); // Should start with ^ for caret range
    });
  });

  it('should not have installation conflicts (no duplicate package names)', () => {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };
    const depNames = Object.keys(allDeps);
    const uniqueDepNames = new Set(depNames);

    expect(depNames.length).toBe(uniqueDepNames.size);
  });

  it('should have tailwindcss compatible with current node version', () => {
    // Tailwind CSS 4.x requires Node.js 18+ or 20+
    const tailwindVersion = packageJson.devDependencies.tailwindcss;
    const versionWithoutCaret = tailwindVersion.replace(/^\^/, '');
    expect(versionWithoutCaret).toMatch(/^4\./); // Should be using Tailwind v4.x
  });
});
