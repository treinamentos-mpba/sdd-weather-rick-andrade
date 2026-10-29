import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UnitToggle from '../../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('exposes a labelled group and marks the active unit', () => {
    render(<UnitToggle unit="celsius" onChange={vi.fn()} />);

    expect(screen.getByRole('group', { name: 'Unidade de temperatura' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  it('notifies the selected unit when a button is clicked', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UnitToggle unit="celsius" onChange={onChange} />);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(onChange).toHaveBeenCalledExactlyOnceWith('fahrenheit');
  });

  it('moves focus and changes the unit with arrow keys', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<UnitToggle unit="celsius" onChange={onChange} />);
    await user.tab();
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();

    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenLastCalledWith('fahrenheit');
    expect(screen.getByRole('button', { name: 'Fahrenheit' })).toHaveFocus();

    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenLastCalledWith('celsius');
    expect(screen.getByRole('button', { name: 'Celsius' })).toHaveFocus();
  });
});
