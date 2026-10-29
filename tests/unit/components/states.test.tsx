import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EmptyState from '../../../src/components/states/EmptyState';
import ErrorState from '../../../src/components/states/ErrorState';
import LoadingState from '../../../src/components/states/LoadingState';

describe('consulta states', () => {
  it('announces loading with a non-empty status message', () => {
    render(<LoadingState />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando...');
  });

  it('announces an empty title and hint without retry', () => {
    render(<EmptyState title="Nenhuma cidade encontrada" hint="Tente outro nome." />);

    expect(screen.getByRole('status')).toHaveTextContent('Nenhuma cidade encontrada');
    expect(screen.getByRole('status')).toHaveTextContent('Tente outro nome.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('announces the error and invokes retry by keyboard', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(<ErrorState message="Não foi possível carregar o clima." onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o clima.');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Tentar novamente' })).toHaveFocus();
    await user.keyboard('{Enter}');

    expect(onRetry).toHaveBeenCalledExactlyOnceWith();
  });
});
