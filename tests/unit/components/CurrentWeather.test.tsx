import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import CurrentWeather from '../../../src/components/CurrentWeather';
import UnitToggle from '../../../src/components/UnitToggle';
import type { City, CurrentWeather as CurrentWeatherData, Unit } from '../../../src/types/weather';

const city: City = {
  id: 1,
  name: 'Campinas',
  latitude: -22.9,
  longitude: -47.06,
};

const current: CurrentWeatherData = {
  temperatureC: 25.4,
  weatherCode: 2,
  observedAt: '2026-10-29T14:00',
  humidityPercent: 68,
  windSpeedKmh: 12.5,
  precipitationMm: 0,
  pressureHpa: 1014.2,
};

describe('CurrentWeather', () => {
  it('renders the city, condition, temperature and weather metrics', () => {
    render(<CurrentWeather city={city} current={current} unit="celsius" />);

    expect(screen.getByRole('heading', { name: 'Campinas' })).toBeInTheDocument();
    expect(screen.getByText('25 °C')).toBeInTheDocument();
    expect(screen.getByText('Parcialmente nublado')).toBeInTheDocument();
    expect(screen.getByText('68 %')).toBeInTheDocument();
    expect(screen.getByText('12,5 km/h')).toBeInTheDocument();
    expect(screen.getByText('0 mm')).toBeInTheDocument();
    expect(screen.getByText('1.014,2 hPa')).toBeInTheDocument();
  });

  it('formats the hero temperature in the selected unit', () => {
    render(<CurrentWeather city={city} current={current} unit="fahrenheit" />);

    expect(screen.getByText('78 °F')).toBeInTheDocument();
  });

  it('updates CurrentWeather to 32°F when °F is selected for 0°C', async () => {
    const user = userEvent.setup();

    function WeatherWithUnitToggle() {
      const [unit, setUnit] = useState<Unit>('celsius');

      return (
        <>
          <UnitToggle unit={unit} onChange={setUnit} />
          <CurrentWeather city={city} current={{ ...current, temperatureC: 0 }} unit={unit} />
        </>
      );
    }

    render(<WeatherWithUnitToggle />);
    await user.click(screen.getByRole('button', { name: 'Fahrenheit' }));

    expect(screen.getByText('32 °F')).toBeInTheDocument();
  });

  it('marks the entire current block unavailable when temperature is missing', () => {
    render(
      <CurrentWeather
        city={city}
        current={{
          temperatureC: null,
          weatherCode: null,
          observedAt: null,
          humidityPercent: null,
          windSpeedKmh: null,
          precipitationMm: null,
          pressureHpa: null,
        }}
        unit="celsius"
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Clima atual indisponível');
    expect(screen.queryByText('Condição indisponível')).not.toBeInTheDocument();
    expect(screen.queryByText('Umidade')).not.toBeInTheDocument();
  });

  it('marks the entire current block unavailable when temperature is missing', () => {
    render(
      <CurrentWeather city={city} current={{ ...current, temperatureC: null }} unit="celsius" />,
    );

    expect(screen.getByText('Clima atual indisponível')).toBeInTheDocument();
    expect(screen.queryByText('Parcialmente nublado')).not.toBeInTheDocument();
    expect(screen.queryByText('68 %')).not.toBeInTheDocument();
  });
});
