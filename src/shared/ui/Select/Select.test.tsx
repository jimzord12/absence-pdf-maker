import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select } from './Select';
import userEvent from '@testing-library/user-event';

describe('Select', () => {
  const mockOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
  ];

  describe('rendering', () => {
    it('should render select element', () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('should render all provided options', () => {
      render(<Select options={mockOptions} />);
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument();
    });

    it('should use correct value for each option', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toContainHTML('value="option1"');
      expect(select).toContainHTML('value="option2"');
      expect(select).toContainHTML('value="option3"');
    });
  });

  describe('label', () => {
    it('should render label when provided', () => {
      render(<Select label="Choose an option" options={mockOptions} />);
      expect(screen.getByLabelText('Choose an option')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      render(<Select options={mockOptions} />);
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('should associate label with select using htmlFor', () => {
      render(<Select id="test-select" label="Test Label" options={mockOptions} />);
      const label = screen.getByText('Test Label');
      const select = screen.getByRole('combobox');
      expect(label).toHaveAttribute('for', 'test-select');
      expect(select).toHaveAttribute('id', 'test-select');
    });

    it('should generate unique id for select if not provided', () => {
      render(<Select label="Label 1" options={mockOptions} />);
      render(<Select label="Label 2" options={mockOptions} />);
      const label1 = screen.getByText('Label 1');
      const label2 = screen.getByText('Label 2');
      const selects = screen.getAllByRole('combobox');
      expect(label1).toHaveAttribute('for', selects[0].id);
      expect(label2).toHaveAttribute('for', selects[1].id);
      expect(selects[0].id).not.toBe(selects[1].id);
    });
  });

  describe('placeholder', () => {
    it('should render placeholder option when provided', () => {
      render(<Select placeholder="Select an option" options={mockOptions} />);
      // Check that the placeholder option exists in the select
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      const placeholderOption = Array.from(select.options).find(
        (opt) => opt.textContent === 'Select an option'
      );
      expect(placeholderOption).toBeInTheDocument();
      expect(placeholderOption).toHaveAttribute('value', '');
    });

    it('should make placeholder option disabled', () => {
      render(<Select placeholder="Select an option" options={mockOptions} />);
      const placeholderOption = screen.getByRole('option', { name: 'Select an option' });
      expect(placeholderOption).toBeDisabled();
    });

    it('should not render placeholder when not provided', () => {
      render(<Select options={mockOptions} />);
      expect(screen.queryByRole('option', { name: /Select/ })).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message when error prop is provided', () => {
      render(<Select options={mockOptions} error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should not display error message when error prop is not provided', () => {
      render(<Select options={mockOptions} />);
      expect(screen.queryByText(/required/)).not.toBeInTheDocument();
    });

    it('should apply error styling to select when error is present', () => {
      render(<Select options={mockOptions} error="Error message" />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-[color:var(--color-error)]', 'focus-visible:ring-[color:var(--color-error)]');
      expect(select).not.toHaveClass('border-[color:var(--color-border)]');
    });

    it('should apply default styling when no error', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('border-[color:var(--color-border)]');
      expect(select).not.toHaveClass('border-[color:var(--color-error)]');
    });
  });

  describe('value handling', () => {
    it('should display provided value', () => {
      const handleChange = vi.fn();
      render(<Select options={mockOptions} value="option2" onChange={handleChange} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option2');
    });

    it('should be controlled with value prop', async () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Select options={mockOptions} value="option1" onChange={handleChange} />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option1');

      rerender(<Select options={mockOptions} value="option3" onChange={handleChange} />);
      expect(select.value).toBe('option3');
    });

    it('should support default value (uncontrolled)', async () => {
      const user = userEvent.setup();
      render(<Select options={mockOptions} defaultValue="option1" />);
      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('option1');

      await user.selectOptions(select, 'option2');
      expect(select.value).toBe('option2');
    });
  });

  describe('interactions', () => {
    it('should call onChange when user selects an option', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Select options={mockOptions} onChange={handleChange} />);
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, 'option2');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onFocus when select is focused', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();

      render(<Select options={mockOptions} onFocus={handleFocus} />);
      const select = screen.getByRole('combobox');
      await user.click(select);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when select loses focus', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(<Select options={mockOptions} onBlur={handleBlur} />);
      const select = screen.getByRole('combobox');
      await user.click(select);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Select options={mockOptions} disabled />);
      const select = screen.getByRole('combobox');
      expect(select).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      render(<Select options={mockOptions} disabled />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<Select options={mockOptions} className="custom-class" />);
      const select = screen.getByRole('combobox');
      // className is applied to select element directly
      expect(select).toHaveClass('custom-class');
    });
  });

  describe('base styles', () => {
    it('should have base select styles', () => {
      render(<Select options={mockOptions} />);
      const select = screen.getByRole('combobox');
      expect(select).toHaveClass(
        'w-full', 'px-3', 'py-2', 'rounded-md', 'border',
        'bg-[color:var(--color-surface)]',
        'focus-visible:outline-none', 'focus-visible:ring-2',
        'focus-visible:ring-offset-2', 'focus-visible:ring-[color:var(--color-primary)]',
        'focus-visible:border-transparent',
        'disabled:opacity-50', 'disabled:cursor-not-allowed',
        'focus-visible:ring-offset-[color:var(--color-background)]',
        'transition-colors', 'text-[color:var(--color-text-primary)]',
        'border-[color:var(--color-border)]'
      );
    });
  });

  describe('multiple selections', () => {
    it('should support multiple attribute', () => {
      render(<Select options={mockOptions} multiple />);
      const select = screen.getByRole('listbox');
      expect(select).toBeInTheDocument();
    });
  });

  describe('empty options', () => {
    it('should render select with no options', () => {
      render(<Select options={[]} />);
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
    });
  });
});
