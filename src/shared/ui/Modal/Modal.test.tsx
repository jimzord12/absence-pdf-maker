import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    children: <div>Modal content</div>,
  };

  beforeEach(() => {
    // Reset body styles before each test
    document.body.style.overflow = '';
  });

  describe('rendering', () => {
    it('should render when isOpen is true', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(<Modal {...defaultProps} isOpen={false} />);
      expect(screen.queryByText('Modal content')).not.toBeInTheDocument();
    });

    it('should render title when provided', () => {
      render(<Modal {...defaultProps} title="Modal Title" />);
      expect(screen.getByText('Modal Title')).toBeInTheDocument();
    });

    it('should render close button by default', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('should not render close button when showCloseButton is false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('should render header section when title is provided', () => {
      render(<Modal {...defaultProps} title="Title" />);
      expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    it('should not render header section when neither title nor showCloseButton', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('close behavior', () => {
    it('should call onClose when close button is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const closeButton = screen.getByLabelText('Close modal');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked (default)', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      // The backdrop is the container with backdrop-blur-sm
      const backdrop = document.querySelector('.backdrop-blur-sm');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not call onClose when modal content is clicked', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      const content = screen.getByText('Modal content').parentElement;
      if (content) {
        fireEvent.click(content);
        expect(onClose).not.toHaveBeenCalled();
      }
    });

    it('should not call onClose when backdrop is clicked if closeOnBackdropClick is false', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} closeOnBackdropClick={false} />);

      const backdrop = document.querySelector('.backdrop-blur-sm');
      if (backdrop) {
        fireEvent.click(backdrop);
        expect(onClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('ESC key handling', () => {
    it('should call onClose when ESC key is pressed', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when ESC key is pressed if modal is closed', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} isOpen={false} />);

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(onClose).not.toHaveBeenCalled();
    });

    it('should not call onClose when other keys are pressed', () => {
      const onClose = vi.fn();
      render(<Modal {...defaultProps} onClose={onClose} />);

      fireEvent.keyDown(document, { key: 'Enter' });

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('body scroll handling', () => {
    it('should disable body scroll when modal is open', () => {
      render(<Modal {...defaultProps} />);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should restore body scroll when modal is closed', () => {
      const { rerender } = render(<Modal {...defaultProps} />);
      rerender(<Modal {...defaultProps} isOpen={false} />);
      expect(document.body.style.overflow).toBe('');
    });

    it('should restore body scroll on unmount', () => {
      const { unmount } = render(<Modal {...defaultProps} />);
      unmount();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('event listener cleanup', () => {
    it('should remove event listeners when modal closes', () => {
      const onClose = vi.fn();
      const { rerender } = render(<Modal {...defaultProps} onClose={onClose} />);

      // First event should trigger
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);

      // Close modal
      rerender(<Modal {...defaultProps} onClose={onClose} isOpen={false} />);

      // Second event should not trigger
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('children rendering', () => {
    it('should render single child', () => {
      render(<Modal {...defaultProps} children={<p>Single child</p>} />);
      expect(screen.getByText('Single child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Modal {...defaultProps}>
          <p>First child</p>
          <p>Second child</p>
          <button>Button</button>
        </Modal>
      );
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
    });

    it('should render nested components', () => {
      const NestedComponent = () => <div data-testid="nested">Nested</div>;
      render(
        <Modal {...defaultProps}>
          <NestedComponent />
        </Modal>
      );
      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });
  });

  describe('backdrop styling', () => {
    it('should render backdrop with correct classes', () => {
      render(<Modal {...defaultProps} />);
      const backdrop = document.querySelector('.backdrop-blur-sm');
      expect(backdrop).toHaveClass(
        'fixed', 'inset-0', 'z-50', 'flex', 'items-center', 'justify-center',
        'p-4', 'bg-black/50', 'backdrop-blur-sm'
      );
    });
  });

  describe('modal content styling', () => {
    it('should render content with correct classes', () => {
      render(<Modal {...defaultProps} />);
      // Content is inside a div with flex-1 px-6 py-4 overflow-y-auto
      // We need to get the parent of that div
      const innerDiv = screen.getByText('Modal content').parentElement;
      const contentWrapper = innerDiv?.parentElement;
      expect(contentWrapper).toHaveClass(
        'relative', 'w-full', 'max-w-lg', 'bg-white', 'rounded-lg',
        'shadow-lg', 'max-h-[90vh]', 'overflow-hidden', 'flex', 'flex-col'
      );
    });
  });

  describe('header section', () => {
    it('should render header with title and close button', () => {
      render(<Modal {...defaultProps} title="Test Title" />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });

    it('should render header with title only when showCloseButton is false', () => {
      render(<Modal {...defaultProps} title="Test Title" showCloseButton={false} />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.queryByLabelText('Close modal')).not.toBeInTheDocument();
    });

    it('should not render header when title is not provided and showCloseButton is false', () => {
      render(<Modal {...defaultProps} showCloseButton={false} />);
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('close button accessibility', () => {
    it('should have aria-label for close button', () => {
      render(<Modal {...defaultProps} />);
      expect(screen.getByLabelText('Close modal')).toBeInTheDocument();
    });
  });

  describe('title accessibility', () => {
    it('should render title as h2 heading', () => {
      render(<Modal {...defaultProps} title="Accessible Title" />);
      const heading = screen.getByRole('heading', { level: 2, name: 'Accessible Title' });
      expect(heading).toBeInTheDocument();
    });
  });
});
