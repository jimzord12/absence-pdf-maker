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

    it('should render three dots for animation', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const dots = spinner.querySelectorAll('div');
      expect(dots.length).toBe(3);
    });
  });

  describe('size variants', () => {
    it('should render medium size by default', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-12', 'h-12');
    });

    it('should render small size', () => {
      render(<Spinner size="sm" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-8', 'h-8');
    });

    it('should render large size', () => {
      render(<Spinner size="lg" />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('w-16', 'h-16');
    });
  });

  describe('dot sizes', () => {
    it('should have dots with border-radius for circular shape', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const dots = Array.from(spinner.querySelectorAll('div'));

      dots.forEach(dot => {
        const style = dot.getAttribute('style');
        expect(style).toContain('border-radius: 50%');
      });
    });

    it('should have background color applied to dots', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const dots = Array.from(spinner.querySelectorAll('div'));

      dots.forEach(dot => {
        const style = dot.getAttribute('style');
        expect(style).toContain('background-color');
        expect(style).toContain('var(--color-primary)');
      });
    });

    it('should have animation applied to dots', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const dots = Array.from(spinner.querySelectorAll('div'));

      dots.forEach(dot => {
        expect(dot).toHaveClass('animate-pulse-dot');
      });
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
      expect(spinner).toHaveClass('w-12', 'h-12', 'custom-class');
    });
  });

  describe('animation styles', () => {
    it('should have animation class applied to dots', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const dots = spinner.querySelectorAll('div');

      dots.forEach(dot => {
        expect(dot).toHaveClass('animate-pulse-dot');
      });
    });

    it('should have staggered animation delays for dots', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const dots = Array.from(spinner.querySelectorAll('div'));

      // First dot should have 0s delay
      expect(dots[0].getAttribute('style')).toContain('animation-delay: 0s');
      // Second dot should have 0.2s delay
      expect(dots[1].getAttribute('style')).toContain('animation-delay: 0.2s');
      // Third dot should have 0.4s delay
      expect(dots[2].getAttribute('style')).toContain('animation-delay: 0.4s');
    });
  });

  describe('dot styles', () => {
    it('should have correct border radius for dots', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const dots = spinner.querySelectorAll('div');

      dots.forEach(dot => {
        const style = dot.getAttribute('style');
        expect(style).toContain('border-radius: 50%');
      });
    });

    it('should have correct background color for dots', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      const dots = spinner.querySelectorAll('div');

      dots.forEach(dot => {
        const style = dot.getAttribute('style');
        expect(style).toContain('background-color');
        expect(style).toContain('var(--color-primary)');
      });
    });
  });

  describe('flex layout', () => {
    it('should use flexbox for centering dots', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('should have gap between dots', () => {
      render(<Spinner />);
      const spinner = screen.getByRole('status');
      expect(spinner).toHaveClass('gap-1');
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
      const spinners = screen.getAllByRole('status');
      expect(spinners).toHaveLength(3);

      const [smallSpinner, mediumSpinner, largeSpinner] = spinners;

      expect(smallSpinner).toHaveClass('w-8', 'h-8');
      expect(mediumSpinner).toHaveClass('w-12', 'h-12');
      expect(largeSpinner).toHaveClass('w-16', 'h-16');
    });
  });
});
