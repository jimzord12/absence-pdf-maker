import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StarsWarsRobotToggle } from './StarsWarsRobotToggle';

describe('StarsWarsRobotToggle', () => {
  it('renders correctly with default props', () => {
    render(<StarsWarsRobotToggle />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(false);
    expect(checkbox.disabled).toBe(false);
  });

  it('renders with checked state', () => {
    render(<StarsWarsRobotToggle checked={true} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

    expect(checkbox.checked).toBe(true);
  });

  it('renders with disabled state', () => {
    render(<StarsWarsRobotToggle disabled={true} />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

    expect(checkbox.disabled).toBe(true);
  });

  it('calls onChange when clicked', async () => {
    const handleChange = vi.fn();
    render(<StarsWarsRobotToggle checked={false} onChange={handleChange} />);

    const label = screen.getByLabelText('Toggle theme');
    await userEvent.click(label);

    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it('applies custom className', () => {
    render(<StarsWarsRobotToggle className="custom-class" />);
    const label = screen.getByLabelText('Toggle theme');

    expect(label).toHaveClass('custom-class');
  });

  it('has correct ARIA attributes', () => {
    render(<StarsWarsRobotToggle checked={false} aria-label="Dark mode toggle" />);
    const checkbox = screen.getByRole('checkbox');

    expect(checkbox).not.toBeChecked();
  });

  it('forwards ref correctly', () => {
    let ref: HTMLInputElement | null = null;
    render(<StarsWarsRobotToggle ref={(el) => { ref = el; }} />);

    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
    expect(ref).toBe(checkbox);
  });
});
