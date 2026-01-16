import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HolidaysLegend } from './HolidaysLegend';

describe('HolidaysLegend', () => {
  describe('rendering', () => {
    it('should render the component', () => {
      render(<HolidaysLegend />);
      expect(screen.getByRole('region', { name: 'Holidays legend' })).toBeInTheDocument();
    });

    it('should have visual indicator matching holiday style', () => {
      render(<HolidaysLegend />);

      // Find the color swatch div with aria-hidden
      const swatch = screen.getByRole('region', { name: 'Holidays legend' }).querySelector('[aria-hidden="true"]');
      expect(swatch).toBeInTheDocument();
      expect(swatch).toHaveStyle({
        backgroundColor: 'var(--color-holiday-bg)',
        color: 'var(--color-holiday-text)',
      });
      expect(swatch).toHaveTextContent('H');
    });

    it('should explain holiday highlighting in calendar', () => {
      render(<HolidaysLegend />);
      const region = screen.getByRole('region', { name: 'Holidays legend' });
      expect(region).toHaveTextContent(/H = Holiday/i);
      expect(region).toHaveTextContent(/Holidays are highlighted in the calendar/i);
    });

    it('should state that holidays do not count toward absence days', () => {
      render(<HolidaysLegend />);
      const region = screen.getByRole('region', { name: 'Holidays legend' });
      expect(region).toHaveTextContent(/not counted toward absence days/i);
    });

    it('should have clear and concise text', () => {
      render(<HolidaysLegend />);
      const region = screen.getByRole('region', { name: 'Holidays legend' });

      // Check that the text is present and clear
      expect(region).toHaveTextContent(/H = Holiday/i);
      expect(region).toHaveTextContent(/holidays are highlighted/i);
      expect(region).toHaveTextContent(/not counted toward absence days/i);
    });
  });

  describe('styling', () => {
    it('should have consistent app typography', () => {
      render(<HolidaysLegend />);
      const region = screen.getByRole('region', { name: 'Holidays legend' });
      expect(region).toHaveClass('text-sm', 'bg-[color:var(--color-surface-hover)]', 'border', 'rounded-md');
    });

    it('should have proper spacing and layout', () => {
      render(<HolidaysLegend />);
      const region = screen.getByRole('region', { name: 'Holidays legend' });
      expect(region).toHaveClass('flex', 'items-start', 'gap-2');
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA region label', () => {
      render(<HolidaysLegend />);
      const region = screen.getByRole('region', { name: 'Holidays legend' });
      expect(region).toHaveAttribute('aria-label', 'Holidays legend');
    });

    it('should have aria-hidden on visual indicator', () => {
      render(<HolidaysLegend />);
      const swatch = screen.getByRole('region', { name: 'Holidays legend' }).querySelector('[aria-hidden="true"]');
      expect(swatch).toBeInTheDocument();
      expect(swatch).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
