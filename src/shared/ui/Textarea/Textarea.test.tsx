import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Textarea } from './Textarea';
import userEvent from '@testing-library/user-event';

describe('Textarea', () => {
  describe('rendering', () => {
    it('should render textarea element', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea.tagName).toBe('TEXTAREA');
    });

    it('should be resizable by default', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('resize-y');
    });
  });

  describe('label', () => {
    it('should render label when provided', () => {
      render(<Textarea label="Your message" />);
      expect(screen.getByLabelText('Your message')).toBeInTheDocument();
    });

    it('should not render label when not provided', () => {
      render(<Textarea />);
      expect(screen.queryByRole('label')).not.toBeInTheDocument();
    });

    it('should associate label with textarea using htmlFor', () => {
      render(<Textarea id="test-textarea" label="Test Label" />);
      const label = screen.getByText('Test Label');
      const textarea = screen.getByRole('textbox');
      expect(label).toHaveAttribute('for', 'test-textarea');
      expect(textarea).toHaveAttribute('id', 'test-textarea');
    });

    it('should generate unique id for textarea if not provided', () => {
      render(<Textarea label="Label 1" />);
      render(<Textarea label="Label 2" />);
      const label1 = screen.getByText('Label 1');
      const label2 = screen.getByText('Label 2');
      const textareas = screen.getAllByRole('textbox');
      expect(label1).toHaveAttribute('for', textareas[0].id);
      expect(label2).toHaveAttribute('for', textareas[1].id);
      expect(textareas[0].id).not.toBe(textareas[1].id);
    });
  });

  describe('error state', () => {
    it('should display error message when error prop is provided', () => {
      render(<Textarea error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('should not display error message when error prop is not provided', () => {
      render(<Textarea />);
      expect(screen.queryByText(/required/)).not.toBeInTheDocument();
    });

    it('should apply error styling to textarea when error is present', () => {
      render(<Textarea error="Error message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-[color:var(--color-error)]', 'focus-visible:ring-[color:var(--color-error)]');
      expect(textarea).not.toHaveClass('border-[color:var(--color-border)]');
    });

    it('should apply default styling when no error', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('border-[color:var(--color-border)]');
      expect(textarea).not.toHaveClass('border-[color:var(--color-error)]');
    });
  });

  describe('interactions', () => {
    it('should call onChange when user types', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Textarea onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test value');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should call onFocus when textarea is focused', async () => {
      const handleFocus = vi.fn();
      const user = userEvent.setup();

      render(<Textarea onFocus={handleFocus} />);
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should call onBlur when textarea loses focus', async () => {
      const handleBlur = vi.fn();
      const user = userEvent.setup();

      render(<Textarea onBlur={handleBlur} />);
      const textarea = screen.getByRole('textbox');
      await user.click(textarea);
      await user.tab();

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('value handling', () => {
    it('should display provided value', () => {
      const handleChange = vi.fn();
      render(<Textarea value="Test value" onChange={handleChange} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Test value');
    });

    it('should be controlled with value prop', async () => {
      const handleChange = vi.fn();
      const { rerender } = render(<Textarea value="Initial" onChange={handleChange} />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Initial');

      rerender(<Textarea value="Updated" onChange={handleChange} />);
      expect(textarea.value).toBe('Updated');
    });

    it('should support default value (uncontrolled)', async () => {
      const user = userEvent.setup();
      render(<Textarea defaultValue="Default" />);
      const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
      expect(textarea.value).toBe('Default');

      await user.clear(textarea);
      await user.type(textarea, 'Changed');
      expect(textarea.value).toBe('Changed');
    });
  });

  describe('multi-line input', () => {
    it('should support multiple lines of text', async () => {
      const user = userEvent.setup();
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'Line 1{Enter}Line 2{Enter}Line 3');

      expect(textarea).toHaveValue('Line 1\nLine 2\nLine 3');
    });
  });

  describe('rows and cols', () => {
    it('should support rows attribute', () => {
      render(<Textarea rows={5} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('rows', '5');
    });

    it('should support cols attribute', () => {
      render(<Textarea cols={40} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('cols', '40');
    });

    it('should support maxLength attribute', () => {
      render(<Textarea maxLength={100} />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('maxlength', '100');
    });
  });

  describe('placeholder', () => {
    it('should display placeholder text', () => {
      render(<Textarea placeholder="Enter your message" />);
      const textarea = screen.getByPlaceholderText('Enter your message');
      expect(textarea).toBeInTheDocument();
    });
  });

  describe('disabled state', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toBeDisabled();
    });

    it('should apply disabled styling', () => {
      render(<Textarea disabled />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should not allow typing when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Textarea disabled onChange={handleChange} />);
      const textarea = screen.getByRole('textbox');
      await user.type(textarea, 'test');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('readOnly state', () => {
    it('should be readonly when readOnly prop is true', () => {
      render(<Textarea readOnly />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('readonly');
    });
  });

  describe('custom className', () => {
    it('should apply custom className', () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole('textbox');
      // className is applied to textarea element directly
      expect(textarea).toHaveClass('custom-class');
    });
  });

  describe('base styles', () => {
    it('should have base textarea styles', () => {
      render(<Textarea />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveClass(
        'w-full', 'px-3', 'py-2', 'rounded-md', 'border',
        'focus-visible:outline-none', 'focus-visible:ring-2', 'focus-visible:ring-black',
        'focus-visible:border-transparent', 'transition-colors'
      );
    });
  });

  describe('accessibility', () => {
    it('should support aria-required', () => {
      render(<Textarea aria-required="true" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-required', 'true');
    });

    it('should support aria-invalid', () => {
      render(<Textarea aria-invalid="true" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-invalid', 'true');
    });

    it('should support aria-describedby for error message', () => {
      render(<Textarea error="Error message" aria-describedby="error-desc" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-describedby', 'error-desc');
    });

    it('should support aria-label', () => {
      render(<Textarea aria-label="Message input" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('aria-label', 'Message input');
    });
  });

  describe('name attribute', () => {
    it('should support name attribute for form submission', () => {
      render(<Textarea name="message" />);
      const textarea = screen.getByRole('textbox');
      expect(textarea).toHaveAttribute('name', 'message');
    });
  });
});
