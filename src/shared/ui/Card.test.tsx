import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  describe('rendering', () => {
    it('should render card element', () => {
      render(<Card>Card content</Card>);
      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('should render single child', () => {
      render(<Card children={<p>Single child</p>} />);
      expect(screen.getByText('Single child')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <Card>
          <p>First child</p>
          <p>Second child</p>
          <button>Button</button>
        </Card>
      );
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
    });

    it('should render nested components', () => {
      const NestedComponent = () => <div data-testid="nested">Nested content</div>;
      render(<Card><NestedComponent /></Card>);
      expect(screen.getByTestId('nested')).toBeInTheDocument();
    });
  });

  describe('padding', () => {
    it('should render with medium padding by default', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-6');
    });

    it('should render with no padding when padding="none"', () => {
      const { container } = render(<Card padding="none">Content</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('p-4', 'p-6', 'p-8');
    });

    it('should render with small padding when padding="sm"', () => {
      const { container } = render(<Card padding="sm">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-4');
    });

    it('should render with medium padding when padding="md"', () => {
      const { container } = render(<Card padding="md">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-6');
    });

    it('should render with large padding when padding="lg"', () => {
      const { container } = render(<Card padding="lg">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-8');
    });
  });

  describe('border', () => {
    it('should render with border by default', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('border', 'border-gray-200');
    });

    it('should render with border when bordered={true}', () => {
      const { container } = render(<Card bordered>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('border', 'border-gray-200');
    });

    it('should render without border when bordered={false}', () => {
      const { container } = render(<Card bordered={false}>Content</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('border', 'border-gray-200');
    });
  });

  describe('shadow', () => {
    it('should render with small shadow by default', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('shadow-sm');
    });

    it('should render with no shadow when shadow="none"', () => {
      const { container } = render(<Card shadow="none">Content</Card>);
      const card = container.firstChild;
      expect(card).not.toHaveClass('shadow-sm', 'shadow-md', 'shadow-lg');
    });

    it('should render with small shadow when shadow="sm"', () => {
      const { container } = render(<Card shadow="sm">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('shadow-sm');
    });

    it('should render with medium shadow when shadow="md"', () => {
      const { container } = render(<Card shadow="md">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('shadow-md');
    });

    it('should render with large shadow when shadow="lg"', () => {
      const { container } = render(<Card shadow="lg">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('shadow-lg');
    });
  });

  describe('base styles', () => {
    it('should have base card styles', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-lg');
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('custom-class');
    });

    it('should preserve base styles with custom className', () => {
      const { container } = render(<Card className="custom-class">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('bg-white', 'rounded-lg', 'custom-class');
    });
  });

  describe('combining props', () => {
    it('should combine padding, border, and shadow props', () => {
      const { container } = render(<Card padding="lg" bordered={false} shadow="md">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveClass('p-8', 'bg-white', 'rounded-lg', 'shadow-md');
      expect(card).not.toHaveClass('border');
    });
  });

  describe('HTML attributes', () => {
    it('should support standard HTML attributes', () => {
      const { container } = render(<Card id="test-card" role="article">Content</Card>);
      const card = container.firstChild;
      expect(card).toHaveAttribute('id', 'test-card');
      expect(card).toHaveAttribute('role', 'article');
    });

    it('should support data attributes', () => {
      render(<Card data-testid="test-card">Content</Card>);
      expect(screen.getByTestId('test-card')).toBeInTheDocument();
    });

    it('should support onClick handler', async () => {
      const handleClick = vi.fn();
      const { container } = render(<Card onClick={handleClick}>Content</Card>);
      const card = container.firstChild as HTMLElement;
      if (card) {
        card.click();
        expect(handleClick).toHaveBeenCalled();
      }
    });
  });

  describe('nested cards', () => {
    it('should support nested card components', () => {
      render(
        <Card>
          <p>Outer card content</p>
          <Card shadow="none" bordered={false}>
            <p>Inner card content</p>
          </Card>
        </Card>
      );
      expect(screen.getByText('Outer card content')).toBeInTheDocument();
      expect(screen.getByText('Inner card content')).toBeInTheDocument();
    });
  });

  describe('empty card', () => {
    it('should render with no children', () => {
      const { container } = render(<Card />);
      const card = container.firstChild;
      expect(card).toBeInTheDocument();
      expect(card).toHaveClass('bg-white', 'rounded-lg');
    });
  });
});
