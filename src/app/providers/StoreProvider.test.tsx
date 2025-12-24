import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from './StoreProvider';

describe('StoreProvider', () => {
  describe('rendering', () => {
    it('should render children after hydration (client-side environment)', async () => {
      render(
        <StoreProvider>
          <div data-testid="test-child">Test Child</div>
        </StoreProvider>
      );

      // In jsdom (client-side), hydration is instant
      // Children should be rendered immediately
      expect(screen.getByTestId('test-child')).toBeInTheDocument();
      expect(screen.getByText('Test Child')).toBeInTheDocument();
    });

    it('should render children immediately in client-side environment', () => {
      render(
        <StoreProvider>
          <div data-testid="child">Child Content</div>
        </StoreProvider>
      );

      // In jsdom, hydration is instant - children are visible immediately
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('should render multiple children', async () => {
      render(
        <StoreProvider>
          <div data-testid="child-1">First Child</div>
          <div data-testid="child-2">Second Child</div>
          <button data-testid="child-button">Click Me</button>
        </StoreProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-button')).toBeInTheDocument();
    });

    it('should render nested components', () => {
      const NestedComponent = () => <div data-testid="nested">Nested Content</div>;

      render(
        <StoreProvider>
          <div>
            <NestedComponent />
          </div>
        </StoreProvider>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });
  });

  describe('hydration behavior', () => {
    it('should render children after hydration completes', () => {
      render(
        <StoreProvider>
          <div data-testid="child-content">Content</div>
        </StoreProvider>
      );

      // Children should be visible after hydration
      expect(screen.getByText('Content')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle empty children', () => {
      const { container } = render(<StoreProvider>{null}</StoreProvider>);

      // Container should exist but be empty
      expect(container.firstChild).toBeNull();
    });

    it('should handle fragment children', () => {
      render(
        <StoreProvider>
          <>
            <div data-testid="fragment-1">First</div>
            <div data-testid="fragment-2">Second</div>
          </>
        </StoreProvider>
      );

      expect(screen.getByTestId('fragment-1')).toBeInTheDocument();
      expect(screen.getByTestId('fragment-2')).toBeInTheDocument();
    });

    it('should handle children with text content only', () => {
      render(
        <StoreProvider>
          Plain text content
        </StoreProvider>
      );

      expect(screen.getByText('Plain text content')).toBeInTheDocument();
    });
  });

  describe('state management', () => {
    it('should keep children rendered once hydrated', () => {
      const { rerender } = render(
        <StoreProvider>
          <div data-testid="child">Child</div>
        </StoreProvider>
      );

      expect(screen.getByTestId('child')).toBeInTheDocument();

      // Rerender with same children
      rerender(
        <StoreProvider>
          <div data-testid="child">Child</div>
        </StoreProvider>
      );

      // Children should still be there
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });
  });

  describe('re-renders', () => {
    it('should update children on re-render', () => {
      const { rerender } = render(
        <StoreProvider>
          <div data-testid="child-1">First Version</div>
        </StoreProvider>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();

      // Re-render with different children
      rerender(
        <StoreProvider>
          <div data-testid="child-2">Second Version</div>
        </StoreProvider>
      );

      // New children should be visible
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.queryByTestId('child-1')).not.toBeInTheDocument();
    });
  });

  describe('unmount behavior', () => {
    it('should clean up on unmount', () => {
      const { unmount } = render(
        <StoreProvider>
          <div data-testid="child">Content</div>
        </StoreProvider>
      );

      unmount();

      // After unmount, nothing should be in the document
      expect(screen.queryByTestId('child')).not.toBeInTheDocument();
    });
  });

  describe('component purpose', () => {
    it('should provide a wrapper component for store hydration', () => {
      // This test documents the purpose of StoreProvider:
      // In client-side apps (like Vite), it ensures proper hydration pattern
      // even though hydration is instant in the test environment
      render(
        <StoreProvider>
          <div data-testid="app-content">App Content</div>
        </StoreProvider>
      );

      // Verify the provider renders its children
      expect(screen.getByTestId('app-content')).toBeInTheDocument();
    });

    it('should handle React rendering lifecycle correctly', () => {
      const renderSpy = vi.fn();
      const TestComponent = () => {
        renderSpy();
        return <div data-testid="test">Test Component</div>;
      };

      render(
        <StoreProvider>
          <TestComponent />
        </StoreProvider>
      );

      // Component should be rendered
      expect(screen.getByTestId('test')).toBeInTheDocument();
      // Component render function should have been called
      expect(renderSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should allow errors from children to propagate', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      // Note: This test verifies that StoreProvider doesn't catch errors
      expect(() => {
        render(
          <StoreProvider>
            <ThrowError />
          </StoreProvider>
        );
      }).toThrow('Test error');
    });
  });
});
