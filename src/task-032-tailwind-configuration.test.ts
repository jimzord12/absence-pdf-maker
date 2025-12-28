import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('task-032-tailwind-configuration', () => {
  const tailwindConfigPath = resolve(process.cwd(), 'tailwind.config.js');
  const postcssConfigPath = resolve(process.cwd(), 'postcss.config.js');

  it('should have tailwind.config.js file', () => {
    expect(() => readFileSync(tailwindConfigPath, 'utf-8')).not.toThrow();
  });

  it('should have postcss.config.js file', () => {
    expect(() => readFileSync(postcssConfigPath, 'utf-8')).not.toThrow();
  });

  it('should configure content paths for source files', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('./index.html');
    expect(tailwindConfigContent).toContain('./src/**/*.{js,jsx,ts,tsx}');
  });

  it('should configure postcss with tailwindcss plugin', () => {
    const postcssConfigContent = readFileSync(postcssConfigPath, 'utf-8');

    expect(postcssConfigContent).toContain('tailwindcss');
  });

  it('should configure postcss with autoprefixer plugin', () => {
    const postcssConfigContent = readFileSync(postcssConfigPath, 'utf-8');

    expect(postcssConfigContent).toContain('autoprefixer');
  });

  it('should migrate primary colors from globals.css', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('#0f172a'); // primary
    expect(tailwindConfigContent).toContain('#1e293b'); // primary hover
    expect(tailwindConfigContent).toContain('#334155'); // primary light
  });

  it('should migrate secondary colors from globals.css', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('#64748b'); // secondary
    expect(tailwindConfigContent).toContain('#475569'); // secondary hover
    expect(tailwindConfigContent).toContain('#94a3b8'); // secondary light
  });

  it('should migrate semantic colors (error, success, warning, info)', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    // Error colors
    expect(tailwindConfigContent).toContain('#dc2626'); // error
    expect(tailwindConfigContent).toContain('#fef2f2'); // error bg

    // Success colors
    expect(tailwindConfigContent).toContain('#16a34a'); // success
    expect(tailwindConfigContent).toContain('#f0fdf4'); // success bg

    // Warning colors
    expect(tailwindConfigContent).toContain('#b45309'); // warning
    expect(tailwindConfigContent).toContain('#fef3c7'); // warning bg

    // Info colors
    expect(tailwindConfigContent).toContain('#2563eb'); // info
    expect(tailwindConfigContent).toContain('#eff6ff'); // info bg
  });

  it('should migrate holiday colors from globals.css', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('#fee2e2'); // holiday bg
    expect(tailwindConfigContent).toContain('#b91c1c'); // holiday text
  });

  it('should migrate border colors from globals.css', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('#e2e8f0'); // border
    expect(tailwindConfigContent).toContain('#f1f5f9'); // border light
    expect(tailwindConfigContent).toContain('#cbd5e1'); // border dark
  });

  it('should migrate font family configuration', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('-apple-system');
    expect(tailwindConfigContent).toContain('BlinkMacSystemFont');
    expect(tailwindConfigContent).toContain('Segoe UI');
  });

  it('should migrate font sizes from globals.css', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('0.75rem'); // xs
    expect(tailwindConfigContent).toContain('0.875rem'); // sm
    expect(tailwindConfigContent).toContain('1rem'); // md
    expect(tailwindConfigContent).toContain('1.125rem'); // lg
    expect(tailwindConfigContent).toContain('1.25rem'); // xl
    expect(tailwindConfigContent).toContain('1.5rem'); // 2xl
    expect(tailwindConfigContent).toContain('1.875rem'); // 3xl
  });

  it('should migrate font weights from globals.css', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('100'); // thin
    expect(tailwindConfigContent).toContain('400'); // normal
    expect(tailwindConfigContent).toContain('500'); // medium
    expect(tailwindConfigContent).toContain('600'); // semibold
    expect(tailwindConfigContent).toContain('700'); // bold
  });

  it('should migrate border radius from globals.css', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('0.125rem'); // sm
    expect(tailwindConfigContent).toContain('0.25rem'); // md
    expect(tailwindConfigContent).toContain('0.375rem'); // lg
    expect(tailwindConfigContent).toContain('0.5rem'); // xl
    expect(tailwindConfigContent).toContain('0.75rem'); // 2xl
    expect(tailwindConfigContent).toContain('1rem'); // 3xl
  });

  it('should migrate shadow scale from globals.css', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain("xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'");
    expect(tailwindConfigContent).toContain("sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)'");
    expect(tailwindConfigContent).toContain("md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'");
    expect(tailwindConfigContent).toContain("lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)'");
  });

  it('should configure custom animations', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('pulse-dot');
    expect(tailwindConfigContent).toContain('fade-in-up');
  });

  it('should configure z-index scale', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('dropdown');
    expect(tailwindConfigContent).toContain('modal');
    expect(tailwindConfigContent).toContain('tooltip');
  });

  it('should configure transition durations', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('150ms'); // fast
    expect(tailwindConfigContent).toContain('250ms'); // normal
    expect(tailwindConfigContent).toContain('350ms'); // slow
  });

  it('should configure breakpoints', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');

    expect(tailwindConfigContent).toContain('640px'); // sm
    expect(tailwindConfigContent).toContain('768px'); // md
    expect(tailwindConfigContent).toContain('1024px'); // lg
    expect(tailwindConfigContent).toContain('1280px'); // xl
  });

  it('should be valid JavaScript', () => {
    const tailwindConfigContent = readFileSync(tailwindConfigPath, 'utf-8');
    const postcssConfigContent = readFileSync(postcssConfigPath, 'utf-8');

    // Test if the files are valid JS by checking for export syntax
    expect(tailwindConfigContent).toContain('export default');
    expect(postcssConfigContent).toContain('export default');
  });
});
