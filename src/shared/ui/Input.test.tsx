import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';
import userEvent from '@testing-library/user-event';

describe('Input', () => {
  describe('rendering', () => {
    it('should render input element', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    it('should render with default text type', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render with email type', () => {
      render(<Input inputType="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render with tel type', () => {
      render(<Input inputType="tel" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'tel');
    });

    it('should render with number type', () => {
      render(<Input inputType="number" />);
      const input = screen.getByRole('spinbutton');
      expect(input).toBeInTheDocument();
    });

    it('should render with password type', () => {
      const { container } = render(<Input inputType="password" />);
      const input = container.querySelector('input[type="password"]') as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input.type).toBe('password');
    });
  });

  describe('label', () => {
    it('should render label when provided', () => {
      render(<Input label="Email address" />);
      expect(screen.getByLabelText('Email address')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      render(<Input />);
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('should associate label with input using htmlFor', () => {
      render(<Input id="test-input" label="Test Label" />);
      const label = screen.getByText('Test Label');
      const input = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'test-input');
      expect(input).toHaveAttribute('id', 'test-input');
    });

    it('should generate unique id for input if not provided', () => {
      render(<Input label="Label 1" />);
      render(<Input label="Label 2" />);
      const label1 = screen.getByText('Label 1');
      const label2 = screen.getByText('Label 2');
      const inputs = screen.getAllByRole('textbox');
      expect(label1).toHaveAttribute('for', inputs[0].id);
      expect(label2).toHaveAttribute('for', inputs[1].id);
      expect(inputs[0].id).not.toBe(inputs[1].id);
    });
  });

  describe('error state', () => {
    it('should display error message when error prop is provided', () => {
      render(<Input error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should not display error message when error prop is not provided', () => {
      render(<Input />);
      expect(screen.queryByText(/required/)).not.toBeInTheDocument();
    });

    it('should apply error styling to input when error is present', () => {
      render(<Input error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-red-500', 'focus:ring-red-500');
      expect(input).not.toHaveClass('border-gray-300');
    });

    it('should apply default styling when no error', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-gray-300');
      expect(input).not.toHaveClass('border-red-500');
    });
  });

  describe('interactions', () => {
    it('should call onChange when user types', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test value');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onFocus when input is focused', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();

      render(<Input onFocus={handleFocus} />);
      const input = screen.getByRole('textbox');
      await user.click(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when input loses focus', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(<Input onBlur={handleBlur} />);
      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('value handling', () => {
    it('should display provided value', () => {
      const handleChange = vi.fn();
      render(<Input value="Test value" onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Test value');
    });

    it('should be controlled with value prop', async () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Input value="Initial" onChange={handleChange} />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Initial');

      rerender(<Input value="Updated" onChange={handleChange} />);
      expect(input.value).toBe('Updated');
    });

    it('should support default value (uncontrolled)', async () => {
      const user = userEvent.setup();
      render(<Input defaultValue="Default" />);
      const input = screen.getByRole('textbox') as HTMLInputElement;
      expect(input.value).toBe('Default');

      await user.clear(input);
      await user.type(input, 'Changed');
      expect(input.value).toBe('Changed');
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should not allow typing when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Input disabled onChange={handleChange} />);
      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('placeholder', () => {
    it('should display placeholder text', () => {
      render(<Input placeholder="Enter your email" />);
      const input = screen.getByPlaceholderText('Enter your email');
      expect(input).toBeInTheDocument();
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<Input className="custom-class" />);
      const input = screen.getByRole('textbox');
      // className is applied to the input element directly, not the wrapper
      expect(input).toHaveClass('custom-class');
    });
  });

  describe('base styles', () => {
    it('should have base input styles', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass(
        'w-full', 'px-3', 'py-2', 'rounded-md', 'border',
        'focus:outline-none', 'focus:ring-2', 'focus:ring-black',
        'focus:border-transparent', 'transition-colors'
      );
    });
  });

  describe('accessibility', () => {
    it('should support aria-required', () => {
      render(<Input aria-required="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should support aria-invalid', () => {
      render(<Input aria-invalid="true" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support aria-describedby for error message', () => {
      render(<Input error="Error message" aria-describedby="error-desc" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('aria-describedby', 'error-desc');
    });
  });
});
