import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  describe('rendering', () => {
    it('should render spinner element', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toBeInTheDocument();
    });

    it('should have aria-label for accessibility', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveAttribute('aria-label', 'Loading');
    });

    it('should have screen reader only text', () => {
      render(<Spinner />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should render medium size by default', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-8', 'h-8', 'border-2');
    });

    it('should render small size', () => {
      render(<Spinner size="sm" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-4', 'h-4', 'border-2');
    });

    it('should render large size', () => {
      render(<Spinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-12', 'h-12', 'border-4');
    });
  });

  describe('base styles', () => {
    it('should have base spinner styles', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass(
        'inline-block',
        'rounded-full',
        'border-gray-200',
        'border-t-black',
        'animate-spin'
      );
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<Spinner className="custom-class" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('custom-class');
    });

    it('should preserve base styles with custom className', () => {
      render(<Spinner className="custom-class" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('inline-block', 'animate-spin', 'custom-class');
    });
  });

  describe('screen reader only text', () => {
    it('should have sr-only class on loading text', () => {
      render(<Spinner />);
      const loadingText = screen.getByText('Loading...');
      expect(loadingText).toHaveClass('sr-only');
    });
  });

  describe('animation', () => {
    it('should have animate-spin class', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('border styles', () => {
    it('should have border styles for loading animation', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('border-gray-200', 'border-t-black');
    });
  });

  describe('responsive behavior', () => {
    it('should be inline-block', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('inline-block');
    });
  });

  describe('multiple spinners', () => {
    it('should render multiple spinners independently', () => {
      render(
        <div>
          <Spinner size="sm" />
          <Spinner size="md" />
          <Spinner size="lg" />
        </div>
      );
      // Get all spinners by role
      const spinners = screen.getAllByRole('status');
      expect(spinners).toHaveLength(3);

      const [smallSpinner, mediumSpinner, largeSpinner] = spinners;

      expect(smallSpinner).toHaveClass('w-4', 'h-4', 'border-2');
      expect(mediumSpinner).toHaveClass('w-8', 'h-8', 'border-2');
      expect(largeSpinner).toHaveClass('w-12', 'h-12', 'border-4');
    });
  });
});
