import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Alert } from './Alert';
import userEvent from '@testing-library/user-event';

describe('Alert', () => {
  const defaultProps = {
    children: 'Alert message content',
  };

  describe('rendering', () => {
    it('should render alert element', () => {
      render(<Alert {...defaultProps} />);
      expect(screen.getByText('Alert message content')).toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(<Alert {...defaultProps} title="Alert Title" />);
      expect(screen.getByText('Alert Title')).toBeInTheDocument();
      expect(screen.getByText('Alert Title')).toHaveClass('font-semibold');
    });

    it('should not render title when not provided', () => {
      render(<Alert {...defaultProps} />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should render info variant by default', () => {
      render(<Alert {...defaultProps} />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
    });

    it('should render info variant explicitly', () => {
      render(<Alert {...defaultProps} variant="info" />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('bg-blue-50', 'border-blue-200', 'text-blue-800');
    });

    it('should render success variant', () => {
      render(<Alert {...defaultProps} variant="success" />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('bg-green-50', 'border-green-200', 'text-green-800');
    });

    it('should render warning variant', () => {
      render(<Alert {...defaultProps} variant="warning" />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('bg-yellow-50', 'border-yellow-200', 'text-yellow-800');
    });

    it('should render error variant', () => {
      render(<Alert {...defaultProps} variant="error" />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('bg-red-50', 'border-red-200', 'text-red-800');
    });
  });

  describe('icons', () => {
    it('should render icon for info variant', () => {
      render(<Alert {...defaultProps} variant="info" />);
      // Look for SVG element inside a div with the color class
      const container = screen.getByText('Alert message content').parentElement?.parentElement;
      const iconContainer = container?.querySelector('div');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('flex-shrink-0', 'mr-3', 'text-blue-600');
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render icon for success variant', () => {
      render(<Alert {...defaultProps} variant="success" />);
      const container = screen.getByText('Alert message content').parentElement?.parentElement;
      const iconContainer = container?.querySelector('div');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('flex-shrink-0', 'mr-3', 'text-green-600');
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render icon for warning variant', () => {
      render(<Alert {...defaultProps} variant="warning" />);
      const container = screen.getByText('Alert message content').parentElement?.parentElement;
      const iconContainer = container?.querySelector('div');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('flex-shrink-0', 'mr-3', 'text-yellow-600');
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should render icon for error variant', () => {
      render(<Alert {...defaultProps} variant="error" />);
      const container = screen.getByText('Alert message content').parentElement?.parentElement;
      const iconContainer = container?.querySelector('div');
      expect(iconContainer).toBeInTheDocument();
      expect(iconContainer).toHaveClass('flex-shrink-0', 'mr-3', 'text-red-600');
      expect(iconContainer?.querySelector('svg')).toBeInTheDocument();
    });

    it('should apply correct color to icon based on variant', () => {
      const { rerender } = render(<Alert {...defaultProps} variant="info" />);
      let container = screen.getByText('Alert message content').parentElement?.parentElement;
      let iconContainer = container?.querySelector('div');
      expect(iconContainer).toHaveClass('text-blue-600');

      rerender(<Alert {...defaultProps} variant="success" />);
      container = screen.getByText('Alert message content').parentElement?.parentElement;
      iconContainer = container?.querySelector('div');
      expect(iconContainer).toHaveClass('text-green-600');

      rerender(<Alert {...defaultProps} variant="warning" />);
      container = screen.getByText('Alert message content').parentElement?.parentElement;
      iconContainer = container?.querySelector('div');
      expect(iconContainer).toHaveClass('text-yellow-600');

      rerender(<Alert {...defaultProps} variant="error" />);
      container = screen.getByText('Alert message content').parentElement?.parentElement;
      iconContainer = container?.querySelector('div');
      expect(iconContainer).toHaveClass('text-red-600');
    });
  });

  describe('dismiss button', () => {
    it('should not render dismiss button when onDismiss is not provided', () => {
      render(<Alert {...defaultProps} />);
      expect(screen.queryByLabelText('Dismiss')).not.toBeInTheDocument();
    });

    it('should render dismiss button when onDismiss is provided', () => {
      render(<Alert {...defaultProps} onDismiss={vi.fn()} />);
      expect(screen.getByLabelText('Dismiss')).toBeInTheDocument();
    });

    it('should call onDismiss when dismiss button is clicked', async () => {
      const handleDismiss = vi.fn();
      const user = userEvent.setup();

      render(<Alert {...defaultProps} onDismiss={handleDismiss} />);
      const dismissButton = screen.getByLabelText('Dismiss');
      await user.click(dismissButton);

      expect(handleDismiss).toHaveBeenCalledTimes(1);
    });

    it('should have opacity transition on dismiss button hover', () => {
      render(<Alert {...defaultProps} onDismiss={vi.fn()} />);
      const dismissButton = screen.getByLabelText('Dismiss');
      expect(dismissButton).toHaveClass('opacity-60', 'hover:opacity-100', 'transition-opacity');
    });
  });

  describe('base styles', () => {
    it('should have base alert styles', () => {
      render(<Alert {...defaultProps} />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('flex', 'items-start', 'p-4', 'rounded-lg', 'border');
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<Alert {...defaultProps} className="custom-class" />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('custom-class');
    });

    it('should preserve base styles with custom className', () => {
      render(<Alert {...defaultProps} className="custom-class" />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('flex', 'items-start', 'custom-class');
    });
  });

  describe('children', () => {
    it('should render string children', () => {
      render(<Alert>Simple message</Alert>);
      expect(screen.getByText('Simple message')).toBeInTheDocument();
    });

    it('should render JSX children', () => {
      render(
        <Alert>
          <p>Paragraph 1</p>
          <p>Paragraph 2</p>
        </Alert>
      );
      expect(screen.getByText('Paragraph 1')).toBeInTheDocument();
      expect(screen.getByText('Paragraph 2')).toBeInTheDocument();
    });

    it('should render component children', () => {
      const ChildComponent = () => <span>Child content</span>;
      render(<Alert><ChildComponent /></Alert>);
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('should render children in text-sm class', () => {
      render(<Alert>Content</Alert>);
      // Content is in a div with text-sm class inside flex-1 div
      const contentDiv = screen.getByText('Content');
      expect(contentDiv).toHaveClass('text-sm');
    });
  });

  describe('title with content layout', () => {
    it('should render title above content when both provided', () => {
      render(
        <Alert title="Title" onDismiss={vi.fn()}>
          Content goes here
        </Alert>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();

      // Title should have font-semibold class
      const title = screen.getByText('Title');
      expect(title).toHaveClass('font-semibold', 'mb-1');

      // Content should be in the same content div
      const contentDiv = screen.getByText('Content goes here').parentElement;
      expect(contentDiv).toBeInTheDocument();
    });
  });

  describe('flex layout', () => {
    it('should have proper flex layout for icon and content', () => {
      render(<Alert {...defaultProps} />);
      const alert = screen.getByText('Alert message content').parentElement?.parentElement;
      expect(alert).toHaveClass('flex', 'items-start');

      // Icon container should have flex-shrink-0
      const iconContainer = alert?.querySelector('div');
      expect(iconContainer).toHaveClass('flex-shrink-0', 'mr-3');

      // Content div should have flex-1
      const contentDiv = screen.getByText('Alert message content').parentElement;
      expect(contentDiv).toHaveClass('flex-1');
    });
  });

  describe('dismiss button in flex layout', () => {
    it('should place dismiss button with ml-3 class', () => {
      render(<Alert {...defaultProps} onDismiss={vi.fn()} />);
      const dismissButton = screen.getByLabelText('Dismiss');
      expect(dismissButton).toHaveClass('ml-3', 'flex-shrink-0');
    });
  });

  describe('multiple alerts', () => {
    it('should render multiple alerts independently', () => {
      render(
        <div>
          <Alert variant="info">Info message</Alert>
          <Alert variant="success">Success message</Alert>
          <Alert variant="error">Error message</Alert>
        </div>
      );

      // Use variant classes to differentiate alerts
      const alerts = screen.getAllByRole('generic'); // divs don't have specific roles
      expect(alerts.length).toBeGreaterThanOrEqual(3);
      // Check that different variants exist
      expect(screen.getByText('Info message').closest('[class*="bg-blue-50"]')).toBeInTheDocument();
      expect(screen.getByText('Success message').closest('[class*="bg-green-50"]')).toBeInTheDocument();
      expect(screen.getByText('Error message').closest('[class*="bg-red-50"]')).toBeInTheDocument();
    });
  });
});
