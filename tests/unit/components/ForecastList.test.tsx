import { render, screen } from '@testing-library/react';
import ForecastList from '../../../src/components/ForecastList';
import { mockWeatherData } from '../../../src/mocks/weather';

describe('ForecastList', () => {
  it('renders five daily cards with conditions and rain probability', () => {
    render(<ForecastList days={mockWeatherData.forecast} unit="celsius" />);

    expect(screen.getAllByRole('article')).toHaveLength(5);
    expect(screen.getByText('Predominantemente limpo')).toBeInTheDocument();
    expect(screen.getAllByText('Máx.')).toHaveLength(5);
    expect(screen.getAllByText('Mín.')).toHaveLength(5);
    expect(screen.getByText('10%')).toBeInTheDocument();
  });

  it('formats maximum and minimum temperatures in the selected unit', () => {
    render(<ForecastList days={mockWeatherData.forecast} unit="fahrenheit" />);

    expect(screen.getByText('81 °F')).toBeInTheDocument();
    expect(screen.getByText('65 °F')).toBeInTheDocument();
  });

  it('shows unavailable values for an empty forecast', () => {
    render(<ForecastList days={[]} unit="celsius" />);

    expect(screen.getByText('Previsão indisponível.')).toBeInTheDocument();
    expect(screen.queryByRole('article')).not.toBeInTheDocument();
  });
});
