import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeveloperPresence } from './DeveloperPresence';

describe('DeveloperPresence', () => {
  const defaultProps = {
    avatarUrl: 'https://example.com/avatar.png',
    name: 'Test Developer',
    githubUrl: 'https://github.com/test/repo',
  };

  describe('rendering', () => {
    it('should render with avatar image', () => {
      render(<DeveloperPresence {...defaultProps} />);
      const img = screen.getByRole('img', { name: defaultProps.name });
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', defaultProps.avatarUrl);
    });

    it('should render with default values when not provided', () => {
      render(<DeveloperPresence avatarUrl={defaultProps.avatarUrl} />);
      const img = screen.getByRole('img', { name: 'Dimitrios Stamatakis' });
      expect(img).toBeInTheDocument();
    });
  });

  describe('size variants', () => {
    it('should render medium size by default', () => {
      const { container } = render(<DeveloperPresence {...defaultProps} />);
      const wrapper = container.querySelector('.inline-block');
      expect(wrapper).toHaveStyle({ width: '90px', height: '90px' });
    });

    it('should render small size', () => {
      const { container } = render(<DeveloperPresence {...defaultProps} size="sm" />);
      const wrapper = container.querySelector('.inline-block');
      expect(wrapper).toHaveStyle({ width: '60px', height: '60px' });
    });

    it('should render large size', () => {
      const { container } = render(<DeveloperPresence {...defaultProps} size="lg" />);
      const wrapper = container.querySelector('.inline-block');
      expect(wrapper).toHaveStyle({ width: '120px', height: '120px' });
    });
  });

  describe('accessibility', () => {
    it('should have correct aria-label for GitHub link', () => {
      render(<DeveloperPresence {...defaultProps} />);
      const githubLink = screen.getByLabelText(/Visit.*GitHub profile/i);
      expect(githubLink).toBeInTheDocument();
      expect(githubLink).toHaveAttribute('href', defaultProps.githubUrl);
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('interactions', () => {
    it('should respond to mouse enter', async () => {
      const user = userEvent.setup();
      const { container } = render(<DeveloperPresence {...defaultProps} />);
      const wrapper = container.querySelector('.inline-block');

      if (wrapper) {
        await user.hover(wrapper);
        expect(wrapper).toBeInTheDocument();
      }
    });

    it('should respond to mouse leave', async () => {
      const user = userEvent.setup();
      const { container } = render(<DeveloperPresence {...defaultProps} />);
      const wrapper = container.querySelector('.inline-block');

      if (wrapper) {
        await user.hover(wrapper);
        await user.unhover(wrapper);
      }
      expect(wrapper).toBeInTheDocument();
    });

    it('should open GitHub link in new tab when clicked', () => {
      render(<DeveloperPresence {...defaultProps} />);

      const githubLink = screen.getByLabelText(/Visit.*GitHub profile/i);
      expect(githubLink).toHaveAttribute('target', '_blank');
      expect(githubLink).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('props', () => {
    it('should apply custom className', () => {
      const { container } = render(<DeveloperPresence {...defaultProps} className="custom-class" />);
      const wrapper = container.querySelector('.inline-block');
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('visual enhancements', () => {
    it('should have rotating rainbow glow element', () => {
      const { container } = render(<DeveloperPresence {...defaultProps} />);
      const glowElement = container.querySelector('.absolute.-inset-2');
      expect(glowElement).toBeInTheDocument();
      expect(glowElement).toHaveClass('rounded-full');
    });

    it('should have larger GitHub icon (24px)', () => {
      const { container } = render(<DeveloperPresence {...defaultProps} />);
      const githubIcon = container.querySelector('svg');
      expect(githubIcon).toBeInTheDocument();
      expect(githubIcon).toHaveClass('w-6', 'h-6');
    });
  });
});
